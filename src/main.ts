import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { SuperTokensExceptionFilter } from 'supertokens-nestjs';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: ['http://localhost:5173'],
    credentials: true,
  });

  app.useGlobalFilters(new SuperTokensExceptionFilter());
  app.useGlobalPipes(new ValidationPipe());
  app.setGlobalPrefix('api/v1', { exclude: ['/health', ''] });

  await app.listen(process.env.NODE_PORT ?? 5122);
}
bootstrap();
