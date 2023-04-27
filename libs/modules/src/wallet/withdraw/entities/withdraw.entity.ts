import { ApiHideProperty } from "@nestjs/swagger";
import { IsEnum, IsNumber, IsOptional, IsString } from "class-validator";
import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Type } from "class-transformer";
import { WithdrawFlow } from "./withdraw-flow.entity";
import { User } from "@app/modules/system/user/entities/user.entity";
import { Address, AddressTypeEnum } from "../../address/entities/address.entity";
import { Currency } from "@app/modules/currency/entities/currency.entity";

@Entity()
export class Withdraw {
    @PrimaryGeneratedColumn()
    @IsNumber()
    id: number

    @Column({
        name: 'type',
        default: '0',
        comment: '提现种类 1: 提现到wallet地址',
        type: 'char',
        length: 1
    })
    @IsString()
    type: string

    /* 提现状态 0: 未审核 1: 提现中等待确认 2: 提现完成 3:取消提现 4: 提现失败 */
    @Column({
        name: 'status',
        default: '0',
        comment: '提现状态 0: 等待审核 1: 等待网络确认 2: 提现完成 3:取消提现 4: 提现失败 5: 审核未通过',
        type: 'char',
        length: 1
    })
    @IsString()
    status: string

    /* 提现总金额 */
    @Column({
        name: 'total_price',
        type: "decimal", precision: 10, scale: 2, default: 0,
        comment: '订单总金额'
    })
    @IsNumber()
    totalPrice: number

    /* 提现手续费 */
    @Column({
        name: 'total_fee',
        type: "decimal", precision: 10, scale: 2, default: 0.00,
        comment: '订单费用'
    })
    @IsNumber()
    totalFee: number

    /* 提现到账 */
    @Column({
        name: 'real_price',
        type: "decimal", precision: 10, scale: 2, default: 0.00,
        comment: '订单实际金额'
    })
    @IsNumber()
    realPrice: number

    @Column({
        name: 'bill_no',
        default: '',
        comment: '来自支付平台的 确认订单后，汇付宝单据号',
        length: 50
    })
    @IsString()
    billNo?: string

    @Column({
        name: 'address_type',
        comment: '地址类型'
    })
    @IsEnum(AddressTypeEnum)
    addressType: AddressTypeEnum

    @Column({
        name: 'currency_id',
        default: null,
        comment: '代币Id'
    })
    @Type()
    currencyId: number

    @ApiHideProperty()
    @ManyToOne(() => Currency)
    @JoinColumn({
        name: 'currency_id',
    })
    @IsOptional()
    currency?: Currency

    @Column({
        name: 'to_address',
        comment: '转到的地址'
    })
    @IsOptional()
    @IsString()
    toAddress?: string

    @Column({
        name: 'txid',
        comment: '交易ID',
        nullable: true,
        default: null,
    })
    @IsString()
    txid: string;

    @Column({
        name: 'user_id',
        comment: '订单所属用户'
    })
    @IsOptional()
    @IsNumber()
    userId?: number

    @ApiHideProperty()
    @ManyToOne(() => User)
    @JoinColumn({
        name: 'user_id',
    })
    user?: User

    // @ApiHideProperty()
    // @IsOptional()
    // @OneToMany(() => WithdrawFlow, withdrawFlow => withdrawFlow.withdraw)
    // withdrawFlows?: WithdrawFlow[]

    @ApiHideProperty()
    @CreateDateColumn({
        name: 'create_time',
        comment: '创建时间'
    })
    createTime: number

    @ApiHideProperty()
    @UpdateDateColumn({
        name: 'update_time',
        comment: '更新时间'
    })
    updateTime: Date
}
