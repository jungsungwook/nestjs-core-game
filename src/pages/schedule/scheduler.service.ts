import { Injectable } from "@nestjs/common";
import { Server, Socket } from "socket.io";
import { Cron, CronExpression, SchedulerRegistry } from "@nestjs/schedule";
import { CronJob } from "cron";
import { UsersService } from "../users/users.service";
import { WebSocketServer } from "@nestjs/websockets";
import { CoreGateway } from "src/socket-gateways/gateway.core";
import { MatchService } from "../match/match.service";
import { MatchDto, MatchType } from "../match/dto/match.dto";
import { MatchGateway } from "src/socket-gateways/match/gateway.match";

@Injectable()
export class SchedulerService {
    constructor(
        private schedulerRegistry: SchedulerRegistry,
        private usersService: UsersService,
        private matchService: MatchService,
        private coreGateway: CoreGateway,
        private matchGateway: MatchGateway,
    ){}

    async createCronJob(name:string, time:string, callback: () => void){
        const job = new CronJob(time, callback);

        this.schedulerRegistry.addCronJob(name, job);
        job.start();
    }

    async deleteCronJob(name:string){
        const job = this.schedulerRegistry.getCronJob(name);
        job.stop();
        this.schedulerRegistry.deleteCronJob(name);
    }

    async getCronJob(name:string){
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
    async disconnectUserCron(){
        const allUsers = (await this.usersService.getAllUsers()).contents;
        const socket = await this.coreGateway.getClients();
        const disconnectedUser = [];
        const connectedUser = [];

        for(let i = 0; i < allUsers.length; i++){
            const user = allUsers[i];
            const isHas = socket.has(user.socketId);
            if(isHas){
                connectedUser.push(user);
            }else{
                disconnectedUser.push(user);
            }
        }

        disconnectedUser.forEach(async (user) => {
            if(user.socketId === null) return;
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
    async matchQueueCron(){
        const queue = await this.matchService.getMatchQueue(MatchType.RANDOM_MATCH_1ON1);
        if(!queue) return;
        
        // 1. match_status가 waiting인 것
        // 2. join_user가 2명 이상인 것
        const matches: MatchDto[] = queue.filter((match: MatchDto) => match.match_status === "waiting" && match.join_user.length >= 2);

        // 1. join_user가 딱 2명일 경우, match_status를 matched로 변경
        // 그런 다음 join_user에 있는 유저들의 socketId를 가져와서 매칭된 유저들에게 매칭이 되었다는 메시지를 보냄.
        // 마지막으로 queue에서 해당 match를 삭제함.
        matches.forEach(element => {
            if(element.join_user.length === 2){
                // const socketIds = element.join_user.map((user) => user.socketId);
                // this.gateway.sendToUsers(socketIds, "match", {
                //     match: element
                // });
            }else if(element.join_user.length > 2){
                // 2. join_user가 2명 이상일 경우, 초과된 유저들을 따로 뺌.
                // 그런 다음 join_user에 있는 유저들의 socketId를 가져와서 매칭된 유저들에게 매칭이 되었다는 메시지를 보냄.
                // 마지막으로 queue에서 해당 match를 삭제함.
                const overUsers:string[] = element.join_user.splice(2, element.join_user.length - 2);
                this.matchService.replaceMatchQueue(overUsers);
                // const socketIds = element.join_user.map((user) => user.socketId);
                // this.matchGateway.sendToUsers(socketIds, "match", {
                //     match: element
                // });
            }
            element.match_status = "matched";
            element.match_end_time = new Date();
            queue.splice(queue.indexOf(element), 1);
        });
        await this.matchService.updateMatchQueue(MatchType.RANDOM_MATCH_1ON1, queue);
        
    }
}