import{ Controller, Get, Param, Query } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ChatService } from './chat.service';
import { ChatDto } from './dto/chat.dto';

@Controller('chat')
@ApiTags('채팅')
export class ChatController {
    constructor(
        private readonly chatService: ChatService,
    ){}

    @Get('log')
    @ApiOperation({
        summary: '채팅 로그 가져오기',
        description: '채팅 로그를 가져옵니다.'
    })
    @ApiResponse({
        description: '채팅 로그 가져오기 성공',
        type: ChatDto,
        status: 200
    })
    async getChatLog(
        @Query('limit') limit: number = 10
    ): Promise<ChatDto[]>{
        try{
            const result = await this.chatService.getChatLog(limit);
            return result;
        }catch(e){
            throw new Error(e);
        }
    }

}