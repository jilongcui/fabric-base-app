import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { ReplicateService } from './replicate.service';

@Module({
  imports: [
    HttpModule.register({
      timeout: 5000,
      maxRedirects: 5,
    }),
  ],
  providers: [ReplicateService],
  exports: [ReplicateService]
})
export class ReplicateModule {}
