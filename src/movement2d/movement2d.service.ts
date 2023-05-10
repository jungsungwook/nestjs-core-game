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
     * @param isUp
     */
    async move2d_key(server: Server, channel: string, userCustomId: any, key:any, isUp: boolean) {
        try {
            const { x, y } = await this.redisService.get(userCustomId+"_position");
            let newX = x;
            let newY = y;
            if(!isUp){
                switch (key) {
                    case "s":
                        newY -= 5;
                        break;
                    case "w":
                        newY += 5;
                        break;
                    case "a":
                        newX -= 5;
                        break;
                    case "d":
                        newX += 5;
                        break;
                }
                // 전체 사용자들에게 이동을 알림. (현재 위치, 이동 방향, 이동 속도)
                // 서버에서도 이동을 계산해서 위치를 업데이트.
                const already = await this.redisService.get(userCustomId+"_interval_"+key);
                if(already) return;
                
                const interval = setInterval(this.calculatePosition, 100, this.redisService, server, channel, userCustomId, key, isUp, 5);
                await this.redisService.set(userCustomId+"_interval_"+key, interval[Symbol.toPrimitive]() as number);
                server.emit("position_start",{
                    player: userCustomId,
                    x: newX,
                    y: newY,
                    direction: key,
                    speed: 5
                })
            }else{
                // 전체 사용자들에게 이동이 멈춤을 알림.( 서버에서 계산된 위치 )
                // 서버에서도 이동을 계산해서 위치를 업데이트.
                const interval : number = await this.redisService.get(userCustomId+"_interval_"+key);
                clearInterval(interval);
                
                await this.redisService.del(userCustomId+"_interval_"+key);
                server.emit("position_stop",{
                    player: userCustomId,
                    x: newX,
                    y: newY,
                    speed: 0
                })

            }
            await this.redisService.set(userCustomId+"_position", { x: newX, y: newY });
        } catch (e) {
            throw new Error(e);
        }
    }

    async calculatePosition(redisService: RedisCacheService ,server: Server, channel: string, userCustomId: any, key:any, isUp: boolean, speed: number) {
        try {
            const { x, y } = await redisService.get(userCustomId+"_position");
            let newX = x;
            let newY = y;
            if(!isUp){
                switch (key) {
                    case "s":
                        newY -= speed;
                        break;
                    case "w":
                        newY += speed;
                        break;
                    case "a":
                        newX -= speed;
                        break;
                    case "d":
                        newX += speed;
                        break;
                    default:
                        break;
                }
            }
            await redisService.set(userCustomId+"_position", { x: newX, y: newY });
            // 실시간으로 이동을 알림. //////////////////////////////
            server.emit(channel, {
                player: userCustomId,
                x: newX,
                y: newY,
                direction: key,
                speed: speed
            });
            ///////////////////////////////////////////////////////
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