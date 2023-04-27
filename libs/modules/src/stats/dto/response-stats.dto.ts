import { Excel } from "@app/modules/common/excel/excel.decorator"
import { ApiProperty } from "@nestjs/swagger"
import { IsNumber, IsOptional, IsString } from "class-validator"
import moment from "moment"

export class ResInviteUserDto {
    @Excel({
        name: '排名'
    })
    rank: number
    @Excel({
        name: '用户ID'
    })
    userId: number
    @Excel({
        name: '用户名'
    })
    userName: string
    @Excel({
        name: '邀请数量'
    })
    inviteCount: number
}

export class StatsNewUserDto {
    @Excel({
        name: '用户ID'
    })
    userId: number
    @Excel({
        name: '用户名'
    })
    userName: string

    @Excel({
        name: '创建时间'
    })
    createTime: Date
}

export class UserCollectionDto {
    /* 用户ID */
    @Excel({
        name: '用户ID',
    })
    @IsNumber()
    userId: number

    /* 藏品Ids */
    @Excel({
        name: '藏品Ids',
    })
    @IsString()
    collections: string
}