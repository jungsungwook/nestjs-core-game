import { Module } from '@nestjs/common';
import { CoreGateway } from './gateway.core';
import { PlayerGateway } from './player/gateway.player';
import { UsersModule } from 'src/pages/users/users.module';

@Module({
    imports:[
        UsersModule
    ],
    providers: [
        CoreGateway,
        PlayerGateway
    ],
})
export class GatewayModule { }