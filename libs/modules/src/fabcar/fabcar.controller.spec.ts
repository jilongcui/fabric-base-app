import { Test, TestingModule } from '@nestjs/testing';
import { FabcarController } from './fabcar.controller';
import { FabcarService } from './fabcar.service';

describe('FabcarController', () => {
  let controller: FabcarController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FabcarController],
      providers: [FabcarService],
    }).compile();

    controller = module.get<FabcarController>(FabcarController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
