import { Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ResAddressDto, ResRequestAddressDto, ResWalletAddressDto } from './dto/res-address.dto';
import { ReqAddressAddDto, ReqAddressCreateDto, ReqAddressList, ReqAddressRequestDto, ReqAddressWithdrawDto, ReqMyAddressDto } from './dto/req-address.dto';
import * as jaysonPromise from 'jayson/promise';
import { PaginatedDto } from '@app/common/dto/paginated.dto';
import { Address, AddressBSC, AddressBTC, AddressCRI, AddressETH, AddressTRC, AddressTypeEnum, AddressTypeNumber } from './entities/address.entity';
import { FindOptionsWhere, Like, MoreThanOrEqual, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { firstValueFrom } from 'rxjs';
import { ClientProxy } from '@nestjs/microservices';
import { ApiException } from '@app/common/exceptions/api.exception';
// import { RealAuthDto } from '@app/chain/dto/request-chain.dto';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import * as qs from 'qs'; 

@Injectable()
export class AddressService implements OnModuleInit {
    private rpcClient: any;
    private response: ResAddressDto;
    secret: string
    baseUrl: string
    withdrawUrl: string
    appKey: string
    appSecret: string

    logger = new Logger(AddressService.name)
    
    constructor(
        @InjectRepository(AddressETH) private readonly addressEthRepository: Repository<AddressETH>,
        @InjectRepository(AddressBSC) private readonly addressBscRepository: Repository<AddressBSC>,
        @InjectRepository(AddressBTC) private readonly addressBtcRepository: Repository<AddressBTC>,
        @InjectRepository(AddressTRC) private readonly addressTrcRepository: Repository<AddressTRC>,
        @InjectRepository(AddressCRI) private readonly addressCriRepository: Repository<AddressCRI>,
        @Inject('CHAIN_SERVICE') private client: ClientProxy,
        private readonly httpService: HttpService,
        private readonly configService: ConfigService,
    ) { 
        this.secret = this.configService.get<string>('wallet.secret')
        this.baseUrl = this.configService.get<string>('wallet.baseUrl')
        this.withdrawUrl = this.configService.get<string>('wallet.withdrawUrl')
        this.appKey = this.configService.get<string>('wallet.appKey')
        this.appSecret = this.configService.get<string>('wallet.appSecret')
    }

    onModuleInit() {
        console.log("onModuleInit");
        // this.addressRpcService = this.clientRpc.getService<AddressRpcService>('AddressRpcService');
        // create a client
        this.rpcClient = jaysonPromise.client.http({
            host: 'localhost',
            port: 2000
        });
    }

    async addressCreate(data: ReqAddressCreateDto): Promise<ResAddressDto> {
        // Check if exist 
        let exist = false;
        if (data.addressType === AddressTypeEnum.CRI) {
            if (await this.addressCriRepository.findOneBy({ userId: data.userId, appId: data.appId }))
                exist = true;
        }
        else if (data.addressType === AddressTypeEnum.TRC) {
            if (await this.addressTrcRepository.findOneBy({ userId: data.userId, appId: data.appId }))
                exist = true;
        }
        else if (data.addressType === AddressTypeEnum.BSC) {
            if (await this.addressBscRepository.findOneBy({ userId: data.userId, appId: data.appId }))
                exist = true;
        }
        else if (data.addressType === AddressTypeEnum.BTC) {
            if (await this.addressBtcRepository.findOneBy({ userId: data.userId, appId: data.appId }))
                exist = true;
        }
        else if (data.addressType === AddressTypeEnum.ETH) {
            if (await this.addressEthRepository.findOneBy({ userId: data.userId, appId: data.appId }))
                exist = true;
        }

        if (exist) {
            throw new ApiException('User address exist.')
        }
        let response: ResAddressDto;
        if (data.addressType === AddressTypeEnum.CRI) {
            // Get address from chain microservice
            const pattern = { cmd: 'createAddress' }
            response = await firstValueFrom(this.client.send<ResAddressDto>(pattern, {}))

        } else {
            response = await this.rpcClient.request('addressCreate', data);
        }
        const reqAddrAddDto = new ReqAddressAddDto()
        reqAddrAddDto.address = response.address
        reqAddrAddDto.privateKey = response.privatekeyEncode
        reqAddrAddDto.appId = 0
        reqAddrAddDto.userId = data.userId
        if (data.addressType === AddressTypeEnum.CRI)
            await this.addressCriRepository.save(reqAddrAddDto)
        else if (data.addressType === AddressTypeEnum.ETH)
            await this.addressEthRepository.save(reqAddrAddDto)
        else if (data.addressType === AddressTypeEnum.BSC)
            await this.addressBscRepository.save(reqAddrAddDto)
        else if (data.addressType === AddressTypeEnum.TRC)
            await this.addressTrcRepository.save(reqAddrAddDto)
        else if (data.addressType === AddressTypeEnum.BTC)
            await this.addressBtcRepository.save(reqAddrAddDto)
        return response
    }

    async addressRequest(data: ReqAddressRequestDto, userId): Promise<ResRequestAddressDto[]> {
        // Check if exist 
        this.logger.debug('addressRequest ' + data.addressType)
        let exist = false;
        if (data.addressType === AddressTypeEnum.CRI) {
            if (await this.addressCriRepository.findOneBy({ userId: userId, appId: data.appId }))
                exist = true;
        }
        else if (data.addressType === AddressTypeEnum.TRC) {
            if (await this.addressTrcRepository.findOneBy({ userId: userId, appId: data.appId }))
                exist = true;
        }
        else if (data.addressType === AddressTypeEnum.BSC) {
            if (await this.addressBscRepository.findOneBy({ userId: userId, appId: data.appId }))
                exist = true;
        }
        else if (data.addressType === AddressTypeEnum.BTC) {
            if (await this.addressBtcRepository.findOneBy({ userId: userId, appId: data.appId }))
                exist = true;
        }
        else if (data.addressType === AddressTypeEnum.ETH) {
            if (await this.addressEthRepository.findOneBy({ userId: userId, appId: data.appId }))
                exist = true;
        }
        if (exist) {
            throw new ApiException('User address exist.')
        }

        const addressesRes = []
        const responses = await this.requestAddress(userId);
        for(let i=0; i< responses.length; i++) {
            const addressInfo = responses[i]
            const reqAddrAddDto = new ReqAddressAddDto()
            this.logger.debug(addressInfo)
            reqAddrAddDto.address = addressInfo.address
            reqAddrAddDto.privateKey = ''
            reqAddrAddDto.appId = 0
            reqAddrAddDto.userId = userId
            const addressRes = new ResRequestAddressDto()
            addressRes.address = addressInfo.address

            if (addressInfo.chain === AddressTypeNumber.CRI) {
                addressRes.addressType = AddressTypeEnum.CRI
                await this.addressCriRepository.save(reqAddrAddDto)
            }
            else if (addressInfo.chain === AddressTypeNumber.ETH) {
                addressRes.addressType = AddressTypeEnum.ETH
                await this.addressEthRepository.save(reqAddrAddDto)
            }
            else if (addressInfo.chain === AddressTypeNumber.BSC) {
                addressRes.addressType = AddressTypeEnum.BSC
                await this.addressBscRepository.save(reqAddrAddDto)
            }
            else if (addressInfo.chain === AddressTypeNumber.TRC) {
                addressRes.addressType = AddressTypeEnum.TRC
                await this.addressTrcRepository.save(reqAddrAddDto)
            }
            else if (addressInfo.chain === AddressTypeNumber.BTC) {
                addressRes.addressType = AddressTypeEnum.BTC
                await this.addressBtcRepository.save(reqAddrAddDto)
            }
            
            addressesRes.push(addressRes)
        }
        
        return addressesRes
    }

    async requestAddress(userId: number): Promise<ResWalletAddressDto[]> {
        const requestUri = '/wallet/address/create/address'
        const body = {
            user: userId.toString()
        }
        let options = {
            headers: {
                "Content-Type": "application/json"
            },
            params: body
        }
        const remoteUrl = this.baseUrl + requestUri
        let res = await this.httpService.axiosRef.get<ResWalletAddressDto[]>(remoteUrl, options);
        const responseData = res.data
        return responseData
    }


    // http://34.81.44.6:9092/wallet/withdraw/add/withdraw?user=k8us&address=THdAQfcTQ56ncifzMpWXb2X432aK78PtPW&amount=1199&chain=195&contract=TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t&order=k8uu

    async addressWithdraw(data: ReqAddressWithdrawDto, userId): Promise<any> {
        // Check if exist 
        this.logger.debug('addressRequest ' + data.addressType)
        let validate = false;
        let chain = 1;
        if (data.addressType === AddressTypeEnum.CRI) {
            // if (await this.addressCriRepository.findOneBy({ userId: userId, address: data.address }))
            validate = true;
            chain = AddressTypeNumber.CRI
        }
        else if (data.addressType === AddressTypeEnum.TRC) {
            // if (await this.addressTrcRepository.findOneBy({ userId: userId, address: data.address }))
            validate = true;
            chain = AddressTypeNumber.TRC
        }
        else if (data.addressType === AddressTypeEnum.BSC) {
            // if (await this.addressBscRepository.findOneBy({ userId: userId, address: data.address }))
                validate = true;
            chain = AddressTypeNumber.BSC
        }
        else if (data.addressType === AddressTypeEnum.BTC) {
            // if (await this.addressBtcRepository.findOneBy({ userId: userId, address: data.address }))
                validate = true;
            chain = AddressTypeNumber.BTC
        }
        else if (data.addressType === AddressTypeEnum.ETH) {
            // if (await this.addressEthRepository.findOneBy({ userId: userId, address: data.address }))
                validate = true;
            chain = AddressTypeNumber.ETH
        }
        if (!validate) {
            throw new ApiException('地址无效')
        }

        const addressesRes = []
        const response = await this.withdrawAddress(userId, data.address, data.currency, chain, data.order, data.amount);
        
        return response
    }

    async withdrawAddress(userId: number, address: string, currency: string, chain: AddressTypeNumber, order: string, amount: number): Promise<ResWalletAddressDto[]> {
        const requestUri = '/wallet/withdraw/add/withdraw'
        const body = {
            user: userId.toString(),
            address: address,
            amount: amount.toString(),
            chain: chain,
            contract: currency,
            order: order
        }

        let options = {
            headers: {
                "Content-Type": "application/x-www-form-urlencoded;"
            },
        }
        const remoteUrl = this.withdrawUrl + requestUri
        this.logger.debug(remoteUrl)
        const data = qs.stringify(body)
        let res = await this.httpService.axiosRef.post<any>(remoteUrl, data, options);
        const responseData = res.data
        this.logger.debug(responseData)
        return responseData
    }

    // // 钱包充值通知
    // async withdrawNotify(rechargeNotifyDto: ReqCollectRechargeNotifyDto) {
    //     this.logger.debug("Recharge Notice: " + JSON.stringify(rechargeNotifyDto))
    //     // 把collection里的个数增加一个，这个时候需要通过交易完成，防止出现多发问题
    //     return await this.addressEthRepository.manager.transaction(async manager => {
    //         let marketRatio = Number(0)
    //         const currency = await this.currencyService.findOne(rechargeNotifyDto.currencyId)
    //         if (currency) {
    //             const address = await this.addressService.findAddress(rechargeNotifyDto.to, rechargeNotifyDto.addressType)
    //             if(!address)
    //                 throw new ApiException("Address is not exist.")
    //             const configString = await this.sysconfigService.getValue(SYSCONF_COLLECTION_FEE_KEY)
    //             if (configString) {
    //                 const configValue = JSON.parse(configString)
    //                 this.logger.debug('collection config ratio ' + configValue.ratio)
    //                 marketRatio = rechargeNotifyDto.amount * Number(configValue.ratio)
    //             }

    //             if (marketRatio > 1.0 || marketRatio < 0.0) {
    //                 marketRatio = 0.0
    //             }
    //             let marketFee = rechargeNotifyDto.amount * marketRatio
    //             let currencyId = rechargeNotifyDto.currencyId
    //             await manager.increment(Account, { userId: address.userId, currencyId }, "usable", rechargeNotifyDto.amount - marketFee)
    //             await manager.increment(Account, { userId: 1, currencyId}, "usable", marketFee)

    //             const reqAddRechargeCollectDto:ReqAddRechargeCollectDto = {
    //                 ...rechargeNotifyDto,
    //                 feeState: 1,
    //                 state: 1,
    //                 confirmState: 1,
    //             }
    //             await manager.save(RechargeCollect, reqAddRechargeCollectDto) // 支付完成
    //         }
    //     })
    // }

    async findOneByUser(userId: number) {
        let response = { cri: { address: '', status: '' },
            bsc: { address: '', status: '' },
            eth: { address: '', status: '' },
            trc: { address: '', status: '' },
            btc: { address: '', status: '' } }
        let address: Address
        address = await this.addressCriRepository.findOne({ where: { userId: userId } })
        response.cri.address = address ? address.address : undefined
        response.cri.status = address ? address.status : undefined
        address = await this.addressBscRepository.findOne({ where: { userId: userId } })
        response.bsc.address = address ? address.address : undefined
        response.bsc.status = address ? address.status : undefined
        address = await this.addressEthRepository.findOne({ where: { userId: userId } })
        response.eth.address = address ? address.address : undefined
        response.eth.status = address ? address.status : undefined
        address = await this.addressTrcRepository.findOne({ where: { userId: userId } })
        response.trc.address = address ? address.address : undefined
        response.trc.status = address ? address.status : undefined
        address = await this.addressBtcRepository.findOne({ where: { userId: userId } })
        response.btc.address = address ? address.address : undefined
        response.btc.status = address ? address.status : undefined
        return response
    }

    async findOne(addressValue: string, addressType: AddressTypeEnum) {
        // let response = { cri: { address: '', status: '' }, eth: { address: '', status: '' }, trc: { address: '', status: '' }, btc: { address: '', status: '' } }
        let address: Address
        this.logger.debug(`AddressValue ${addressValue}, ${addressType} `)
        if (addressType === AddressTypeEnum.CRI)
            address = await this.addressCriRepository.findOne({ where: { address: addressValue} })
        else if (addressType === AddressTypeEnum.ETH)
            address = await this.addressEthRepository.findOne({ where: { address: addressValue} })
        else if (addressType === AddressTypeEnum.BSC)
            address = await this.addressBscRepository.findOne({ where: { address: addressValue} })
        else if (addressType === AddressTypeEnum.TRC)
            address = await this.addressTrcRepository.findOne({ where: { address: addressValue} })
        else if (addressType === AddressTypeEnum.BTC)
            address = await this.addressBtcRepository.findOne({ where: { address: addressValue} })
        return address
    }

    async findAddress(addressValue: string, addressType: AddressTypeEnum) {
        // let response = { cri: { address: '', status: '' }, eth: { address: '', status: '' }, trc: { address: '', status: '' }, btc: { address: '', status: '' } }
        let address: Address
        this.logger.debug(`AddressValue ${addressValue}, ${addressType} `)
        if (addressType === AddressTypeEnum.CRI)
            address = await this.addressCriRepository.findOne({ where: { address: addressValue} })
        else if (addressType === AddressTypeEnum.ETH)
            address = await this.addressEthRepository.findOne({ where: { address: addressValue} })
        else if (addressType === AddressTypeEnum.BSC)
            address = await this.addressBscRepository.findOne({ where: { address: addressValue} })
        else if (addressType === AddressTypeEnum.TRC)
            address = await this.addressTrcRepository.findOne({ where: { address: addressValue} })
        else if (addressType === AddressTypeEnum.BTC)
            address = await this.addressBtcRepository.findOne({ where: { address: addressValue} })
        return address
    }

    /*
    async bindWithCrichain(address: string, userId: number) {
        // let isIdentify = true;
        const addressInfo = await this.addressCriRepository.findOne({ where: { address: address } })
        if (!addressInfo) {
            throw new ApiException("没有找到此地址")
        }
        if (addressInfo.status !== '0') {
            throw new ApiException("此地址已绑定")
        }

        const identity = await this.identityRepository.findOne({ where: { user: { userId: userId } } })
        if (!identity) {
            throw new ApiException("没有实名认证")
        }
        let isBind = await this.doBindWithCrichain(address, identity.cardId, identity.realName)
        if (isBind) {
            // save address status to '1'
            await this.addressCriRepository.update({ userId: userId }, { status: '1' })
        } else {
            throw new ApiException("地址绑定失败", 403)
        }
    }
    async doBindWithCrichain(
        address: string, cardId: string, realName: string
    ): Promise<boolean> {

        const pattern = { cmd: 'realAuth' }
        const dto = new RealAuthDto()
        dto.hexAddress = address
        dto.userCardId = cardId
        dto.userName = realName
        const response = await firstValueFrom(this.client.send(pattern, dto))
        if (!response || !response.result)
            return false;
        return true
    }
    */

    /* 分页查询 */
    async list(reqAddressList: ReqAddressList): Promise<PaginatedDto<Address>> {
        let where: FindOptionsWhere<Address> = {}
        let result: any;
        if (reqAddressList.address) {
            where.address = Like(`%${reqAddressList.address}%`)
        }
        if (reqAddressList.userId) {
            where.userId = reqAddressList.userId
        }
        if (reqAddressList.addressType === AddressTypeEnum.ETH) {
            result = await this.addressEthRepository.findAndCount({
                // select: ['id', 'address', 'privateKey', 'userId', 'createTime', 'status'],
                where,
                skip: reqAddressList.skip,
                take: reqAddressList.take
            })
        } else if (reqAddressList.addressType === AddressTypeEnum.BSC) {
            result = await this.addressBscRepository.findAndCount({
                // select: ['id', 'address', 'privateKey', 'userId', 'createTime', 'status'],
                where,
                skip: reqAddressList.skip,
                take: reqAddressList.take
            })
        } else if (reqAddressList.addressType === AddressTypeEnum.BTC) {
            result = await this.addressBtcRepository.findAndCount({
                // select: ['id', 'address', 'privateKey', 'userId', 'createTime', 'status'],
                where,
                skip: reqAddressList.skip,
                take: reqAddressList.take
            })
        } else if (reqAddressList.addressType === AddressTypeEnum.TRC) {
            result = await this.addressTrcRepository.findAndCount({
                // select: ['id', 'address', 'privateKey', 'userId', 'createTime', 'status'],
                where,
                skip: reqAddressList.skip,
                take: reqAddressList.take
            })
        } else {
            result = await this.addressEthRepository.findAndCount({
                // select: ['id', 'address', 'privateKey', 'userId', 'createTime', 'status'],
                where,
                skip: reqAddressList.skip,
                take: reqAddressList.take
            })
            if (result[1] === 0) {
                result = await this.addressTrcRepository.findAndCount({
                    // select: ['id', 'address', 'privateKey', 'userId', 'createTime', 'status'],
                    where,
                    skip: reqAddressList.skip,
                    take: reqAddressList.take
                })
            }
            if (result[1] === 0) {
                result = await this.addressBtcRepository.findAndCount({
                    // select: ['id', 'address', 'privateKey', 'userId', 'createTime', 'status'],
                    where,
                    skip: reqAddressList.skip,
                    take: reqAddressList.take
                })
            }

        }

        return {
            rows: result[0],
            total: result[1]
        }
    }
}
