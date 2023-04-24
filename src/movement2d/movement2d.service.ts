import { Injectable } from "@nestjs/common";
import { Server, Socket } from "socket.io";
import { RedisCacheService } from "src/cache/redis.service";

/**
 * 2D 환경에서의 움직임을 처리하는 서비스
 */
@Injectable()
export class Movement2dService {
    constructor(
        private redisService: RedisCacheService,
    ) { }

    /**
     * 키보드의 입력을 받아서 도착 지점을 계산한 후, 그 결과를 클라이언트에게 전송한다.
     * @param server 
     * @param channel 
     * @param userCustomId
     * @param key 
     */
    async move2d_key(server: Server, channel: string, userCustomId: any, key:any) {
        try {
            const { x, y } = await this.redisService.get(userCustomId+"_position");
            let newX = x;
            let newY = y;
            switch (key) {
                case 'w':
                    newY += 1;
                    break;
                case 'a':
                    newX -= 1;
                    break;
                case 's':
                    newY -= 1;
                    break;
                case 'd':
                    newX += 1;
                    break;
                default:
                    break;
            }
            await this.redisService.set(userCustomId+"_position", { x: newX, y: newY });
            server.emit(channel, {
                player: userCustomId,
                x: newX,
                y: newY
            });
        } catch (e) {
            throw new Error(e);
        }
    }

    /**
     * 이동 방향을 입력받아서 해당 이동 방향을 클라이언트에게 전송한다.
     * 서버에서도 이동 방향을 계산해서 위치를 업데이트한다.
     * @param server
     * @param channel
     * @param userCustomId
     * @param direction
    */
    async move2d_direction(server: Server, channel: string, userCustomId: any, direction: any) {
        try {
            server.emit(channel, {
                direction: direction,
                player: userCustomId
            });
        } catch (e){
            throw new Error(e);
        }
    }
}