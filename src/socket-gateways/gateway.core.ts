import {
    MessageBody,
    SubscribeMessage,
    WebSocketGateway,
    WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway(8080, { 
    transports: ['websocket'] ,
    cors: {
        origin: '*',
    },
})
export class CoreGateway {
    @WebSocketServer()
    server: Server;

    @SubscribeMessage('ClientToServer')
    async handleMessage(@MessageBody() data) {
        const returnText = 'Server received: ' + data;
        console.log(returnText);
        this.server.emit('ServerToClient', returnText);
    }

    @SubscribeMessage('ping')
    async handlePing(@MessageBody() data) {
        this.server.emit('pong', 'pong');
    }

    async getClients(){
        const socket = this.server.sockets.sockets;
        return socket;
    }
}