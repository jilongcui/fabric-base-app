import { OmitType } from "@nestjs/swagger";
import { IsNumber, IsOptional, IsString } from "class-validator";
import { PaginationDto } from "@app/common/dto/pagination.dto";
import { RechargeCollect } from "../entities/rechage-collect.entity";
import { AddressTypeEnum } from "../../address/entities/address.entity";

export class ReqAddRechargeCollectDto extends OmitType(RechargeCollect, ['id', 'createTime'] as const) { }
export class ReqCollectRechargeNotifyDto extends OmitType(RechargeCollect, ['id', 'state', 'confirmState', 'feeState', 'createTime', 'userId', 'fee'] as const) { }

export class ReqRechargeCollectListDto extends PaginationDto {

    /* 地址 */
    @IsOptional()
    @IsString()
    address?: string;

    /* 交易ID */
    @IsOptional()
    @IsString()
    txid?: string;

    /* 币种ID */
    @IsOptional()
    @IsNumber()
    currencyId?: number;

    /* 代币类型 */
    @IsOptional()
    @IsString()
    addressType?: AddressTypeEnum;

    /* 确认状态 */
    @IsOptional()
    @IsNumber()
    confirmState?: number;
}