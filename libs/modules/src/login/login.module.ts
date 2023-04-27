/*
 * @Author: Sheng.Jiang
 * @Date: 2021-12-08 18:29:45
 * @LastEditTime: 2022-01-18 09:53:49
 * @LastEditors: Sheng.Jiang
 * @Description: 登录模块
 * @FilePath: \meimei-admin\src\modules\login\login.module.ts
 * You can you up，no can no bb！！
 */


import { Module } from '@nestjs/common';
import { LoginService } from './login.service';
import { LoginController } from './login.controller';
import { JwtModule } from '@nestjs/jwt';
import { jwtConstants } from '../auth/auth.constants';
import { AuthModule } from '../auth/auth.module';
import { UserModule } from '../user/user.module';
import { LogModule } from '../monitor/log/log.module';
import { InviteUserModule } from '../inviteuser/invite-user.module';

@Module({
    imports: [
        JwtModule.register({
            secret: jwtConstants.secret,
            signOptions: { expiresIn: '168h' },
        }),
        AuthModule,
        UserModule,
        LogModule,
        InviteUserModule
    ],
    controllers: [
        LoginController,],
    providers: [
        LoginService,],
    exports: [LoginService]
})
export class LoginModule { }
