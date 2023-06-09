import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { Server, Socket } from "socket.io";
import { RedisCacheService } from "src/cache/redis.service";
import { MatchStatus, MatchDto, MatchType, MatchCreateDto, MatchJoinDto, CustomMatchDto } from "./dto/match.dto";
import { generateSessionId } from "src/utils/util";
import { MatchGateway } from "src/socket-gateways/match/gateway.match";
import { UsersService } from "../users/users.service";
import { UserInfo, UserStatus } from "../users/dto/user-info.dto";
/**
 * @todo
 * @notice
 * - 모든 대기열이나 방들은 Redis 에 저장되어야 한다.
 * - 끝에 _queue 를 붙여서 저장한다.
 */
@Injectable()
export class MatchService {
    constructor(
        private redisService: RedisCacheService,
        private matchGateway: MatchGateway,
        private usersService: UsersService,
    ) { }

    async updateMatchQueue(matchType: MatchType, queue: MatchDto[]): Promise<void> {
        try {
            await this.redisService.set(matchType + "_queue", queue);
        } catch (e) {
            throw new Error(e);
        }
    }

    async getMatchQueue(matchType: string): Promise<MatchDto[]> {
        try {
            const queue: MatchDto[] = await this.redisService.get(matchType + "_queue");
            return queue;
        }
        catch (e) {
            throw new Error(e);
        }
    }

    // Cron 에서 유저를 다른 매치로 옮기는 작업을 수행할 때 사용한다.
    async replaceMatchQueue(customIds: string[]): Promise<void> {
        try {
            customIds.forEach(async (customId: string) => {
                const match = await this.randomMatch_1on1_queue(customId);
                const socketId = (await this.usersService.getUser(customId)).contents.socketId;
                await this.matchGateway.broadcastMatchinfo(MatchStatus.MATCH_CHANGE, socketId, customId, match);
            });
        }
        catch (e) {
            throw new Error(e);
        }
    }

    async randomMatch_1on1_queue(customId: string) {
        try {
            const user = await this.usersService.getUserByCustomId(customId);
            const queue: MatchDto[] = await this.redisService.get(MatchType.RANDOM_MATCH_1ON1 + "_queue");

            if (!queue) {
                const newQueue: MatchDto[] = [];
                const matchId = generateSessionId();
                const newMatch: MatchDto = {
                    match_id: matchId,
                    match_type: MatchType.RANDOM_MATCH_1ON1,
                    match_status: MatchStatus.MATCH_START,
                    match_start_time: new Date(),
                    match_end_time: null,
                    join_user: [customId],
                };
                newQueue.push(newMatch);
                await this.redisService.set(MatchType.RANDOM_MATCH_1ON1 + "_queue", newQueue);
                this.matchGateway.broadcastMatchinfo(MatchStatus.MATCH_START, user.contents.socketId, customId, newMatch);
                return newMatch;
            }

            const match: MatchDto = queue.find((match: MatchDto) => match.match_status === MatchStatus.MATCH_START && match.join_user.length < 2);
            if (match) {
                match.join_user.push(customId);
                await this.redisService.set(MatchType.RANDOM_MATCH_1ON1 + "_queue", queue);
                this.matchGateway.broadcastMatchinfo(MatchStatus.MATCH_START, user.contents.socketId, customId, match);
                return match;
            } else {
                const matchId = generateSessionId();
                const newMatch: MatchDto = {
                    match_id: matchId,
                    match_type: MatchType.RANDOM_MATCH_1ON1,
                    match_status: MatchStatus.MATCH_START,
                    match_start_time: new Date(),
                    match_end_time: null,
                    join_user: [customId],
                };
                queue.push(newMatch);
                await this.redisService.set(MatchType.RANDOM_MATCH_1ON1 + "_queue", queue);
                this.matchGateway.broadcastMatchinfo(MatchStatus.MATCH_START, user.contents.socketId, customId, newMatch);
                return newMatch;
            }
        } catch (e) {
            throw new Error(e);
        }
    }

