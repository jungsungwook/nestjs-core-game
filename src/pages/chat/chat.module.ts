import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from 'src/auth/auth.module';
import { ChatService } from './chat.service';

@Module({
    imports: [
        TypeOrmModule.forFeature([]),
        AuthModule
    ],
    controllers: [],
    providers: [ChatService],
    exports: [ChatService],
})
export class ChatModule { }
