import { Type } from "class-transformer"
import { IsEnum, IsNumber, IsOptional, IsString } from "class-validator"
import { Withdraw } from "../entities/withdraw.entity"
import { OmitType, PartialType } from "@nestjs/swagger"
import { AddressTypeEnum } from "../../address/entities/address.entity"

export class ListWithdrawDto extends PartialType(OmitType(Withdraw, ['user', 'currency'] as const)) { }

export class CreateWithdrawDto {
    /* 代币名称：USDT */
    @IsString()
    currency: string

    /* 地址类型：ETH/BSC/TRC */
    @IsEnum(AddressTypeEnum)
    addressType: AddressTypeEnum

    /* 提币目标地址 */
    @IsString()
    toAddress: string

    /* 提币数量 */
    @Type()
    @IsNumber()
    amount: number
}

export class WithdrawWithCardDto {
    @IsNumber()
    withdrawId: number

    @IsNumber()
    fromAddressId: number
}

export class ReqConfirmPayDto {
    version: number
    hy_token_id: string
    verify_code: string
}

export class ConfirmWithdrawDto {
    @Type()
    @IsNumber()
    withdrawId: number
}

export class ConfirmPayWithCardDto {
    @IsNumber()
    fundId: number

    @IsString()
    verifyCode: string
}

export class ListMyWithdrawDto {
    @IsOptional()
    @IsString()
    status?: string
}

export class ReqWithdrawNotifyDto {
    @IsString()
    orderNo: string

    @IsString()
    amount: string

    @IsString()
    txid: string

    @IsString()
    status: string // 0: fail 1: success
}
