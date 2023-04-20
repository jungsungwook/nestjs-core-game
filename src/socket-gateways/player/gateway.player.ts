import { Req } from '@nestjs/common';
import {
    ConnectedSocket,
    MessageBody,
    SubscribeMessage,
    WebSocketGateway,
    WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { UsersService } from 'src/pages/users/users.service';

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
    constructor(
        private userService: UsersService,
    ) {}
    @WebSocketServer()
    server: Server;

    async handleConnection(client: Socket) {
        const reqHeaders = client.handshake.headers;
        // if(!reqHeaders.refreshToken) throw new Error('No refreshToken');
        try{
            const user = await this.userService.getUser(reqHeaders.refresh_token as string, reqHeaders.custom_id as string);
            if(user.statusCode == '404') throw new Error('User not found');
            const userObj = user.contents;
            const socketId = client.id;
            const socketIdUpdate = await this.userService.socketIdUpdate(userObj, socketId);
            if(socketIdUpdate.statusCode == '404') throw new Error('User not found');
            console.log('PlayerGateway: ' + userObj.customId + ' connected');
        }
        catch(e){
            console.log(e);
            client.disconnect();
        }
    }

    async handleDisconnect(client: Socket) {
        const reqHeaders = client.handshake.headers;
        try{
            const socketIdUpdate = await this.userService.disconnectSocketId(client.id);
            if(socketIdUpdate.statusCode == '404') throw new Error('User not found');
            console.log('PlayerGateway: ' + socketIdUpdate.contents.customId + ' disconnected');
        }
        catch(e){
            client.disconnect();
        }
    }

    /**
     * 
     * @Description
     * 2Directional Movement (2D)를 처리하는 메소드
     */
    @SubscribeMessage('move2d')
    async handleMove2d(
        @MessageBody() data,
        @ConnectedSocket() client: Socket,
    ) {
        const returnText = 'Server received: ' + data;
        console.log(returnText);
        this.server.emit('returnMove2d', returnText);
    }
}