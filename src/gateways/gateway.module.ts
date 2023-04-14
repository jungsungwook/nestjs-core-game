import { Module } from '@nestjs/common';
import { CoreGateway } from './gateway.core';

@Module({
    providers: [CoreGateway],
})
export class GatewayModule { }