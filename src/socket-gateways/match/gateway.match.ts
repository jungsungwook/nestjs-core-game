import { WebSocketGateway, WebSocketServer } from "@nestjs/websockets";
import { Server } from "socket.io";
import { InfoType, MatchDto } from "src/pages/match/dto/match.dto";

@WebSocketGateway(8080, {
    transports: ['websocket'],
    cors: {
        origin: '*',
    },
})
export class MatchGateway {
    constructor() { }
    @WebSocketServer()
    server: Server;

    async broadcastMatchinfo(
        info_type: InfoType,
        socketId: string,
        userId: string,
        matchInfo: MatchDto
    ) {
        this.server.to(socketId).emit(info_type, {
            userId: userId,
            matchInfo: matchInfo,
        });
    }
}