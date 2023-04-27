import { ApiDataResponse, typeEnum } from '@app/common/decorators/api-data-response.decorator';
import { Keep } from '@app/common/decorators/keep.decorator';
import { Public } from '@app/common/decorators/public.decorator';
import { RequiresPermissions } from '@app/common/decorators/requires-permissions.decorator';
import { PaginationDto } from '@app/common/dto/pagination.dto';
import { PaginationPipe } from '@app/common/pipes/pagination.pipe';
import { Body, CacheInterceptor, CacheKey, CacheTTL, Controller, Get, Param, Post, Query, StreamableFile, UseInterceptors } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { SkipThrottle } from '@nestjs/throttler';
import { AirdropWhitelist } from '../assistant/airdrop/entities/airdrop-whitelist.entity';
import { ExcelService } from '../common/excel/excel.service';
import { UserInviteStatsDto } from './dto/request-stats.dto';
import { ResInviteUserDto, StatsNewUserDto, UserCollectionDto } from './dto/response-stats.dto';
import { StatsService } from './stats.service';

@ApiTags('统计')
@SkipThrottle()
@ApiBearerAuth()
@UseInterceptors(CacheInterceptor)
@Controller('stats')
export class StatsController {
    constructor(
        private readonly statsService: StatsService,
        private readonly excelService: ExcelService
    ) { }
    @Get('userInviteInfo')
    @Public()
    @CacheTTL(300)
    @ApiDataResponse(typeEnum.objectArr, ResInviteUserDto)
    async userInviteInfo(@Query() userInviteStatsDto: UserInviteStatsDto) {
        return await this.statsService.getUserInviteInfo(userInviteStatsDto);
    }

    /* 导出邀请排名 */
    @Post('exportInviteRank')
    @RequiresPermissions('stats:inviteuser:export')
    @Keep()
    async userInviteLevel(@Body() userInviteStatsDto: UserInviteStatsDto, @Body(PaginationPipe) paginationDto: PaginationDto,) {
        const rows = await this.statsService.getUserInviteInfo(userInviteStatsDto);
        const file = await this.excelService.export(ResInviteUserDto, rows)
        return new StreamableFile(file)
    }

    /* 导出新的被邀请用户 */
    @Post('exportNewUser')
    @RequiresPermissions('stats:inviteuser:export')
    @Keep()
    async newInviteUser(@Body() userInviteStatsDto: UserInviteStatsDto, @Body(PaginationPipe) paginationDto: PaginationDto,) {
        const rows = await this.statsService.listOfInviteUser(userInviteStatsDto);
        const file = await this.excelService.export(StatsNewUserDto, rows)
        return new StreamableFile(file)
    }

    /* 通过拥有的collection来导出用户列表，用于导出白名单 */
    @Post('exportUserByCollections/:ids')
    @RequiresPermissions('stats:userbycollections:export')
    @Keep()
    async exportOrder(@Param('ids') ids: string) {
        const { rows } = await this.statsService.listUserByCollections(ids);
        const file = await this.excelService.export(UserCollectionDto, rows)
        return new StreamableFile(file)
    }
}
