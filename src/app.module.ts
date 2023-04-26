import { CacheModule, MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common';
import { GatewayModule } from './socket-gateways/gateway.module';
import path from 'path';
import { resolve } from 'path';
import * as dotenv from 'dotenv';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { AuthTokenMiddleware } from './auth/authToken.middleware';
import { UsersModule } from './pages/users/users.module';
import { User } from './pages/users/user.entity';

dotenv.config({ path: resolve(__dirname, '../.env') });

@Module({
  imports: [
    CacheModule.register(
      {
        isGlobal: true,
        ttl: 60*60*12, // seconds
        max: 1000, // maximum number of items in cache
      },
    ),
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRoot({
      type: 'mariadb',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT) as number,
      username: process.env.DB_USER as string || 'abcd',
      password: process.env.DB_PASS,
      database: process.env.DB_DATABASE,
      timezone: '+09:00',
      entities: [User,],
      synchronize: true,
    }),
    GatewayModule,
    UsersModule,
    AuthModule,
  ],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(AuthTokenMiddleware)
      .forRoutes({ path: '*', method: RequestMethod.ALL });
  }
}
