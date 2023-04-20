import { Module } from '@nestjs/common';
import { CoreGateway } from './gateway.core';
import { PlayerGateway } from './player/gateway.player';
import { UsersModule } from 'src/pages/users/users.module';
import { AuthModule } from 'src/auth/auth.module';

@Module({
    imports:[
        UsersModule,
        AuthModule,
    ],
    providers: [
        CoreGateway,
        PlayerGateway
    ],
})
export class GatewayModule { }