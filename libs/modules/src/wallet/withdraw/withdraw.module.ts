import { Module } from '@nestjs/common';
import { WithdrawService } from './withdraw.service';
import { WithdrawController } from './withdraw.controller';
import { Account } from '@app/modules/account/entities/account.entity';
import { HttpModule } from '@nestjs/axios';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WithdrawFlow } from './entities/withdraw-flow.entity';
import { Withdraw } from './entities/withdraw.entity';
import { AddressModule } from '../address/address.module';
import { Address } from '../address/entities/address.entity';
import { CurrencyModule } from '@app/modules/currency/currency.module';
import { SysConfigModule } from '@app/modules/system/sys-config/sys-config.module';
import { Currency } from '@app/modules/currency/entities/currency.entity';

@Module({
  imports: [
    HttpModule.register({
      timeout: 5000,
      maxRedirects: 5,
    }),
    TypeOrmModule.forFeature([Withdraw, Account, Address, Currency, WithdrawFlow]),
    AddressModule, CurrencyModule, SysConfigModule
  ],
  controllers: [WithdrawController],
  providers: [WithdrawService],
  exports: [WithdrawService],
})
export class WithdrawModule {}
