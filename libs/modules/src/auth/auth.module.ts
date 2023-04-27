/*
 * @Author: Sheng.Jiang
 * @Date: 2021-12-08 18:26:54
 * @LastEditTime: 2021-12-09 15:14:08
 * @LastEditors: Sheng.Jiang
 * @Description: 身份认证模块
 * @FilePath: \meimei\src\modules\system\auth\auth.module.ts
 * You can you up，no can no bb！！
 */


import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { UserModule } from '../user/user.module';
import { AuthService } from './auth.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { LocalStrategy } from './strategies/local.strategy';
import { MobileStrategy } from './strategies/mobile.strategy';
import { WeixinStrategy } from './strategies/weixin.strategy';
import { JwtWsStrategy } from './strategies/jwt-ws.strategy';
import { WeixinWebStrategy } from './strategies/weixinweb.strategy';
import { EmailStrategy } from './strategies/email.strategy';
import { MixerStrategy } from './strategies/mixer.strategy';

@Module({
    imports: [
        UserModule,
        PassportModule,
    ],
    controllers: [],
    providers: [AuthService, LocalStrategy, MobileStrategy, MixerStrategy, EmailStrategy, 
        WeixinStrategy,WeixinWebStrategy, JwtStrategy, JwtWsStrategy],
    exports: [AuthService],
})
export class AuthModule { }
