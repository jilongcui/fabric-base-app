import { Query, Controller, Get, Inject, Post, Body } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ApiPaginatedResponse } from '@app/common/decorators/api-paginated-response.decorator';
import { Public } from '@app/common/decorators/public.decorator';
import { CollectService } from './collect.service';
import { ReqCollectRechargeNotifyDto, ReqRechargeCollectListDto } from './dto/req-rechargecollect-list.dto';
import { RechargeCollect } from './entities/rechage-collect.entity';
import { UserDec, UserEnum } from '@app/common/decorators/user.decorator';

@ApiTags("钱包归集")
@ApiBearerAuth()
@Controller('wallet/collect')
export class CollectController {
    constructor(private readonly collectService: CollectService) { }

    @Get('list')
    @Public()
    @ApiPaginatedResponse(RechargeCollect)
    async list(@Query() reqRechargeCollectListDto: ReqRechargeCollectListDto) {
        return this.collectService.list(reqRechargeCollectListDto);
    }

    @Get('mylist')
    @ApiPaginatedResponse(RechargeCollect)
    async mylist(@Query() reqRechargeCollectListDto: ReqRechargeCollectListDto, @UserDec(UserEnum.userId) userId: number) {
        return this.collectService.mylist(reqRechargeCollectListDto, userId);
    }

    @Post('notify')
    @Public() 
    async rechargeNotify(@Body() rechargeNotifyDto: ReqCollectRechargeNotifyDto) {
        return this.collectService.collectionRechargeNotify(rechargeNotifyDto)
    }
}
