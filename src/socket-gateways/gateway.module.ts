import { Module } from '@nestjs/common';
import { CoreGateway } from './gateway.core';
import { PlayerGateway } from './player/gateway.player';

@Module({
    providers: [
        CoreGateway,
        PlayerGateway
    ],
})
export class GatewayModule { }