    async createCustomMatch(customId: string, dto: MatchCreateDto) {
        try {
            const user = await this.usersService.getUserByCustomId(customId);
            const user_status: UserInfo = await this.redisService.get(customId + "_info");
            if (
                !user_status
                || !user_status.status
                || user_status.status == UserStatus.CUSTOM_MATCHING
                || user_status.status == UserStatus.MATCHING_SUCCESS
                || user_status.status == UserStatus.RANDOM_MATCHING
                || user_status.status == UserStatus.OFFLINE
            ) throw new Error("방을 생성할 수 없습니다.");
            const match: CustomMatchDto = {
                match_id: generateSessionId(),
                match_type: dto.match_type,
                match_status: MatchStatus.MATCH_START,
                match_start_time: new Date(),
                match_end_time: null,
                join_user: [customId],
                match_title: dto.match_title,
                match_private: dto.match_private,
                match_owner: customId,
            }
            if(match.match_private) match.match_password = dto.match_password;
            
            await this.redisService.push(dto.match_type + "_queue", match);
            await this.matchGateway.broadcastMatchinfo(MatchStatus.MATCH_CREATE, user.contents.socketId, customId, match);
            return match;
        } catch (e) {
            throw new Error(e);
        }
    }

    async joinCustomMatch(body: MatchJoinDto, customId: string) {
        try {
            const user = await this.usersService.getUserByCustomId(customId);
            const user_status: UserInfo = await this.redisService.get(customId + "_info");
            if (
                !user_status
                || !user_status.status
                || user_status.status == UserStatus.CUSTOM_MATCHING
                || user_status.status == UserStatus.MATCHING_SUCCESS
                || user_status.status == UserStatus.RANDOM_MATCHING
                || user_status.status == UserStatus.OFFLINE
            ) throw new Error("방에 참여할 수 없습니다.");
            const match: CustomMatchDto = await this.getCustomMatch(body.match_id);
            if (!match) throw new Error("방이 존재하지 않습니다.");
            if (match.join_user.length >= 2) throw new Error("방이 꽉 찼습니다.");
            if (match.match_private){
                if (match.match_password != body.match_password) throw new Error("비밀번호가 틀렸습니다.");
            }
            match.join_user.push(customId);
            await this.redisService.set(match.match_type + "_queue", match);
            await this.matchGateway.broadcastMatchinfo(MatchStatus.MATCH_JOIN, user.contents.socketId, customId, match);
            return match;
        } catch (e) {
            throw new Error(e);
        }
    }

    async leaveMatch_1on1(socket: Socket, server: Server) {
    }

    async getCustomMatches() {
        const matches: MatchDto[] = [];
        for (const type in MatchType) {
            const match: MatchDto[] = await this.redisService.get(type + "_queue");
            if(match) matches.push(...match);
        }

        if(!matches) return [];
        return matches;
    }

    async getCustomMatch(matchId: string): Promise<CustomMatchDto> {
        const matches: CustomMatchDto[] = [];
        for (const type in MatchType) {
            const match: CustomMatchDto[] = await this.redisService.get(type + "_queue");
            if(match) matches.push(...match);
        }
        if(!matches) throw new HttpException("방이 존재하지 않습니다.", HttpStatus.BAD_REQUEST);
        const match: CustomMatchDto = matches.find((match: CustomMatchDto) => match.match_id === matchId);
        return match;
    }

    async getMyMatchProgress(customId: string) {
        try {
            let match_type: string[] = Object.values(MatchType);
            match_type.forEach(async (type: string) => {
                const matches: MatchDto[] = await this.redisService.get(type + "_queue");
                if (matches) {
                    const match: MatchDto = matches.find((match: MatchDto) => match.join_user.includes(customId));
                    if (match) {
                        return match;
                    }
                }
            });
            return null
        } catch (e) {
            throw new Error(e);
        }
    }
}