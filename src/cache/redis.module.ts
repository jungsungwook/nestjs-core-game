import { CacheModule, Module } from '@nestjs/common';
import * as redisStore from 'cache-manager-redis-store';
import * as dotenv from 'dotenv';
import { RedisCacheService } from './redis.service';
dotenv.config();

const cacheModule = CacheModule.register({
    useFactory: async () => ({
        store: redisStore,
        host: process.env.REDIS_HOST,   // env에서 정의함
        port: process.env.REDIS_PORT,   // env에서 정의함
        ttl: 60 * 60 * 12, // 캐시 유지 시간
    }),
});

@Module({
    imports: [cacheModule],
    providers: [RedisCacheService],
    exports: [RedisCacheService],
})
export class RedisCacheModule { }