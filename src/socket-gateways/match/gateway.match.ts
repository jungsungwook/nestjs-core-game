import { WebSocketGateway, WebSocketServer } from "@nestjs/websockets";
import { Server } from "socket.io";

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
}