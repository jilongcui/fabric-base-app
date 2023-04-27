import { Module } from '@nestjs/common';
import { InviteUserService } from './invite-user.service';
import { InviteUserController } from './invite-user.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InviteUser } from './entities/invite-user.entity';
import { UserModule } from '../user/user.module';
import { User } from '../user/entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, InviteUser]),
    UserModule,
  ],
  providers: [InviteUserService],
  controllers: [InviteUserController],
  exports: [InviteUserService]
})
export class InviteUserModule { }
