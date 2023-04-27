import { Body, Controller, Get, Inject, Param, Post, Put, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiResponse, ApiTags } from '@nestjs/swagger';
import { UserDec, UserEnum } from '@app/common/decorators/user.decorator';
import { ConfirmWithdrawDto, CreateWithdrawDto, ListMyWithdrawDto, ListWithdrawDto, ReqWithdrawNotifyDto } from './dto/create-withdraw.dto';
import { WithdrawService } from './withdraw.service';
import { ApiDataResponse, typeEnum } from '@app/common/decorators/api-data-response.decorator';
import { RequiresRoles } from '@app/common/decorators/requires-roles.decorator';
import { ApiPaginatedResponse } from '@app/common/decorators/api-paginated-response.decorator';
import { Withdraw } from './entities/withdraw.entity';
import { PaginationPipe } from '@app/common/pipes/pagination.pipe';
import { PaginationDto } from '@app/common/dto/pagination.dto';
import { PaginatedDto } from '@app/common/dto/paginated.dto';
import { Public } from '@app/common/decorators/public.decorator';

@ApiTags('提现管理')
@ApiBearerAuth()
@Controller('wallet/withdraw')
export class WithdrawController {
    constructor(
        private readonly withdrawService: WithdrawService
    ) { }

    @Post()
    async createWithdraw(@Body() creatWithdrawDto: CreateWithdrawDto, @UserDec(UserEnum.userId) userId: number) {
        return await this.withdrawService.createWithdrawRequest(creatWithdrawDto, userId);
    }

    @Post('confirm')
    @RequiresRoles(['admin', 'system'])
    async confirmWithdraw(@Body() confirmWithdrawDto: ConfirmWithdrawDto, @UserDec(UserEnum.userId) userId: number) {
        return await this.withdrawService.confirmWithdrawRequest(confirmWithdrawDto, userId);
    }

    @Post('notify')
    @Public()
    async notifyWithdraw(@Body() notifyWithdrawDto: ReqWithdrawNotifyDto) {
        return await this.withdrawService.notifyWithdraw(notifyWithdrawDto);
    }

    /* 订单列表 */
    @Get('list')
    @ApiPaginatedResponse(PaginatedDto<Withdraw>)
    async list(@Query() listWithdrawDto: ListWithdrawDto, @Query(PaginationPipe) paginationDto: PaginationDto) {
        return await this.withdrawService.list(listWithdrawDto, paginationDto);
    }

    /* 我的订单列表 */
    @Get('mylist')
    @ApiPaginatedResponse(PaginatedDto<Withdraw>)
    async mylist(@Query() listMyWithdrawDto: ListMyWithdrawDto, @UserDec(UserEnum.userId) userId: number, @Query(PaginationPipe) paginationDto: PaginationDto) {
        return await this.withdrawService.mylist(userId, listMyWithdrawDto, paginationDto);
    }

    @Put(':id/cancel')
    async cancel(@Param('id') id: string, @UserDec(UserEnum.userId) userId: number) {
        return await this.withdrawService.cancel(+id, userId);
    }

    @Put(':id/fail')
    @RequiresRoles(['admin', 'system'])
    async fail(@Param('id') id: string, @UserDec(UserEnum.userId) userId: number) {
        return await this.withdrawService.fail(+id, userId);
    }

    @Get(':id')
    @ApiDataResponse(typeEnum.object, Withdraw)
    async findOne(@Param('id') id: string) {
        return await this.withdrawService.findOne(+id);
    }

}
