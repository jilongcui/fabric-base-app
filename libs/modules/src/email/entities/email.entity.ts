import { User } from "@app/modules/system/user/entities/user.entity"
import { ApiHideProperty } from "@nestjs/swagger"
import { IsNumber, IsOptional } from "class-validator"
import { Column, CreateDateColumn, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm"

export class Email {

    @PrimaryGeneratedColumn()
    @IsNumber()
    id: number

    @Column({
        comment: '发送邮箱',
        length: 64
    })
    from: string
    
    @Column({
        comment: '接收邮箱',
        length: 64
    })
    to: string
    
    @Column({
        comment: '发送主题',
        length: 128
    })
    subject: string
    
    @Column({
        comment: '发送内容',
        type: "longtext"
    })
    text: string

    @IsOptional()
    attachment?: string

    @ApiHideProperty()
    @CreateDateColumn({
        name: 'create_time',
        comment: '创建时间'
    })
    createTime: number

    @ApiHideProperty()
    @ManyToOne(() => User, user => user.orders)
    @JoinColumn({
        name: 'user_id',
    })
    user: User
}
