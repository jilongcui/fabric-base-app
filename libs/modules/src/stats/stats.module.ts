import { CacheModule, Module } from '@nestjs/common';
import { StatsService } from './stats.service';
import { StatsController } from './stats.controller';
import { User } from '../user/entities/user.entity';
import { InviteUser } from '../inviteuser/entities/invite-user.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Asset } from '../collection/entities/asset.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, InviteUser, Asset]), CacheModule.register()
  ],
  providers: [StatsService],
  controllers: [StatsController]
})
export class StatsModule { }
