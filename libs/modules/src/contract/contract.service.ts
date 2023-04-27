import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PaginatedDto } from '@app/common/dto/paginated.dto';
import { PaginationDto } from '@app/common/dto/pagination.dto';
import { Repository, FindOptionsWhere } from 'typeorm';
import { CreateContractDto, ListContractDto, UpdateContractDto } from './dto/request-contract.dto';
import { Contract } from './entities/contract.entity';

@Injectable()
export class ContractService {
  constructor(
    @InjectRepository(Contract) private readonly orderRepository: Repository<Contract>,
  ) { }
  create(createContractDto: CreateContractDto) {
    return this.orderRepository.save(createContractDto);
  }

  /* 新增或编辑 */
  async addOrUpdateAll(createContractDto: CreateContractDto) {
    return await this.orderRepository.save(createContractDto)
  }

  /* 分页查询 */
  async list(listContractList: ListContractDto, paginationDto: PaginationDto): Promise<PaginatedDto<Contract>> {
    let where: FindOptionsWhere<Contract> = {}
    let result: any;
    where = listContractList;
    result = await this.orderRepository.findAndCount({
      // select: ['id', 'address', 'privateKey', 'userId', 'createTime', 'status'],
      where,
      skip: paginationDto.skip,
      take: paginationDto.take,
      order: {
        createTime: 1,
      }
    })

    return {
      rows: result[0],
      total: result[1]
    }
  }

  findOne(id: number) {
    return this.orderRepository.findOneBy({ id })
  }

  update(id: number, updateContractDto: UpdateContractDto) {
    return this.orderRepository.update(id, updateContractDto)
  }

  deleteOne(id: number) {
    return this.orderRepository.delete(id)
  }

  async delete(noticeIdArr: number[] | string[]) {
    return this.orderRepository.delete(noticeIdArr)
  }
}
