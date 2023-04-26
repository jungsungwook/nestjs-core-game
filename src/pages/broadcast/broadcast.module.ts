import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from 'src/auth/auth.module';
import { BroadcastService } from './broadcast.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([]),
    AuthModule
  ],
  controllers: [],
  providers: [BroadcastService],
  exports: [BroadcastService],
})
export class BroadcastModule {}
