import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserRepository } from 'src/pages/users/user.repository';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './jwt.strategy';
import { UsersService } from 'src/pages/users/users.service';
import { ConfigService } from '@nestjs/config';
import { User } from 'src/pages/users/user.entity';
import { JwtRefreshStrategy } from './jwt-refresh.strategy';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret : process.env.JWT_SECRET,
        signOptions : {
          expiresIn : 3600
        },
      }),
    }),
    TypeOrmModule.forFeature([User]),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, JwtRefreshStrategy, UsersService, UserRepository],
  exports: [JwtStrategy, JwtRefreshStrategy, PassportModule]
})
export class AuthModule {}
