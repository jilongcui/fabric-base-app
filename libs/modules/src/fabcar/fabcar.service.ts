import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { CreateFabcarDto } from './dto/create-fabcar.dto';
import { UpdateFabcarDto } from './dto/update-fabcar.dto';
import { FabricNetworkService } from 'libs/fabric-network/src';
import { Contract, Network } from 'fabric-network';
import { SharedService } from '@app/shared';

@Injectable()
export class FabcarService implements OnModuleInit{
  network: Network
  contract: Contract
  chainCodeName: string
  myChannelName: string
  logger = new Logger(FabcarService.name)

  constructor(
    private readonly fabricNetwork: FabricNetworkService,
    private readonly sharedService: SharedService,
  ) {
    this.chainCodeName = 'fabcar'
    this.myChannelName = 'mychannel'
  }

  async onModuleInit() {
    this.network = await this.fabricNetwork.getNetwork(this.myChannelName)
    this.contract = this.network.getContract(this.chainCodeName)
  }

  async create(createFabcarDto: CreateFabcarDto) {
    // Submit the specified transaction.
    // createCar transaction - requires 5 argument, ex: ('createCar', 'CAR12', 'Honda', 'Accord', 'Black', 'Tom')
    const result = await this.contract.submitTransaction('createCar', createFabcarDto.id, createFabcarDto.make,
      createFabcarDto.model, createFabcarDto.color, createFabcarDto.owner);
    this.logger.debug(result)
    console.log(`Transaction has been submitted`);
    return result
  }

  async findOne(id: string) {
    const result = await this.contract.evaluateTransaction('queryCar', id)
    this.logger.debug(result)
    return result
  }

  findAll() {
    return `This action returns all fabcar`;
  }

  update(id: number, updateFabcarDto: UpdateFabcarDto) {
    return `This action updates a #${id} fabcar`;
  }

  remove(id: number) {
    return `This action removes a #${id} fabcar`;
  }
}
