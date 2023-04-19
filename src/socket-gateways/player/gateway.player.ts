import {
    ConnectedSocket,
    MessageBody,
    SubscribeMessage,
    WebSocketGateway,
    WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

/**
 * 본인의 캐릭터와 다른 플레이어의 캐릭터 정보를 주고 받는 게이트웨이
 * @Todo
 * 1. 본인의 캐릭터 정보를 Broadcast
 * 2. 다른 플레이어의 캐릭터 정보를 Broadcast
 * 3. 본인의 캐릭터 정보를 특정 플레이어에게 전송
 * 4. 다른 플레이어의 캐릭터 정보를 특정 플레이어에게 전송
 * 
 * @Memo
 * - 데드레커닝은 충돌체로 인한 위치 정보가 바뀌지 않을 때 사용하기에 적합하다.
 */
@WebSocketGateway(8080, { 
    transports: ['websocket'] ,
    cors: {
        origin: '*',
    },
})
export class PlayerGateway {
    @WebSocketServer()
    server: Server;

    @SubscribeMessage('player')
    async handlePlayerData(
        @MessageBody() data,
        @ConnectedSocket() client: Socket,
    ) {
        const returnText = 'Server received: ' + data;
        console.log(returnText);
        this.server.emit('returnPlayer', returnText);
    }
}