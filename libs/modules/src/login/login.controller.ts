/*
 * @Author: Sheng.Jiang
 * @Date: 2021-12-08 18:30:39
 * @LastEditTime: 2022-01-19 14:18:00
 * @LastEditors: Sheng.Jiang
 * @Description: 登录 controller
 * @FilePath: \meimei-admin\src\modules\login\login.controller.ts
 * You can you up，no can no bb！！
 */

import { Body, Controller, Get, Post, Req, UseGuards, Headers, Query, Logger, Res, Param } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { DataObj } from '@app/common/class/data-obj.class';
import { ApiDataResponse, typeEnum } from '@app/common/decorators/api-data-response.decorator';
import { Public } from '@app/common/decorators/public.decorator';
import { UserDec, UserEnum } from '@app/common/decorators/user.decorator';
import { LocalAuthGuard } from '@app/common/guards/local-auth.guard';
import { QueryInviteUserDto, ReqInnerRegDto, ReqLoginDto, ReqMobileLoginDto, ReqWeixinLoginDto, ReqMobileRegDto, ReqEmailLoginDto, ReqEmailRegDto, ReqMixLoginDto } from './dto/req-login.dto';
import { ResImageCaptchaDto, ResLoginDto } from './dto/res-login.dto';
import { LoginService } from './login.service';
import { Request, Response } from 'express';
import { SmsCodeGuard } from '@app/common/guards/sms-code.guard';
import { MobileAuthGuard } from '@app/common/guards/mobile-auth.guard';
import { ImageCaptchaGuard } from '@app/common/guards/image-captcha.guard';
import { SharedService } from '@app/shared/shared.service';
import { ApiException } from '@app/common/exceptions/api.exception';
import { ThrottlerBehindProxyGuard } from '@app/common/guards/throttler-behind-proxy.guard';
import { RequiresRoles } from '@app/common/decorators/requires-roles.decorator';
import { Keep } from '@app/common/decorators/keep.decorator';
import { WeixinAuthGuard } from '@app/common/guards/weixin-auth.guard';
import { InviteUserService } from '../inviteuser/invite-user.service';
import { WeixinWebAuthGuard } from '@app/common/guards/weixinweb-auth.guard';
import { EmailAuthGuard } from '@app/common/guards/email-auth.guard';
import { EmailCodeGuard } from '@app/common/guards/email-code.guard';
import { MixerAuthGuard } from '@app/common/guards/mixer-auth.guard';
@ApiTags('登录')
@ApiBearerAuth()
@UseGuards(ThrottlerBehindProxyGuard)
@Controller()
export class LoginController {
    logger: Logger;
    constructor(
        private readonly loginService: LoginService,
        private readonly sharedService: SharedService,
        private readonly inviteService: InviteUserService,
    ) {
        this.logger = new Logger(LoginController.name)
    }

    /* 获取图片验证码 */
    @Get('captchaImage')
    @Public()
    async captchaImage(): Promise<ResImageCaptchaDto> {
        return await this.loginService.createImageCaptcha()
    }

    /* 用户密码登录 */
    @Post('login')
    @Public()
    // @UseGuards(ImageCaptchaGuard, LocalAuthGuard)
    @UseGuards(ImageCaptchaGuard, LocalAuthGuard)
    @Keep()
    // @UseGuards(LocalAuthGuard)
    async login(@Body() reqLoginDto: ReqLoginDto, @Req() req: Request, @Res() response: Response) {
        // Todo: forTest
        // if (!await this.sharedService.checkImageCaptcha(reqLoginDto.uuid, reqLoginDto.code))
        // throw new ApiException('图形验证码错误')
        const data = await this.loginService.login(req)
        response.set({ "X-Token": data.token }).send({ code: 200, msg: "Success", data: data }).end();
        // return data
    }

    /* 混合邮箱/手机号密码登录 */
    @Post('mixlogin')
    @Public()
    // @UseGuards(ImageCaptchaGuard, LocalAuthGuard)
    @UseGuards(MixerAuthGuard)
    @Keep()
    // @UseGuards(LocalAuthGuard)
    async mixlogin(@Body() reqLoginDto: ReqMixLoginDto, @Req() req: Request, @Res() response: Response) {
        // Todo: forTest
        // if (!await this.sharedService.checkImageCaptcha(reqLoginDto.uuid, reqLoginDto.code))
        // throw new ApiException('图形验证码错误')
        const data = await this.loginService.login(req)
        response.set({ "X-Token": data.token }).send({ code: 200, msg: "Success", data: data }).end();
        // return data
    }

