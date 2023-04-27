import { ApiHideProperty } from "@nestjs/swagger";
import { IsEnum, IsNumber, IsString } from "class-validator";
import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { AddressTypeEnum } from "../../address/entities/address.entity";
import { Currency } from "@app/modules/currency/entities/currency.entity";

@Entity()
export class RechargeCollect {
    @PrimaryGeneratedColumn({
        name: 'id',
        comment: '主ID',
    })
    @IsNumber()
    id: number;

    @Column({
        name: 'from',
        comment: '付款地址',
        length: 128
    })
    @IsString()
    from: string;

    @Column({
        name: 'currency_type',
        comment: '代币类型 BTC/ETH/TRC/BSC',
    })
    @IsEnum(AddressTypeEnum)
    addressType: AddressTypeEnum;

    @Column({
        name: 'currency_id',
        comment: '关联currency表',
    })
    @IsNumber()
    currencyId: number;

    @ApiHideProperty()
    @ManyToOne(() => Currency)
    @JoinColumn({
        name: 'currency_id',
    })
    currency?: Currency

    @Column({
        name: 'to',
        comment: '收款地址',
        length: 128,
        nullable: true,
        default: null
    })
    @IsString()
    to: string;

    @Column({
        name: 'amount',
        comment: '汇款金额',
        type: "decimal", precision: 10, scale: 4, default: 0,
        nullable: true,
    })
    @IsNumber()
    amount: number;

    @Column({
        name: 'fee',
        comment: '汇款手续费',
        type: "decimal", precision: 10, scale: 4, default: 0,
        nullable: true,
    })
    @IsNumber()
    fee: number;

    @Column({
        name: 'txid',
        comment: '交易ID',
        nullable: true,
        default: null,
    })
    @IsString()
    txid: string;

    @Column({
        name: 'fee_state',
        comment: '是否提供了汇总手续费，1为是，0为否，防止重复提供手续费',
        default: 0
    })
    @IsNumber()
    feeState: number;

    @Column({
        name: 'state',
        comment: '状态，1为已汇总，0为等待汇总',
        type: 'tinyint',
        default: 0,
    })
    @IsNumber()
    state: number;

    @Column({
        name: 'confirm_state',
        comment: '交易确认状态，0为未确认，1为已确认',
        type: 'tinyint',
        default: 0
    })
    @IsNumber()
    confirmState: number;

    /* 所属用户 */
    @Column({
        name: 'user_id',
        comment: '所属用户'
    })
    @IsNumber()
    userId: number

    @Column({
        name: 'dealtime',
        comment: '汇总时间'
    })
    @IsNumber()
    dealTime: number;

    @ApiHideProperty()
    @CreateDateColumn({
        name: 'create_time',
        comment: '创建时间'
    })
    createTime: number
}