import { Body, Controller, Get, Inject, Param, Post, Put, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiResponse, ApiTags } from '@nestjs/swagger';
import { UserDec, UserEnum } from '@app/common/decorators/user.decorator';
import { ConfirmWithdrawDto, CreateWithdrawDto, ListMyWithdrawDto, ListWithdrawDto, QueryBankCardInfoDto, ReqBankCertifyDto, ReqWithdrawDto, WithdrawWithCardDto } from './dto/request-fund.dto';
import { FundService } from './fund.service';
import { QueryBankCardResponse } from './dto/response-fund.dto';
import { ApiDataResponse, typeEnum } from '@app/common/decorators/api-data-response.decorator';
import { RequiresRoles } from '@app/common/decorators/requires-roles.decorator';
import { Public } from '@app/common/decorators/public.decorator';
import { ApiPaginatedResponse } from '@app/common/decorators/api-paginated-response.decorator';
import { Withdraw } from './entities/withdraw.entity';
import { PaginationPipe } from '@app/common/pipes/pagination.pipe';
import { PaginationDto } from '@app/common/dto/pagination.dto';

@ApiTags('资金管理')
@ApiBearerAuth()
@Controller('fund')
export class FundController {
    constructor(
        private readonly fundService: FundService
    ) { }

    @Post('bankCertify')
    async bankCertify(@Body() reqBankCertifyDto: ReqBankCertifyDto, @UserDec(UserEnum.userId) userId: number) {
        return await this.fundService.bankCertify(reqBankCertifyDto, userId);
    }

    @Get('bankInfo')
    @ApiDataResponse(typeEnum.object, QueryBankCardResponse)
    async queryBankInfo(@Query() queryBankCardInfo: QueryBankCardInfoDto, @UserDec(UserEnum.userId) userId: number) {
        return await this.fundService.queryBankCardInfo(queryBankCardInfo, userId);
    }
}
