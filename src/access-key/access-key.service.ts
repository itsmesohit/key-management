import { Injectable, Logger, Inject, NotFoundException, InternalServerErrorException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ClientProxy } from '@nestjs/microservices';
import { v4 as uuidv4 } from 'uuid';
import { Prisma } from '@prisma/client';

@Injectable()
export class AccessKeyService {
  private readonly logger = new Logger(AccessKeyService.name);

  constructor(
    private prisma: PrismaService,
    @Inject('NATS_SERVICE') private client: ClientProxy,
  ) {}

  async createKey(rateLimit: number, expiresAt: Date): Promise<any> {
    const key = await this.prisma.accessKey.create({
      data: {
        key: uuidv4(),
        rateLimit,
        expiresAt,
      },
    }).catch(error => this.handlePrismaError(error, 'createKey')) as { key: string };

    if (key) {
      this.client.emit('key_created', key).subscribe({
        next: () => this.logger.log('Event emitted successfully'),
        error: (err) => this.logger.error(`Event emit error: ${err}`),
      });

      this.logger.log(`Created key: ${key.key}`);
    }

    return key;
  }

  async getKeys(): Promise<any> {
    const keys = await this.prisma.accessKey.findMany()
      .catch(error => this.handlePrismaError(error, 'getKeys'));

    this.logger.log('Fetched all keys');
    return keys;
  }

  async updateKey(id: string, rateLimit: number, expiresAt: Date): Promise<any> {
    this.logger.log(`Finding access key with id: ${id}`);
    const existingKey = await this.prisma.accessKey.findUnique({ where: { id } });

    if (!existingKey) {
      this.logger.error(`Access key with id ${id} not found`);
      throw new NotFoundException(`Access key with id ${id} not found`);
    }

    this.logger.log(`Updating access key with id: ${id}`);
    const updatedKey = await this.prisma.accessKey.update({
      where: { id },
      data: { rateLimit, expiresAt },
    }).catch(error => this.handlePrismaError(error, 'updateKey')) as { key: string };

    if (updatedKey) {
      this.logger.log(`Updated key: ${updatedKey.key}`);
      this.client.emit('key_updated', updatedKey).subscribe({
        next: () => this.logger.log('Event emitted successfully'),
        error: (err) => this.logger.error(`Event emit error: ${err}`),
      });
    }

    return updatedKey;
  }

  async deleteKey(id: string): Promise<any> {
    const key = await this.prisma.accessKey.delete({ where: { id } })
      .catch(error => this.handlePrismaError(error, 'deleteKey')) as { key: string };

    if (key) {
      this.logger.log(`Deleted key: ${key.key}`);
      this.client.emit('key_deleted', key).subscribe({
        next: () => this.logger.log('Event emitted successfully'),
        error: (err) => this.logger.error(`Event emit error: ${err}`),
      });
    }

    return key;
  }

  async getKeyDetails(id: string): Promise<any> {
    const key = await this.prisma.accessKey.findUnique({ where: { id } });

    if (!key) {
      this.logger.error(`Access key with id ${id} not found`);
      throw new NotFoundException(`Access key with id ${id} not found`);
    }

    this.logger.log(`Fetched key details: ${key.key}`);
    return key;
  }

  private handlePrismaError(error: any, methodName: string): void {
    this.logger.error(`Error in ${methodName}: ${error.message}`);

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      switch (error.code) {
        case 'P2002':
          throw new BadRequestException('Duplicate entry');
        case 'P2025':
          throw new NotFoundException('Record not found');
        default:
          throw new InternalServerErrorException('An unexpected error occurred');
      }
    } else {
      throw new InternalServerErrorException('An unexpected error occurred');
    }
  }
}
