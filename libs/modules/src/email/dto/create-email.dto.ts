import { OmitType, PartialType } from "@nestjs/swagger"
import { IsOptional, IsString } from "class-validator"
import { Email } from "../entities/email.entity"

export class ListEmailDto extends PartialType(OmitType(Email, ['user'] as const)) { }

export class CreateEmailDto {
    @IsString()
    from: string
    
    @IsString()
    to: string
    
    @IsString()
    subject: string
    
    @IsString()
    text: string

    @IsOptional()
    filenames?: string[]
}

export class SendEmailDto {
    @IsString()
    to: string
    
    @IsString()
    subject: string
    
    @IsString()
    text: string
}

export class SendEmailWithAttachDto {
    @IsString()
    to: string
    
    @IsString()
    subject: string
    
    @IsString()
    text: string

    @IsOptional()
    filenames?: string[]
}
export class ReqEmailCodeSendDto {
    /* 语言 */

    @IsString()
    lang: string
    
    /* 手机号 */
    @IsString()
    email: string

    /* imagecha uuid */
    @IsString()
    uuid: string

    /* imagecha code */
    @IsString()
    code: string
}

export class ReqEmailCodeCheckDto {
    /* email */
    @IsString()
    email: string

    /* code */
    @IsString()
    code: string
}
