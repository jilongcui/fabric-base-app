import { IsOptional, IsString } from "class-validator"

export class ReqLoginDto {
    /* uuid码 */
    @IsString()
    uuid: string

    /* 验证码code */
    @IsString()
    code: string

    /* 用户名 */
    @IsString()
    username: string

    /* 密码 */
    @IsString()
    password: string
}

export class ReqMixLoginDto {
    /* 用户名 */
    @IsString()
    username: string

    /* 密码 */
    @IsString()
    password: string
}

export class ReqMobileLoginDto {

    /* 手机号 */
    @IsString()
    phone: string

    /* 验证码code */
    @IsString()
    code: string

}

export class ReqEmailLoginDto {

    /* 邮箱 */
    @IsString()
    email: string

    /* 验证码code */
    @IsString()
    code: string

}

export class ReqWeixinLoginDto {
    /* 微信应用ID */
    @IsString()
    appId: string

    /* 微信小程序code */
    @IsString()
    code: string

    /* 邀请码 */
    @IsOptional()
    @IsString()
    inviteCode?: string
}

export class ReqMobileRegDto {
    /* 用户名 */
    @IsString()
    phone: string

    /* 验证码code */
    @IsString()
    code: string

    /* 密码 */
    @IsOptional()
    @IsString()
    password: string

    @IsOptional()
    @IsString()
    invite?: string
}

export class ReqEmailRegDto {
    /* 用户名 */
    @IsString()
    email: string

    /* 验证码code */
    @IsString()
    code: string

    /* 密码 */
    @IsOptional()
    @IsString()
    password: string

    @IsOptional()
    @IsString()
    invite?: string
}

export class ReqInnerRegDto {
    @IsOptional()
    @IsString()
    invite?: string
}

export class QueryInviteUserDto {
    /* 邀请码 */
    @IsOptional()
    @IsString()
    invite?: string
}