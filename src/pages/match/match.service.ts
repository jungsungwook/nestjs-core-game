import { Injectable } from "@nestjs/common";
import { Server, Socket } from "socket.io";
import { RedisCacheService } from "src/cache/redis.service";
import { MatchStatus, MatchDto, MatchType } from "./dto/match.dto";
import { generateSessionId } from "src/utils/util";
import { MatchGateway } from "src/socket-gateways/match/gateway.match";
import { UsersService } from "../users/users.service";
/**
 * @todo
 * - 클라이언트에서 자신이 속한 매치 대기열을 요청할 수 있도록 함.
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
                await this.matchGateway.broadcastMatchinfo(MatchStatus.MATCH_CHANGE ,socketId, customId, match);
            });
        }
        catch (e) {
            throw new Error(e);
        }
    }

    async randomMatch_1on1_queue(customId: string) {
        try {
            const queue: MatchDto[] = await this.redisService.get(MatchType.RANDOM_MATCH_1ON1 + "_queue");

            if (!queue) {
                const newQueue: MatchDto[] = [];
                const matchId = generateSessionId();
                const newMatch: MatchDto = {
                    match_id: matchId,
                    match_type: "random_match_1on1",
                    match_status: MatchStatus.MATCH_START,
                    match_start_time: new Date(),
                    match_end_time: null,
                    join_user: [customId],
                };
                newQueue.push(newMatch);
                await this.redisService.set(MatchType.RANDOM_MATCH_1ON1 + "_queue", newQueue);
                return newMatch;
            }

            const match: MatchDto = queue.find((match: MatchDto) => match.match_status === MatchStatus.MATCH_START && match.join_user.length < 2);
            if (match) {
                match.join_user.push(customId);
                await this.redisService.set(MatchType.RANDOM_MATCH_1ON1 + "_queue", queue);
                return match;
            }else{
                const matchId = generateSessionId();
                const newMatch: MatchDto = {
                    match_id: matchId,
                    match_type: "random_match_1on1",
                    match_status: MatchStatus.MATCH_START,
                    match_start_time: new Date(),
                    match_end_time: null,
                    join_user: [customId],
                };
                queue.push(newMatch);
                await this.redisService.set(MatchType.RANDOM_MATCH_1ON1 + "_queue", queue);
                return newMatch;
            }
        } catch (e) {
            throw new Error(e);
        }
    }

    async createMatch_1on1(socket: Socket, server: Server) {

    }

    async joinMatch_1on1(socket: Socket, server: Server) {

    }

    async leaveMatch_1on1(socket: Socket, server: Server) {
    }

    async getMatch_1on1(socket: Socket, server: Server) {

    }
}