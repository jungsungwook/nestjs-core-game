import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from 'src/auth/auth.module';
import { MatchService } from './match.service';
import { RedisCacheModule } from 'src/cache/redis.module';
import { GatewayModule } from 'src/socket-gateways/gateway.module';
import { UsersModule } from '../users/users.module';
import { MatchController } from './match.controller';

@Module({
    imports: [
        TypeOrmModule.forFeature([]),
        AuthModule,
        RedisCacheModule,
        UsersModule,
        forwardRef(() => GatewayModule),
    ],
    controllers: [MatchController,],
    providers: [MatchService,],
    exports: [MatchService],
})
export class MatchModule { }
