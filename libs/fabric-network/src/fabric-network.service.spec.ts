import { Test, TestingModule } from '@nestjs/testing';
import { FabricNetworkService } from './fabric-network.service';

describe('FabricNetworkService', () => {
  let service: FabricNetworkService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FabricNetworkService],
    }).compile();

    service = module.get<FabricNetworkService>(FabricNetworkService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
