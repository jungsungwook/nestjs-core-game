import { Injectable } from "@nestjs/common";
import { Server, Socket } from "socket.io";
import { RedisCacheService } from "src/cache/redis.service";
import { ChatDto } from "./dto/chat.dto";

@Injectable()
export class ChatService {
    constructor(
        private redisService: RedisCacheService,
    ){}

    async getChatLog(limit: number): Promise<ChatDto[]>{
        try{
            const chatLog = await this.redisService.get("chatLog");
            if(!chatLog) {
                await this.redisService.set("chatLog", []);
                return [];
            }
            if(chatLog.length > limit) return chatLog.slice(chatLog.length - limit, chatLog.length);
            else return chatLog;
        }catch(e){
            throw new Error(e);
        }
    }
}