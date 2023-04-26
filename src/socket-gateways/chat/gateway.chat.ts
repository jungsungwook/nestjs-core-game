import { ConnectedSocket, MessageBody, SubscribeMessage, WebSocketGateway, WebSocketServer } from "@nestjs/websockets";
import { Server, Socket } from "socket.io";
import { RedisCacheService } from "src/cache/redis.service";
import { BroadcastService } from "src/pages/users/broadcast/broadcast.service";
import { UsersService } from "src/pages/users/users.service";

@WebSocketGateway(8080, {
    transports: ['websocket'],
    cors: {
        origin: '*',
    },
})
export class ChatGateWay {
    constructor(
        private userService: UsersService,
        private broadcastService: BroadcastService,
        private redisService: RedisCacheService,
    ) { }
    @WebSocketServer()
    server: Server;

    @SubscribeMessage('send_chat')
    async handleChat(
        @MessageBody() data: { message: string},
        @ConnectedSocket() client: Socket
    ) {
        try {
            const userCustomId = await this.redisService.get(client.id);
            if(!userCustomId) throw new Error('User not found');

            if(!data.message) throw new Error('Message is undefined');
            if(data.message.length > 100) throw new Error('Message is too long');
            if(data.message == '') throw new Error('Message is empty');
            
            const returnObj = {
                type:"message",
                message: data.message,
                sender: userCustomId,
            }
            this.server.emit('receive_chat', returnObj);
        } catch (err) {
            client.emit('error', err.message);
        }
    }

}