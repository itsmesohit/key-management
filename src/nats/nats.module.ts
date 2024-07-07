import { Module } from '@nestjs/common';
import { ClientProxyFactory, Transport } from '@nestjs/microservices';

@Module({
  providers: [
    {
      provide: 'NATS_SERVICE',
      useFactory: () => {
        return ClientProxyFactory.create({
          transport: Transport.NATS,
          options: {
            url: 'nats://localhost:4222',
          },
        });
      },
    },
  ],
  exports: ['NATS_SERVICE'],
})
export class NatsModule {}
