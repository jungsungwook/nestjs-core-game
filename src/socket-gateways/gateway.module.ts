import { Module } from '@nestjs/common';
import { CoreGateway } from './gateway.core';
import { PlayerGateway } from './player/gateway.player';
import { UsersModule } from 'src/pages/users/users.module';
import { AuthModule } from 'src/auth/auth.module';
import { BroadcastModule } from 'src/pages/broadcast/broadcast.module';
import { Movement2dModule } from 'src/movement2d/movement2d.module';
import { RedisCacheModule } from 'src/cache/redis.module';
import { ChatModule } from 'src/pages/chat/chat.module';
import { ChatGateWay } from './chat/gateway.chat';

@Module({
    imports:[
        UsersModule,
        AuthModule,
        BroadcastModule,
        Movement2dModule,
        RedisCacheModule,
        ChatModule,
    ],
    providers: [
        CoreGateway,
        PlayerGateway,
        ChatGateWay,
    ],
    exports: [
        CoreGateway,
        PlayerGateway,
        ChatGateWay,
    ],
})
export class GatewayModule { }