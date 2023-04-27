import { Module } from '@nestjs/common';
import { FundService } from './fund.service';
import { FundController } from './fund.controller';
import { Withdraw } from './entities/withdraw.entity';
import { HttpModule } from '@nestjs/axios';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Account } from '../account/entities/account.entity';
import { BankcardModule } from '../bankcard/bankcard.module';
import { WithdrawController } from './withdraw.controller';
import { WithdrawFlow } from './entities/withdraw-flow.entity';

@Module({
  imports: [
    HttpModule.register({
      timeout: 5000,
      maxRedirects: 5,
    }),
    TypeOrmModule.forFeature([Withdraw, Account, WithdrawFlow]),
    BankcardModule,
  ],
  providers: [FundService],
  controllers: [FundController, WithdrawController],
  exports: [FundService]
})
export class FundModule { }
