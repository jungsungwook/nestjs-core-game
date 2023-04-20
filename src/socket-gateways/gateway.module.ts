import { Module } from '@nestjs/common';
import { CoreGateway } from './gateway.core';
import { PlayerGateway } from './player/gateway.player';
import { UsersModule } from 'src/pages/users/users.module';
import { AuthModule } from 'src/auth/auth.module';
import { BroadcastModule } from 'src/pages/users/broadcast/broadcast.module';
import { Movement2dModule } from 'src/movement2d/movement2d.module';

@Module({
    imports:[
        UsersModule,
        AuthModule,
        BroadcastModule,
        Movement2dModule,
    ],
    providers: [
        CoreGateway,
        PlayerGateway
    ],
})
export class GatewayModule { }