import { Module } from '@nestjs/common';
import { FabcarService } from './fabcar.service';
import { FabcarController } from './fabcar.controller';
import { FabricNetworkModule } from 'libs/fabric-network/src';
import { SharedModule } from '@app/shared';

@Module({
  imports: [FabricNetworkModule, SharedModule],
  controllers: [FabcarController],
  providers: [FabcarService]
})
export class FabcarModule {}
