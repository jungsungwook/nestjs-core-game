import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from 'src/auth/auth.module';
import { Movement2dService } from './movement2d.service';
import { RedisCacheModule } from 'src/cache/redis.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([]),
    AuthModule,
    RedisCacheModule,
  ],
  controllers: [],
  providers: [Movement2dService],
  exports: [Movement2dService],
})
export class Movement2dModule {}
