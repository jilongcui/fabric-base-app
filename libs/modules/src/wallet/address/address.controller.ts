import { Body, Controller, Get, Logger, Post, Query } from '@nestjs/common';
import { Public } from '@app/common/decorators/public.decorator';
import { ReqAddressCreateDto, ReqAddressList, ReqAddressRequestDto, ReqBindAddressDto } from './dto/req-address.dto';
import { ResAddressDto, ResRequestAddressDto } from './dto/res-address.dto';
import { AddressService } from './address.service';
import { Address } from './entities/address.entity';
import { UserDec, UserEnum } from '@app/common/decorators/user.decorator';
import { ApiPaginatedResponse } from '@app/common/decorators/api-paginated-response.decorator';
import { PaginationPipe } from '@app/common/pipes/pagination.pipe';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiTags('钱包地址')
@ApiBearerAuth()
@Controller('wallet/address')
export class AddressController {
    logger = new Logger(AddressController.name)
    constructor(private readonly addressService: AddressService,
    ) { }

    @Post()
    addressCreate(@Body() addressCreate: ReqAddressCreateDto): Promise<ResAddressDto> {
        return this.addressService.addressCreate(addressCreate);
    }

    @Get('mylist')
    @ApiPaginatedResponse(Address)
    myList(@Query() query: any, @UserDec(UserEnum.userId) userId: number) {
        this.logger.debug(userId)
        return this.addressService.findOneByUser(userId)
    }

    @Get('list')
    @Public()
    @ApiPaginatedResponse(Address)
    list2(@Query(PaginationPipe) reqAddressList: ReqAddressList) {
        return this.addressService.list(reqAddressList)
    }

    @Post('request')
    addressRequest(@Body() addressCreate: ReqAddressRequestDto, @UserDec(UserEnum.userId) userId: number): Promise<ResRequestAddressDto[]> {
        return this.addressService.addressRequest(addressCreate, userId);
    }

    // @Post('bind/crichain')
    // async bindWithCrichain(@Body() reqBindAddress: ReqBindAddressDto, @UserDec(UserEnum.userId) userId: number) {
    //     return this.addressService.bindWithCrichain(reqBindAddress.address, userId);
    // }
}

