import { ApiHideProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsEnum, IsNumber, IsOptional, IsString } from "class-validator";
import { BaseEntity } from "@app/common/entities/base.entity";
import { Excel } from "@app/modules/common/excel/excel.decorator";
import { ExcelTypeEnum } from "@app/modules/common/excel/excel.enum";
import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from "typeorm";

export enum AddressTypeNumber {
    ETH = 1,
    BSC = 56,
    TRC = 195,
    BTC = 6,
    CRI = 186,
}

export enum AddressTypeEnum {
    ETH = 'ETH',
    BSC = 'BSC',
    TRC = 'TRC',
    BTC = 'BTC',
    CRI = 'CRI',
}

export class Address {
    @PrimaryGeneratedColumn({
        name: 'id',
        comment: '地址id'
    })
    @Type()
    @IsNumber()
    id: number

    @Column({
        name: 'user_id',
        comment: '用户ID',
    })
    @Type()
    @IsNumber()
    userId: number

    @Column({
        name: 'app_id',
        comment: '用户ID',
    })
    @Type()
    @IsNumber()
    appId: number

    @Column({
        name: 'address',
        comment: '地址',
        length: 64
    })
    @Type()
    @IsString()
    address: string

    @Column({
        name: 'private_key',
        comment: '私钥',
        length: 512
    })
    @IsString()
    privateKey: string

    /* 地址状态状态（0正常 1已绑定）*/
    @Column({
        name: 'state',
        comment: '地址状态状态（0正常 1已绑定）',
        type: 'char',
        default: '0',
        length: 1
    })
    @IsString()
    status: string

    /* 创建时间 */
    @ApiHideProperty()
    @CreateDateColumn({
        name: 'create_time',
        comment: '创建时间'
    })
    createTime: number
}

@Entity('address_btc')
export class AddressBTC extends Address {
}

@Entity('address_eth')
export class AddressETH extends Address {
}

@Entity('address_bsc')
export class AddressBSC extends Address {
}

@Entity('address_trc')
export class AddressTRC extends Address {
}

@Entity('address_cri')
export class AddressCRI extends Address {
}