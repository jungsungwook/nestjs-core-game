import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserRepository } from './user.repository';
import { AuthModule } from 'src/auth/auth.module';
import { User } from './user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    AuthModule
  ],
  controllers: [UsersController],
  providers: [UsersService, UserRepository],
})
export class UsersModule {}
