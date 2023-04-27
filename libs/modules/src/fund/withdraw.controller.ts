import { Body, Controller, Get, Inject, Param, Post, Put, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiResponse, ApiTags } from '@nestjs/swagger';
import { UserDec, UserEnum } from '@app/common/decorators/user.decorator';
import { ConfirmWithdrawDto, CreateWithdrawDto, ListMyWithdrawDto, ListWithdrawDto, QueryBankCardInfoDto, ReqBankCertifyDto, ReqWithdrawDto, WithdrawWithCardDto } from './dto/request-fund.dto';
import { FundService } from './fund.service';
import { ApiDataResponse, typeEnum } from '@app/common/decorators/api-data-response.decorator';
import { RequiresRoles } from '@app/common/decorators/requires-roles.decorator';
import { Public } from '@app/common/decorators/public.decorator';
import { ApiPaginatedResponse } from '@app/common/decorators/api-paginated-response.decorator';
import { Withdraw } from './entities/withdraw.entity';
import { PaginationPipe } from '@app/common/pipes/pagination.pipe';
import { PaginationDto } from '@app/common/dto/pagination.dto';
import { PaginatedDto } from '@app/common/dto/paginated.dto';

@ApiTags('资金提现管理')
@ApiBearerAuth()
@Controller('fund/withdraw')
export class WithdrawController {
    constructor(
        private readonly fundService: FundService
    ) { }

    @Post()
    async createWithdraw(@Body() creatWithdrawDto: CreateWithdrawDto, @UserDec(UserEnum.userId) userId: number) {
        return await this.fundService.createWithdrawRequest(creatWithdrawDto, userId);
    }

    @Post('confirm')
    @RequiresRoles(['admin', 'system'])
    async confirmWithdraw(@Body() confirmWithdrawDto: ConfirmWithdrawDto, @UserDec(UserEnum.userId) userId: number) {
        return await this.fundService.confirmWithdrawRequest(confirmWithdrawDto, userId);
    }

    /* 资金提现列表 */
    @Get('list')
    @ApiPaginatedResponse(PaginatedDto<Withdraw>)
    async list(@Query() listWithdrawDto: ListWithdrawDto, @Query(PaginationPipe) paginationDto: PaginationDto) {
        return await this.fundService.list(listWithdrawDto, paginationDto);
    }

    /* 我的资金提现列表 */
    @Get('mylist')
    @ApiPaginatedResponse(PaginatedDto<Withdraw>)
    async mylist(@Query() listMyWithdrawDto: ListMyWithdrawDto, @UserDec(UserEnum.userId) userId: number, @Query(PaginationPipe) paginationDto: PaginationDto) {
        return await this.fundService.mylist(userId, listMyWithdrawDto, paginationDto);
    }

    @Put(':id/cancel')
    async cancel(@Param('id') id: string, @UserDec(UserEnum.userId) userId: number) {
        return await this.fundService.cancel(+id, userId);
    }

    @Put(':id/fail')
    @RequiresRoles(['admin', 'system'])
    async fail(@Param('id') id: string, @UserDec(UserEnum.userId) userId: number) {
        return await this.fundService.fail(+id, userId);
    }

    @Get(':id')
    @ApiDataResponse(typeEnum.object, Withdraw)
    async findOne(@Param('id') id: string) {
        return await this.fundService.findOne(+id);
    }

}
