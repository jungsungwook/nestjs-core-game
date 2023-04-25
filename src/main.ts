import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { IoAdapter } from '@nestjs/platform-socket.io';
import * as dotenv from 'dotenv';
import * as path from 'path';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

dotenv.config({ path: path.resolve(__dirname, '../.env') });
async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const options = new DocumentBuilder()
        .setTitle('API')
        .setDescription('The API description')
        .setVersion('1.0')
        .addTag('nestjs-game-api')
        .build();
  const document = SwaggerModule.createDocument(app, options);
  SwaggerModule.setup('api-docs', app, document);
  
  app.useWebSocketAdapter(new IoAdapter(app));
  app.enableCors();
  await app.listen(3000);
}
bootstrap();
