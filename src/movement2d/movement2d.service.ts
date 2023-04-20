import { Injectable } from "@nestjs/common";
import { Server, Socket } from "socket.io";

@Injectable()
export class Movement2dService {
    constructor(){}

    async move2d(server: Server, channel: string, data: any){
        server.emit(channel, data);
    }
}