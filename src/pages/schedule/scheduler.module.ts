import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from 'src/auth/auth.module';
import { SchedulerService } from './scheduler.service';
import { ScheduleModule } from '@nestjs/schedule';
import { UsersModule } from '../users/users.module';
import { GatewayModule } from 'src/socket-gateways/gateway.module';
import { MatchModule } from '../match/match.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([]),
        ScheduleModule.forRoot(),
        AuthModule,
        UsersModule,
        GatewayModule,
        MatchModule,
    ],
    controllers: [],
    providers: [SchedulerService],
    exports: [SchedulerService],
})
export class SchedulerModule { }
