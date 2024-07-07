// src/main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Transport, MicroserviceOptions } from '@nestjs/microservices';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.NATS,
    options: {
      url: 'nats://localhost:4222',
    },
  });

  await app.startAllMicroservices();
  await app.listen(3000);

  const logger = new Logger('Bootstrap');
  logger.log('Access Key Management Service is running');
}
bootstrap();
