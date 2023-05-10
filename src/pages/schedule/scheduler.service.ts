import { Injectable } from "@nestjs/common";
import { Server, Socket } from "socket.io";
import { Cron, CronExpression, SchedulerRegistry } from "@nestjs/schedule";
import { CronJob } from "cron";
import { UsersService } from "../users/users.service";
import { WebSocketServer } from "@nestjs/websockets";
import { CoreGateway } from "src/socket-gateways/gateway.core";
import { MatchService } from "../match/match.service";
import { MatchStatus, MatchDto, MatchType } from "../match/dto/match.dto";
import { MatchGateway } from "src/socket-gateways/match/gateway.match";
import { async } from "rxjs";

@Injectable()
export class SchedulerService {
    constructor(
        private schedulerRegistry: SchedulerRegistry,
        private usersService: UsersService,
        private matchService: MatchService,
        private coreGateway: CoreGateway,
        private matchGateway: MatchGateway,
    ) { }

    async createCronJob(name: string, time: string, callback: () => void) {
        const job = new CronJob(time, callback);

        this.schedulerRegistry.addCronJob(name, job);
        job.start();
    }

    async deleteCronJob(name: string) {
        const job = this.schedulerRegistry.getCronJob(name);
        job.stop();
        this.schedulerRegistry.deleteCronJob(name);
    }

    async getCronJob(name: string) {
        return this.schedulerRegistry.getCronJob(name);
    }

    /**
     * @description
     * - 1분 간격으로 접속한 유저와 접속하지 않은 유저를 구분함.
     * - 접속이 끊긴 유저의 소켓을 제거.
     */
    @Cron(CronExpression.EVERY_10_SECONDS, {
        name: "disconnect-user-cron",
    })
    async disconnectUserCron() {
        const allUsers = (await this.usersService.getAllUsers()).contents;
        const socket = await this.coreGateway.getClients();
        const disconnectedUser = [];
        const connectedUser = [];

        for (let i = 0; i < allUsers.length; i++) {
            const user = allUsers[i];
            const isHas = socket.has(user.socketId);
            if (isHas) {
                connectedUser.push(user);
            } else {
                disconnectedUser.push(user);
            }
        }

        disconnectedUser.forEach(async (user) => {
            if (user.socketId === null) return;
            await this.usersService.updateDisconnectSocketId(user.customId);
        });
    }

    /**
     * @description
     * - Match Queue에 있는 유저들을 매칭시킴.
     * @todo
     * - 매치 성사 시 history를 DB에 저장함.
     */
    @Cron(CronExpression.EVERY_5_SECONDS, {
        name: "match-queue-cron",
    })
    async matchQueueCron() {
        const queue : MatchDto[] = await this.matchService.getMatchQueue(MatchType.RANDOM_MATCH_1ON1);
        
        if (!queue) return;
        await this.matchService.updateMatchQueue(MatchType.RANDOM_MATCH_1ON1, []);

        for (const match of queue) {
            if (match.join_user.length >= 2) {
                if (match.join_user.length > 2) {
                    const overUsers: string[] = match.join_user.splice(2, match.join_user.length - 2);
                    this.matchService.replaceMatchQueue(overUsers);
                }
                match.match_status = MatchStatus.MATCH_SUCCESS;
                match.match_end_time = new Date();
                const broadUserInfo = [];
                for(const userId of match.join_user) {
                    const user = (await this.usersService.getUserByCustomId(userId)).contents;
                    if (!user || user.socketId === null) {
                        match.match_status = MatchStatus.MATCH_START;
                        match.match_end_time = null;
                        match.join_user.splice(match.join_user.indexOf(userId), 1);
                        break;
                    }
                    broadUserInfo.push({
                        userId: userId,
                        socketId: user.socketId,
                    });
                }
                if (match.match_status === MatchStatus.MATCH_SUCCESS) {
                    broadUserInfo.forEach(async(user) => {
                        await this.matchGateway.broadcastMatchinfo(
                            MatchStatus.MATCH_SUCCESS,
                            user.socketId,
                            user.customId,
                            match
                        );
                    });
                    queue.splice(queue.indexOf(match), 1);
                }
            }
        }

        const nowQueue = await this.matchService.getMatchQueue(MatchType.RANDOM_MATCH_1ON1);
        await this.matchService.updateMatchQueue(MatchType.RANDOM_MATCH_1ON1, [...nowQueue, ...queue]);
    }
}