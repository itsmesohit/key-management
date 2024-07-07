// src/app.module.ts
import { Module } from '@nestjs/common';
import { AccessKeyModule } from './access-key/access-key.module';
import { PrismaModule } from './prisma/prisma.module';
import { NatsService } from './nats/nats.service';
import { NatsModule } from './nats/nats.module';

@Module({
  imports: [AccessKeyModule, PrismaModule, NatsModule],
  providers: [NatsService],
})
export class AppModule {}
