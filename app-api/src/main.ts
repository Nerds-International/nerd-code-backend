import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { IoAdapter } from '@nestjs/platform-socket.io';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const configService: ConfigService = app.get(ConfigService);

  app.enableCors({
    origin: "*",
    credentials: true,
  });

  app.useWebSocketAdapter(new IoAdapter(app));

  await app.listen(configService.get('APP_PORT') || 3000);
}
bootstrap();
