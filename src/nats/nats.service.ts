import { Injectable, OnModuleInit } from '@nestjs/common';
import { ClientProxy, ClientProxyFactory, Transport } from '@nestjs/microservices';

@Injectable()
export class NatsService implements OnModuleInit {
  private client: ClientProxy;

  onModuleInit() {
    this.client = ClientProxyFactory.create({
      transport: Transport.NATS,
      options: {
        url: 'nats://localhost:4222',
      },
    });
  }

  async emit(pattern: string, data: any) {
    return this.client.emit(pattern, data);
  }

  async send(pattern: string, data: any) {
    return this.client.send(pattern, data);
  }

  addListener(pattern: string, callback: (message: any) => void) {
    this.client.send(pattern, {}).subscribe(callback);
  }

  publish(pattern: string, data: any) {
    return this.emit(pattern, data);
  }
}
