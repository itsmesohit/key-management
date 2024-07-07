import { Test, TestingModule } from '@nestjs/testing';
import { AccessKeyService } from './access-key.service';
import { PrismaService } from '../prisma/prisma.service';
import { ClientProxy } from '@nestjs/microservices';
import { NotFoundException, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { of } from 'rxjs';

describe('AccessKeyService', () => {
  let service: AccessKeyService;
  let prisma: PrismaService;
  let client: ClientProxy;

  const mockPrismaService = {
    accessKey: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };

  const mockClientProxy = {
    emit: jest.fn(() => of({})),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AccessKeyService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: 'NATS_SERVICE', useValue: mockClientProxy },
      ],
    }).compile();

    service = module.get<AccessKeyService>(AccessKeyService);
    prisma = module.get<PrismaService>(PrismaService);
    client = module.get<ClientProxy>('NATS_SERVICE');
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createKey', () => {
    it('should create a key and emit an event', async () => {
      const key = { id: '1', key: 'uuid', rateLimit: 100, expiresAt: new Date() };
      prisma.accessKey.create = jest.fn().mockResolvedValue(key);
      const result = await service.createKey(100, new Date());
      expect(result).toEqual(key);
      expect(prisma.accessKey.create).toHaveBeenCalled();
      expect(client.emit).toHaveBeenCalledWith('key_created', key);
    });

    it('should handle errors when creating a key', async () => {
      prisma.accessKey.create = jest.fn().mockRejectedValue({ code: 'P2002' });
      await expect(service.createKey(100, new Date())).rejects.toThrow(BadRequestException);
    });
  });

  describe('getKeys', () => {
    it('should return all keys', async () => {
      const keys = [{ id: '1', key: 'uuid', rateLimit: 100, expiresAt: new Date() }];
      prisma.accessKey.findMany = jest.fn().mockResolvedValue(keys);
      const result = await service.getKeys();
      expect(result).toEqual(keys);
      expect(prisma.accessKey.findMany).toHaveBeenCalled();
    });

    it('should handle errors when fetching keys', async () => {
      prisma.accessKey.findMany = jest.fn().mockRejectedValue(new Error('Some error'));
      await expect(service.getKeys()).rejects.toThrow(InternalServerErrorException);
    });
  });


  describe('updateKey', () => {
    it('should update a key and emit an event', async () => {
      const existingKey = { id: '1', key: 'uuid', rateLimit: 100, expiresAt: new Date() };
      const updatedKey = { id: '1', key: 'uuid-updated', rateLimit: 200, expiresAt: new Date() };
      prisma.accessKey.findUnique = jest.fn().mockResolvedValue(existingKey);
      prisma.accessKey.update = jest.fn().mockResolvedValue(updatedKey);
      const result = await service.updateKey('1', 200, new Date());
      expect(result).toEqual(updatedKey);
      expect(prisma.accessKey.findUnique).toHaveBeenCalled();
      expect(prisma.accessKey.update).toHaveBeenCalled();
      expect(client.emit).toHaveBeenCalledWith('key_updated', updatedKey);
    });

    it('should throw NotFoundException if key does not exist', async () => {
      prisma.accessKey.findUnique = jest.fn().mockResolvedValue(null);
      await expect(service.updateKey('1', 200, new Date())).rejects.toThrow(NotFoundException);
    });
  });

  describe('deleteKey', () => {
    it('should delete a key and emit an event', async () => {
      const key = { id: '1', key: 'uuid', rateLimit: 100, expiresAt: new Date() };
      prisma.accessKey.delete = jest.fn().mockResolvedValue(key);
      const result = await service.deleteKey('1');
      expect(result).toEqual(key);
      expect(prisma.accessKey.delete).toHaveBeenCalled();
      expect(client.emit).toHaveBeenCalledWith('key_deleted', key);
    });

    it('should handle errors when deleting a key', async () => {
      prisma.accessKey.delete = jest.fn().mockRejectedValue(new Error('Some error'));
      await expect(service.deleteKey('1')).rejects.toThrow(InternalServerErrorException);
    });
  });

  describe('getKeyDetails', () => {
    it('should return key details', async () => {
      const key = { id: '1', key: 'uuid', rateLimit: 100, expiresAt: new Date() };
      prisma.accessKey.findUnique = jest.fn().mockResolvedValue(key);
      const result = await service.getKeyDetails('1');
      expect(result).toEqual(key);
      expect(prisma.accessKey.findUnique).toHaveBeenCalled();
    });

    it('should throw NotFoundException if key does not exist', async () => {
      prisma.accessKey.findUnique = jest.fn().mockResolvedValue(null);
      await expect(service.getKeyDetails('1')).rejects.toThrow(NotFoundException);
    });
  });
});
