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
import { MatchModule } from 'src/pages/match/match.module';
import { MatchGateway } from './match/gateway.match';

@Module({
    imports:[
        UsersModule,
        AuthModule,
        BroadcastModule,
        Movement2dModule,
        RedisCacheModule,
        MatchModule,
        ChatModule,
    ],
    providers: [
        CoreGateway,
        PlayerGateway,
        ChatGateWay,
        MatchGateway,
    ],
    exports: [
        CoreGateway,
        PlayerGateway,
        ChatGateWay,
        MatchGateway,
    ],
})
export class GatewayModule { }