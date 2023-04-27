import { Module } from '@nestjs/common';
import { ModulesService } from './modules.service';
import { ExchangeModule } from './exchange/exchange.module';

@Module({
  providers: [ModulesService],
  exports: [ModulesService],
  imports: [ExchangeModule],
})
export class ModulesModule { }
