import { Injectable } from "@nestjs/common";
import { Server, Socket } from "socket.io";

/**
 * 2D 환경에서의 움직임을 처리하는 서비스
 */
@Injectable()
export class Movement2dService {
    constructor(){}

    /**
     * 키보드의 입력을 받아서 도착 지점을 계산한 후, 그 결과를 클라이언트에게 전송한다.
     * @param server 
     * @param channel 
     * @param player
     * @param key 
     */
    async move2d_key(server: Server, channel: string, player: any, key: any){
        server.emit(channel, key);
    }

    /**
     * 이동 방향을 입력받아서 해당 이동 방향을 클라이언트에게 전송한다.
     * 서버에서도 이동 방향을 계산해서 위치를 업데이트한다.
     * @param server
     * @param channel
     * @param player
     * @param direction
    */
    async move2d_direction(server: Server, channel: string, player: any, direction: any){
        server.emit(channel, {
            direction: direction,
            player: player
        });
    }
}