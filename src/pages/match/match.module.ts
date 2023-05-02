import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from 'src/auth/auth.module';
import { MatchService } from './match.service';
import { RedisCacheModule } from 'src/cache/redis.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([]),
        AuthModule,
        RedisCacheModule,
    ],
    controllers: [],
    providers: [MatchService],
    exports: [MatchService],
})
export class MatchModule { }
