import { OmitType } from "@nestjs/swagger";
import { IsEnum, IsNumber, IsOptional, IsString } from "class-validator";
import { PaginationDto } from "@app/common/dto/pagination.dto";
import { Address, AddressTypeEnum, AddressTypeNumber } from "../entities/address.entity";

export class ReqAddressCreateDto {
    // @IsString()
    // currencyId: string;

    @IsString()
    userId: number;

    @IsString()
    appId: number;

    @IsEnum(AddressTypeEnum)
    addressType: AddressTypeEnum;
}

export class ReqAddressRequestDto {
    // @IsString()
    // currencyId: string;

    @IsNumber()
    appId: number;

    @IsEnum(AddressTypeEnum)
    addressType: AddressTypeEnum;
}

export class ReqAddressWithdrawDto {

    @IsString()
    address: string

    @IsString()
    currency: string  // 'USDT', '0x123455566',
    
    @IsNumber()
    amount: number

    @IsEnum(AddressTypeEnum)
    addressType: AddressTypeEnum

    @IsString()
    order: string
}

export class ReqMyAddressDto {
    // @IsString()
    // currencyId: string;

    @IsString()
    addressType: string;
}

export class ReqBindAddressDto {
    /*  CRI地址 */
    @IsString()
    address: string;
}

export class ReqAddressAddDto extends OmitType(Address, ['id', 'status', 'createTime'] as const) { }

export class ReqAddressList extends PaginationDto {

    /* 地址 */
    @IsOptional()
    @IsString()
    address?: string;

    /* 创建人 */
    @IsOptional()
    @IsString()
    userId?: number;

    // /* 代币类型 */
    // @IsOptional()
    // @IsString()
    // currencyType?: string;

    /* 代币类型 */
    @IsOptional()
    @IsEnum(AddressTypeEnum)
    addressType: AddressTypeEnum;
}
