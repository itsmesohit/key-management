// src/access-key/access-key.module.ts
import { Module } from '@nestjs/common';
import { AccessKeyService } from './access-key.service';
import { AccessKeyController } from './access-key.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { NatsModule } from '../nats/nats.module';

@Module({
  imports: [PrismaModule, NatsModule],
  providers: [AccessKeyService],
  controllers: [AccessKeyController],
})
export class AccessKeyModule {}