    /* 用户手机登录 */
    @Post('mlogin')
    @Public()
    // @UseGuards(SmsCodeGuard, MobileAuthGuard)
    @UseGuards(MobileAuthGuard)
    async mlogin(@Body() reqLoginDto: ReqMobileLoginDto, @Req() req: Request): Promise<ResLoginDto> {
        return await this.loginService.login(req)
    }

    /* 用户邮箱登录 */
    @Post('elogin')
    @Public()
    // @UseGuards(SmsCodeGuard, MobileAuthGuard)
    @UseGuards(EmailAuthGuard)
    async elogin(@Body() reqLoginDto: ReqEmailLoginDto, @Req() req: Request): Promise<ResLoginDto> {
        return await this.loginService.login(req)
    }

    /* 微信小程序登录 */
    @Post('wxlogin')
    @Public()
    @UseGuards(WeixinAuthGuard)
    async wxlogin(@Body() reqLoginDto: ReqWeixinLoginDto, @Req() req: Request): Promise<ResLoginDto> {

        const result = await this.loginService.login(req)
        const { user } = req as any
        if(reqLoginDto.inviteCode) {
            await this.inviteService.bindInviteCode(user.userId, reqLoginDto.inviteCode)
        }
        return result
    }

    /* 微信web端登录 */
    @Post('weilogin')
    @Public()
    @UseGuards(WeixinWebAuthGuard)
    async weilogin(@Body() reqLoginDto: ReqWeixinLoginDto, @Req() req: Request): Promise<ResLoginDto> {

        const result = await this.loginService.login(req)
        const { user } = req as any
        if(reqLoginDto.inviteCode) {
            await this.inviteService.bindInviteCode(user.userId, reqLoginDto.inviteCode)
        }
        return result
    }
    
    /* 用户手机注册 */
    @Post('mregister')
    @Public()
    @UseGuards(SmsCodeGuard)
    async register(@Body() reqRegDto: ReqMobileRegDto, @Req() req: Request): Promise<ResLoginDto> {
        return await this.loginService.register(reqRegDto, req)
    }

    /* 用户邮箱注册 */
    @Post('eregister')
    @Public()
    @UseGuards(EmailCodeGuard)
    async eregister(@Body() reqRegDto: ReqEmailRegDto, @Req() req: Request): Promise<ResLoginDto> {
        return await this.loginService.register(reqRegDto, req)
    }

    /* 手机验证码和密码注册 */
    @Post('mixPhoneRegister')
    @Public()
    @UseGuards(SmsCodeGuard)
    async mixPhoneregister(@Body() reqRegDto: ReqMobileRegDto, @Req() req: Request): Promise<ResLoginDto> {
        return await this.loginService.register(reqRegDto, req)
    }

    /* 邮箱验证码和密码注册 */
    @Post('mixEmailRegister')
    @Public()
    @UseGuards(EmailCodeGuard)
    async mixEmailregister(@Body() reqRegDto: ReqEmailRegDto, @Req() req: Request): Promise<ResLoginDto> {
        return await this.loginService.register(reqRegDto, req)
    }

    @Post('iregister')
    @Public()
    @RequiresRoles(['admin', 'system'])
    async innerRegister(@Body() reqRegDto: ReqInnerRegDto, @Req() req: Request): Promise<ResLoginDto> {
        return await this.loginService.innerRegister(reqRegDto)
    }

    /* 获取用户信息 */
    @Get('getInfo')
    async getInfo(@UserDec(UserEnum.userId) userId: number) {
        return await this.loginService.getInfo(userId)
    }

    /* 退出登录 */
    @Public()
    @Post('logout')
    async logout(@Headers('Authorization') authorization: string) {
        if (authorization) {
            const token = authorization.slice(7)
            await this.loginService.logout(token)
        }
    }
}
