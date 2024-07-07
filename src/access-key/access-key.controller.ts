// src/access-key/access-key.controller.ts
import { Controller, Get, Post, Delete, Put, Body, Param } from '@nestjs/common';
import { AccessKeyService } from './access-key.service';

@Controller('access-key')
export class AccessKeyController {
  constructor(private readonly accessKeyService: AccessKeyService) {}

  @Post()
  async createKey(@Body() data: { rateLimit: number; expiresAt: Date }) {
    return this.accessKeyService.createKey(data.rateLimit, data.expiresAt);
  }

  @Get()
  async getKeys() {
    return this.accessKeyService.getKeys();
  }

  @Put(':id')
  async updateKey(
    @Param('id') id: string,
    @Body() data: { rateLimit: number; expiresAt: Date }
  ) {
    return this.accessKeyService.updateKey(id, data.rateLimit, data.expiresAt);
  }

  @Delete(':id')
  async deleteKey(@Param('id') id: string) {
    return this.accessKeyService.deleteKey(id);
  }

  // for users to get key details like rate limit and expiry date
  @Get(':id')
  async getKeyDetails(@Param('id') id: string) {
    return this.accessKeyService.getKeyDetails(id);
  }

}
