import { CurrencyModule } from '@app/modules/currency/currency.module';
import { SysConfigModule } from '@app/modules/system/sys-config/sys-config.module';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AddressModule } from '../address/address.module';
import { CollectController } from './collect.controller';
import { CollectService } from './collect.service';
import { RechargeCollect } from './entities/rechage-collect.entity';
import { AddressCRI, AddressETH,AddressBSC,AddressBTC,AddressTRC } from '../address/entities/address.entity';

@Module({
  imports: [TypeOrmModule.forFeature([RechargeCollect,AddressETH,AddressBSC,AddressBTC,AddressTRC,AddressCRI]),
    SysConfigModule, AddressModule, CurrencyModule
  ],
  controllers: [CollectController],
  providers: [CollectService]
})
export class CollectModule { }
