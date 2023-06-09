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
import { BroadcastService } from 'src/pages/broadcast/broadcast.service';
import { RedisCacheService } from 'src/cache/redis.service';
import { generateSessionId } from 'src/utils/util';
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

    /**
     * 
     * @todo
     * - 다중 클라이언트 접속 시 처리 
     */
    async handleConnection(client: Socket) {
        // const test = setInterval(async () => {
        //     console.log('ping');
        // }, 1000);
        // const testId = test[Symbol.toPrimitive]() as number;
        // console.log(testId)
        // const end = setTimeout(async () => {
        //     clearInterval(testId);
        //     console.log('pong');
        // }, 5000);
        const reqHeaders = client.handshake.headers;

        let refreshToken = '';
        if(reqHeaders.refresh_token) refreshToken = reqHeaders.refresh_token as string;
        else refreshToken = client.handshake.auth.refresh_token as string;

        // if(!reqHeaders.refreshToken) throw new Error('No refreshToken');
        try{
            const user = await this.userService.getUser(refreshToken);
            if(user.statusCode == '404') throw new Error('User not found');
            const userObj = user.contents;
            const socketId = client.id;
            const socketIdUpdate = await this.userService.socketIdUpdate(userObj, socketId);
            if(socketIdUpdate.statusCode == '404') throw new Error('User not found');
            await this.redisService.set(socketId, userObj.customId);
            console.log('PlayerGateway: ' + userObj.customId + ' connected');

            // 유저 정보 broadcast
            const {x , y} = await this.redisService.get(userObj.customId + "_position") || {x: 0, y: 0};
            // connection to socket
            const otherUsers = await this.userService.getConnectedUser();
            const otherPlayerInfo : {
                customId: string,
                x: number,
                y: number,
            }[] = [];
            for(let i = 0; i < otherUsers.contents.length; i++){
                const {customId} = otherUsers.contents[i];
                if(customId == userObj.customId) continue;
                const {x, y} = await this.redisService.get(customId + "_position") || {x: 0, y: 0};
                otherPlayerInfo.push({
                    customId: customId,
                    x: x,
                    y: y,
                });
            }
            client.emit("connection", {
                myInfo: {
                    customId : userObj.customId,
                    x: x,
                    y: y,
                },
                otherPlayer : otherPlayerInfo,
            });

            await this.broadcastService.serverBroadcast(this.server, 'enter_lobby', {
                player: userObj.customId,
                x: x,
                y: y,
            });
        }
        catch(e){
            console.log(e);
            client.disconnect();
        }
    }

    async handleDisconnect(client: Socket) {
        const reqHeaders = client.handshake.headers;
        let refreshToken = '';
        if(reqHeaders.refresh_token) refreshToken = reqHeaders.refresh_token as string;
        else refreshToken = client.handshake.auth.refresh_token as string;

        try{
            const socketIdUpdate = await this.userService.disconnectSocketId(client.id);
            if(socketIdUpdate.statusCode == '404') throw new Error('User not found');
            console.log('PlayerGateway: ' + socketIdUpdate.contents.customId + ' disconnected');
            const check = await this.redisService.get(client.id);
            if(check){
                await this.redisService.del(client.id);
            }
            ['w','a','s','d'].forEach(async (key) => {
                const interval = await this.redisService.get(socketIdUpdate.contents.customId + "_interval_" + key);

                if(interval){
                    clearInterval(interval);
                    await this.redisService.del(socketIdUpdate.contents.customId + "_interval_" + key);
                }
            });
            await this.broadcastService.serverBroadcast(this.server, 'disconnection', {
                player: socketIdUpdate.contents.customId,
            });
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
        @MessageBody() data : { key: string, isUp: boolean, timestamp: number },
        @ConnectedSocket() client: Socket,
    ) {
        try{
            const userCustomId = await this.redisService.get(client.id);
            if(!userCustomId) throw new Error('User not found');
            if(!data.key) throw new Error('Key not found');
            if(data.isUp == undefined) throw new Error('isUp not found');
            const pos = await this.redisService.get(userCustomId + "_position");
            if (!pos||!pos.hasOwnProperty('x')||!pos.hasOwnProperty('y')||pos.x==undefined||pos.y==undefined) {
                const rand_session_id = generateSessionId();
                client.emit("request_position", userCustomId + "_" + rand_session_id);
                await this.redisService.set(userCustomId + "_" + rand_session_id, { clientId: client.id, key: data.key, isUp: data.isUp, timestamp: data.timestamp});
                return;
            }
            await this.movemoent2dService.move2d_key(this.server, 'returnMove2dKey', userCustomId, data.key, data.isUp);
        }catch(e){
            client.emit('error', e.message);
        }
    }

    /**
     * @Description
     * 클라이언트로부터 본인의 위치 정보를 받아서 처리하는 메소드.
     * request 전용.
     */
    @SubscribeMessage('response_position_key')
    async handlePlayerPosition(
        @MessageBody() data: { x: number, y: number, session_id: string},
        @ConnectedSocket() client: Socket,
    ) {
        try{
            const userCustomId = await this.redisService.get(client.id);
            if(!userCustomId) throw new Error('User not found');
            if(data.x == undefined || data.y == undefined) throw new Error('Position not found');
            if(!data.session_id) throw new Error('Session id not found');
            const session_data = await this.redisService.get(data.session_id);
            if(!session_data||session_data.clientId != client.id) throw new Error('Invalid session');
            await this.redisService.set(userCustomId + "_position", { x: data.x, y: data.y });
            const key = session_data.key;
            const isUp = session_data.isUp;
            await this.movemoent2dService.move2d_key(this.server, 'returnMove2dKey', userCustomId, key, isUp);
            await this.redisService.del(data.session_id);

        }catch(e){
            client.emit('error', e.message);
        }
    }

    /**
     * @Description
     * 2Directional Movement (2D)를 처리하는 메소드.
     * 이동 방향을 받아서 처리함.
     */
    @SubscribeMessage('move2d_direction')
    async handleMove2dDirection(
        @MessageBody() data: { direction: string },
        @ConnectedSocket() client: Socket,
    ) {
        try{
            const userCustomId = await this.redisService.get(client.id);
            if(!userCustomId) throw new Error('User not found');
            if(!data.direction) throw new Error('Direction not found');
            await this.movemoent2dService.move2d_direction(this.server, 'returnMove2dDirection', userCustomId, data.direction);
        }catch(e){
            client.emit('error', e.message);
        }
    }
}