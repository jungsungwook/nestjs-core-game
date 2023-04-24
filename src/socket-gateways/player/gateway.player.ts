import {
    ConnectedSocket,
    MessageBody,
    SubscribeMessage,
    WebSocketGateway,
    WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { UsersService } from 'src/pages/users/users.service';
import { Movement2dService } from 'src/movement2d/movement2d.service';
import { BroadcastService } from 'src/pages/users/broadcast/broadcast.service';
import { RedisCacheService } from 'src/cache/redis.service';
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
        private broadcastService: BroadcastService,
        private movemoent2dService: Movement2dService,
        private redisService: RedisCacheService,
    ) {}
    @WebSocketServer()
    server: Server;

    async handleConnection(client: Socket) {
        const reqHeaders = client.handshake.headers;
        // if(!reqHeaders.refreshToken) throw new Error('No refreshToken');
        try{
            const user = await this.userService.getUser(reqHeaders.refresh_token as string);
            if(user.statusCode == '404') throw new Error('User not found');
            const userObj = user.contents;
            const socketId = client.id;
            const socketIdUpdate = await this.userService.socketIdUpdate(userObj, socketId);
            if(socketIdUpdate.statusCode == '404') throw new Error('User not found');
            await this.redisService.set(socketId, userObj.customId);
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
            const check = await this.redisService.get(client.id);
            if(check){
                await this.redisService.del(client.id);
            }
        }
        catch(e){
            client.disconnect();
        }
    }

    /**
     * @Description
     * 2Directional Movement (2D)를 처리하는 메소드.
     * 키보드 입력을 받아서 처리함.
     */
    @SubscribeMessage('move2d_key')
    async handleMove2d(
        @MessageBody() data,
        @ConnectedSocket() client: Socket,
    ) {
        try{
            const userCustomId = await this.redisService.get(client.id);
            if(!userCustomId) throw new Error('User not found');
            const result = await this.movemoent2dService.move2d_key(this.server, 'returnMove2dKey', userCustomId, data.key);
        }catch(e){
            client.disconnect();
        }
        
    }

    /**
     * @Description
     * 2Directional Movement (2D)를 처리하는 메소드.
     * 이동 방향을 받아서 처리함.
     */
    @SubscribeMessage('move2d_direction')
    async handleMove2dDirection(
        @MessageBody() data,
        @ConnectedSocket() client: Socket,
    ) {
        try{
            const userCustomId = await this.redisService.get(client.id);
            if(!userCustomId) throw new Error('User not found');
            const result = await this.movemoent2dService.move2d_direction(this.server, 'returnMove2dKey', userCustomId, data.direction);
        }catch(e){
            client.disconnect();
        }
    }
}