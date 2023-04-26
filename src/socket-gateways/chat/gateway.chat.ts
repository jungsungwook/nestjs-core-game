import { ConnectedSocket, MessageBody, SubscribeMessage, WebSocketGateway, WebSocketServer } from "@nestjs/websockets";
import { Server, Socket } from "socket.io";
import { RedisCacheService } from "src/cache/redis.service";
import { BroadcastService } from "src/pages/broadcast/broadcast.service";
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
        @MessageBody() data: { message: string },
        @ConnectedSocket() client: Socket
    ) {
        try {
            const userCustomId = await this.redisService.get(client.id);
            if (!userCustomId) throw new Error('User not found');

            if (!data.message) throw new Error('Message is undefined');
            if (data.message.replace(/\s/g, '').length == 0) throw new Error('Message is empty');
            if (data.message.length > 100) throw new Error('Message is too long');

            const returnObj = {
                type: "message",
                message: data.message,
                sender: userCustomId,
                timestamp: new Date().getTime(),
            }
            const chatLog: Object[] = await this.redisService.get('chatLog');
            await this.redisService.set('chatLog', [...chatLog, returnObj]);

            this.server.emit('receive_chat', returnObj);
        } catch (err) {
            client.emit('error', err.message);
        }
    }

}