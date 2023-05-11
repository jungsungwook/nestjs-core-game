import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from 'src/auth/auth.module';
import { ChatService } from './chat.service';
import { RedisCacheModule } from 'src/cache/redis.module';
import { ChatController } from './chat.controller';
import { GatewayModule } from 'src/socket-gateways/gateway.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([]),
        AuthModule,
        RedisCacheModule,
        forwardRef(() => GatewayModule),
    ],
    controllers: [ChatController],
    providers: [ChatService],
    exports: [ChatService],
})
export class ChatModule { }
