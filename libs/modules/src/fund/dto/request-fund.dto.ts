import { OmitType, PartialType, PickType } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsNumber, IsOptional, IsString } from "class-validator";
import internal from "stream";
import { Column } from "typeorm";
import { Withdraw } from "../entities/withdraw.entity";

// export class CreateWithdrawDto extends OmitType(Withdraw, ['id', 'status', 'userId',] as const) { }
// export class UpdateFundDto extends PartialType(CreateWithdrawDto) { }
export class UpdateWithdrawStatusDto extends PickType(Withdraw, ['status']) { }
export class ListWithdrawDto extends PartialType(OmitType(Withdraw, ['user', 'bankcard', 'withdrawFlows'] as const)) { }
export class WebSignDto {
    @IsOptional()
    @IsNumber()
    bankcardId?: number
}

export class WithdrawWithCardDto {
    @IsNumber()
    withdrawId: number

    @IsNumber()
    bankcardId: number
}

export class QueryBankCardInfoDto {
    // @IsNumber()
    // withdrawId: number

    @Type()
    @IsNumber()
    bankcardId: number
}

export class PayWithBalanceDto {
    @IsNumber()
    orderId: number
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

export class WebSignNotifyDto {
    merch_id: string
    out_trade_no: string
    out_trade_time: string
    sign_no: string
    sign: string
}

export class ReqSubmitPayDto {
    agent_bill_id: string
    agent_bill_time: string
    pay_amt: number
    goods_name: string
    hy_auth_uid: string
    user_ip: string
    notify_url: string
    return_url?: string
}

export class ReqWithdrawDto {
    version: number
    agent_id: number
    batch_no: string
    batch_amt: number
    batch_num: number
    detail_data: string
    notify_url: string
    ext_param1: string
    sign_type: string // MD5\RSA\RSA2
    sign: string // MD5\RSA\RSA2签名结果
}

export class ReqConfirmPayDto {
    version: number
    hy_token_id: string
    verify_code: string
}

export class CreateWithdrawDto {
    @Type()
    @IsNumber()
    bankcardId: number

    @Type()
    @IsNumber()
    amount: number
}

export class ConfirmWithdrawDto {
    @Type()
    @IsNumber()
    withdrawId: number
}

export class ReqBankCertifyDto {
    @Type()
    @IsNumber()
    bankcardId: number
}

export class BankCertifyBizDetail {
    bank_card_no: string
    bank_account: string
    id_card: string
}

export class ReqCryptoNotifyDto {
    agent_id?: string
    encrypt_data?: string
    sign?: string
}

export class ReqWithdrawNotify {
    agent_id?: number
    agent_bill_id: string
    agent_bill_time: string
    hy_bill_no: string
    hy_deal_time: string
    deal_note: string
    pay_amt: string
    real_amt: string
    status: string
    hy_auth_uid: string
}