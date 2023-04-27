import { UserController } from './user.controller';
import { UserService } from './user.service';
/*
 * @Author: Sheng.Jiang
 * @Date: 2021-12-08 18:28:34
 * @LastEditTime: 2021-12-29 18:38:01
 * @LastEditors: Sheng.Jiang
 * @Description: 用户管理模块
 * @FilePath: \meimei\src\modules\system\user\user.module.ts
 * You can you up，no can no bb！！
 */


import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { storage, UploadModule } from '@app/modules/common/upload/upload.module';
import { MulterModule } from '@nestjs/platform-express';
import { AddressModule } from '@app/modules/wallet/address/address.module';
import { InviteUser } from '@app/modules/inviteuser/entities/invite-user.entity';

@Module({
    imports: [
        TypeOrmModule.forFeature([User, InviteUser]),
        MulterModule.register({
            storage: storage,
            preservePath: false,
        }),
        AddressModule,
        UploadModule,
    ],
    controllers: [
        UserController,],
    providers: [
        UserService],
    exports: [UserService]
})
export class UserModule { }
