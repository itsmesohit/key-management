import { Test, TestingModule } from '@nestjs/testing';
import { AccessKeyController } from './access-key.controller';

describe('AccessKeyController', () => {
  let controller: AccessKeyController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AccessKeyController],
    }).compile();

    controller = module.get<AccessKeyController>(AccessKeyController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
