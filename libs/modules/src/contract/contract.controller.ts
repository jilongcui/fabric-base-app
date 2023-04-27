import { Controller, Get, Post, Body, Patch, Param, Delete, Put, Query } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { DataObj } from '@app/common/class/data-obj.class';
import { ApiPaginatedResponse } from '@app/common/decorators/api-paginated-response.decorator';
import { Public } from '@app/common/decorators/public.decorator';
import { PaginationDto } from '@app/common/dto/pagination.dto';
import { PaginationPipe } from '@app/common/pipes/pagination.pipe';
import { ContractService } from './contract.service';
import { CreateContractDto, ListContractDto, UpdateAllContractDto, UpdateContractDto } from './dto/request-contract.dto';
import { Contract } from './entities/contract.entity';
import { RequiresRoles } from '@app/common/decorators/requires-roles.decorator';
@ApiTags('链上合约')
@ApiBearerAuth()
@Controller('contract')
export class ContractController {
  constructor(private readonly contractService: ContractService) { }

  @Post()
  @RequiresRoles(['admin','system'])
  async create(@Body() createContractDto: CreateContractDto) {
    return await this.contractService.create(createContractDto);
  }

  @Put(':id')
  @RequiresRoles(['admin','system'])
  async updateAll(@Param('id') id: string, @Body() updateAllContractDto: UpdateAllContractDto) {
    return await this.contractService.addOrUpdateAll(updateAllContractDto);
  }

  @Patch(':id')
  @RequiresRoles(['admin','system'])
  async update(@Param('id') id: string, @Body() updateContractDto: UpdateContractDto) {
    return await this.contractService.update(+id, updateContractDto);
  }

  /* 产品列表 */
  @Get('list')
  @Public()
  @ApiPaginatedResponse(Contract)
  async list(@Query() listContractDto: ListContractDto, @Query(PaginationPipe) paginationDto: PaginationDto) {
    return await this.contractService.list(listContractDto, paginationDto);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await this.contractService.findOne(+id);
  }

  @Delete(':id')
  @RequiresRoles(['admin','system'])
  async removeOne(@Param('id') id: string) {
    return await this.contractService.deleteOne(+id);
  }

  @Delete(':ids')
  @RequiresRoles(['admin','system'])
  async remove(@Param('ids') ids: string) {
    return await this.contractService.delete(ids.split(','));
  }
}
