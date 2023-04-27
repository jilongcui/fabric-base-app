import { IsEnum, IsNumber, IsString } from "class-validator";
import { AddressTypeEnum, AddressTypeNumber } from "../entities/address.entity";

export class ResAddressDto {
    @IsString()
    address: string;
    @IsString()
    privatekeyEncode: string;
}

export class ResRequestAddressDto {
    @IsString()
    address: string;

    @IsEnum(AddressTypeEnum)
    addressType: AddressTypeEnum;
}

export class ResWalletAddressDto {

    @IsString()
    user: string

    @IsString()
    address: string;

    @IsNumber()
    chain: number

    @IsNumber()
    balance: number
}

export class ResAddressWithdrawDto {

    @IsString()
    user: string

    @IsString()
    address: string;

    @IsNumber()
    chain: number

    @IsNumber()
    balance: number
}