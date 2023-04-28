import { Test, TestingModule } from '@nestjs/testing';
import { FabcarService } from './fabcar.service';

describe('FabcarService', () => {
  let service: FabcarService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FabcarService],
    }).compile();

    service = module.get<FabcarService>(FabcarService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
