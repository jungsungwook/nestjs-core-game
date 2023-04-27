import { Injectable } from "@nestjs/common";
import { Server, Socket } from "socket.io";
import { Cron, CronExpression, SchedulerRegistry } from "@nestjs/schedule";
import { CronJob } from "cron";
import { UsersService } from "../users/users.service";
import { WebSocketServer } from "@nestjs/websockets";
import { CoreGateway } from "src/socket-gateways/gateway.core";

@Injectable()
export class SchedulerService {
    constructor(
        private schedulerRegistry: SchedulerRegistry,
        private usersService: UsersService,
        private gateway: CoreGateway
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
        const socket = await this.gateway.getClients();
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
}