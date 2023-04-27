import { Module } from '@nestjs/common';
import { FabricNetworkService } from './fabric-network.service';

@Module({
  providers: [FabricNetworkService],
  exports: [FabricNetworkService],
})
export class FabricNetworkModule {}
