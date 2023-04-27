import { ApiProperty } from "@nestjs/swagger"
import { Type } from "class-transformer"
import { IsNumber, IsOptional, IsString } from "class-validator"
import moment from "moment"

export class UserInviteStatsDto {
    /* 开始日期 */
    @IsString()
    @ApiProperty({
        name: 'beginTime',
        // default: moment().format("YYYY-MM-DD")
    })
    beginTime: Date

    /* 结束日期 */
    @IsString()
    @ApiProperty({
        name: 'endTime',
        // default: moment().format("YYYY-MM-DD")
    })
    endTime: Date

    @IsOptional()
    @Type()
    @IsNumber()
    @ApiProperty({
        name: 'count',
        default: 35
    })
    count?: number
}