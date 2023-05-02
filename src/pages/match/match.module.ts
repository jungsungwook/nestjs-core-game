import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from 'src/auth/auth.module';
import { MatchService } from './match.service';
import { RedisCacheModule } from 'src/cache/redis.module';
import { GatewayModule } from 'src/socket-gateways/gateway.module';
import { UsersService } from '../users/users.service';

@Module({
    imports: [
        TypeOrmModule.forFeature([]),
        AuthModule,
        RedisCacheModule,
        GatewayModule,
        UsersService,
    ],
    controllers: [],
    providers: [MatchService],
    exports: [MatchService],
})
export class MatchModule { }
