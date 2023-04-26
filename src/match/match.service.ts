import { Injectable } from "@nestjs/common";
import { Server, Socket } from "socket.io";

@Injectable()
export class MatchService {
    constructor(){}

    async serverBroadcast(server: Server, channel: string, data: any){
        server.emit(channel, data);
    }
}