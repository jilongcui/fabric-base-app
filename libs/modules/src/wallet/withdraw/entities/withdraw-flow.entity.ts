import { ApiHideProperty } from "@nestjs/swagger";
import { IsNumber, IsOptional, IsString } from "class-validator";
import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Withdraw } from "./withdraw.entity";

@Entity()
export class WithdrawFlow {
    @PrimaryGeneratedColumn()
    @IsNumber()
    id: number

    /* 提现状态 0: 未审核 1: 提现中 2: 提现完成 3:取消提现 4: 提现失败 */
    @Column({
        name: 'step',
        default: '0',
        comment: '提现流水步骤 0: 发起提现 1: 平台审核 2: 银行处理 3:到账',
        type: 'char',
        length: 1
    })
    @IsString()
    step: string

    /* 提现状态 0: 未审核 1: 提现中 2: 提现完成 3:取消提现 4: 提现失败 */
    @Column({
        name: 'status',
        default: '0',
        comment: '步骤状态 0: 执行中 1: 成功 2: 失败 ',
        type: 'char',
        length: 1
    })
    @IsString()
    status: string

    /* 步骤描述 */
    @Column({
        name: 'remark',
        comment: '步骤描述 ',
        length: 50
    })
    @IsString()
    remark: string

    @Column({
        name: 'withdraw_id',
        comment: '所属提现订单'
    })
    @IsOptional()
    @IsNumber()
    withdrawId?: number

    @ApiHideProperty()
    @IsOptional()
    @ManyToOne(() => Withdraw)
    @JoinColumn({
        name: 'withdraw_id',
    })
    withdraw?: Withdraw

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
