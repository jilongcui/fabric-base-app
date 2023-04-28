import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import {
    Contract,
    DefaultEventHandlerStrategies,
    DefaultQueryHandlerStrategies,
    Gateway,
    GatewayOptions,
    Wallets,
    Network,
    Transaction,
    Wallet,
  } from 'fabric-network';

import * as protos from 'fabric-protos';

import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class FabricNetworkService implements OnModuleInit {

    logger = new Logger(FabricNetworkService.name)
    connectionProfile: Record<string, unknown>
    wallet: Wallet
    asLocalhost: boolean
    gateway: Gateway
    network: Network
    walletPath: string
    userName: string

    constructor() {
        // load the network configuration
        const ccpPath = process.env.CONNECTION_PROFILE_PATH
        this.userName = process.env.APP_USERNAME
        const connectionProfilePath = path.resolve(ccpPath);
        this.connectionProfile = JSON.parse(fs.readFileSync(connectionProfilePath, 'utf8'));
        this.asLocalhost = true
        // const walletPath = path.join(process.cwd(), 'wallet');
        this.walletPath = process.env.APP_WALLET_PATH
    }
    
    async onModuleInit() {

        this.wallet = await Wallets.newFileSystemWallet(this.walletPath)
        this.gateway = new Gateway();
    
        // Check to see if we've already enrolled the user.
        const identity = await this.wallet.get(this.userName);
        if (!identity) {
            console.log('An identity for the user "appUser" does not exist in the wallet');
            console.log('Run the registerUser.ts application before retrying');
            return;
        }

        const options: GatewayOptions = {
            wallet: this.wallet,
            identity,
            discovery: { enabled: true, asLocalhost: this.asLocalhost },
            // eventHandlerOptions: {
            //     commitTimeout: config.commitTimeout,
            //     endorseTimeout: config.endorseTimeout,
            //     strategy: DefaultEventHandlerStrategies.PREFER_MSPID_SCOPE_ANYFORTX,
            // },
            // queryHandlerOptions: {
            //     timeout: config.queryTimeout,
            //     strategy: DefaultQueryHandlerStrategies.PREFER_MSPID_SCOPE_ROUND_ROBIN,
            // },
        };
    
        await this.gateway.connect(this.connectionProfile, options);
        
    }

    /**
     * Creates an in memory wallet to hold credentials for an Org1 and Org2 user
     *
     * In this sample there is a single user for each MSP ID to demonstrate how
     * a client app might submit transactions for different users
     *
     * Alternatively a REST server could use its own identity for all transactions,
     * or it could use credentials supplied in the REST requests
     */
    // async createWallet (): Promise<Wallet> {
    //     const wallet = await Wallets.newInMemoryWallet();
    
    //     const org1Identity = {
    //         credentials: {
    //             certificate: config.certificateOrg1,
    //             privateKey: config.privateKeyOrg1,
    //         },
    //         mspId: config.mspIdOrg1,
    //         type: 'X.509',
    //     };
    
    //     await wallet.put(config.mspIdOrg1, org1Identity);
    
    //     const org2Identity = {
    //         credentials: {
    //             certificate: config.certificateOrg2,
    //             privateKey: config.privateKeyOrg2,
    //         },
    //         mspId: config.mspIdOrg2,
    //         type: 'X.509',
    //     };
    
    //     await wallet.put(config.mspIdOrg2, org2Identity);
    
    //     return wallet;
    // };
    
    /**
     * Create a Gateway connection
     *
     * Gateway instances can and should be reused rather than connecting to submit every transaction
     */
    // async createGateway (
    //     connectionProfile: Record<string, unknown>,
    //     identity: string,
    //     wallet: Wallet
    // ): Promise<Gateway> {
    //     this.logger.debug({ connectionProfile, identity }, 'Configuring gateway');
    
        // const gateway = new Gateway();
    
        // const options: GatewayOptions = {
        //     wallet,
        //     identity,
        //     // discovery: { enabled: true, asLocalhost: config.asLocalhost },
        //     // eventHandlerOptions: {
        //     //     commitTimeout: config.commitTimeout,
        //     //     endorseTimeout: config.endorseTimeout,
        //     //     strategy: DefaultEventHandlerStrategies.PREFER_MSPID_SCOPE_ANYFORTX,
        //     // },
        //     // queryHandlerOptions: {
        //     //     timeout: config.queryTimeout,
        //     //     strategy: DefaultQueryHandlerStrategies.PREFER_MSPID_SCOPE_ROUND_ROBIN,
        //     // },
        // };
    
        // await gateway.connect(connectionProfile, options);
    
        // return gateway;
    // };
    
    /**
     * Get the network which the asset transfer sample chaincode is running on
     *
     * In addion to getting the contract, the network will also be used to
     * start a block event listener
     */
    async getNetwork (channelName: string): Promise<Network> {
        const network = await this.gateway.getNetwork(channelName);
        return network;
    };
    
    /**
     * Get the asset transfer sample contract and the qscc system contract
     *
     * The system contract is used for the liveness REST endpoint
     */
    async getContract (
        network: Network, chaincodeName: string
    ): Promise<Contract> {
        const assetContract = network.getContract(chaincodeName);
        return assetContract;
    };

    /*
     * Get QSCC Contract
     */
    async getSysContract (
        network: Network
    ): Promise<Contract> {
        const qsccContract = network.getContract('qscc');
        return qsccContract;
    };


    /**
     * Evaluate a transaction and handle any errors
     */
    async evatuateTransaction (
        contract: Contract,
        transactionName: string,
        ...transactionArgs: string[]
    ): Promise<Buffer> {
        const transaction = contract.createTransaction(transactionName);
        const transactionId = transaction.getTransactionId();
        this.logger.debug({ transaction }, 'Evaluating transaction');
    
        try {
            const payload = await transaction.evaluate(...transactionArgs);
            this.logger.debug(
                { transactionId: transactionId, payload: payload.toString() },
                'Evaluate transaction response received'
            );
            return payload;
        } catch (err) {
            throw Error(transactionId + ': ' + err)
            // throw handleError(transactionId, err);
        }
    };
    
    /**
     * Submit a transaction and handle any errors
     */
    async submitTransaction (
        transaction: Transaction,
        ...transactionArgs: string[]
    ): Promise<Buffer> {
        this.logger.debug({ transaction }, 'Submitting transaction');
        const txnId = transaction.getTransactionId();
    
        try {
            const payload = await transaction.submit(...transactionArgs);
            this.logger.debug(
                { transactionId: txnId, payload: payload.toString() },
                'Submit transaction response received'
            );
            return payload;
        } catch (err) {
            throw Error(txnId + ': ' + err)
            // throw handleError(txnId, err);
        }
    };
    
    /**
     * Get the validation code of the specified transaction
     */
    async getTransactionValidationCode (
        qsccContract: Contract,
        transactionId: string,
        channelName: string
    ): Promise<string> {
        const data = await this.evatuateTransaction(
            qsccContract,
            'GetTransactionByID',
            channelName,
            transactionId
        );
    
        const processedTransaction = protos.protos.ProcessedTransaction.decode(data);
        const validationCode =
        protos.protos.TxValidationCode[processedTransaction.validationCode];
    
        this.logger.debug({ transactionId }, 'Validation code: %s', validationCode);
        return validationCode;
    };
    
    /**
     * Get the current block height
     *
     * This example of using a system contract is used for the liveness REST
     * endpoint
     */
    async getBlockHeight (
        qscc: Contract, channelName: string
    ): Promise<number | Long.Long> {
        const data = await qscc.evaluateTransaction(
            'GetChainInfo',
            channelName
        );
        const info = protos.common.BlockchainInfo.decode(data);
        const blockHeight = info.height;
    
        this.logger.debug('Current block height: %d', blockHeight);
        return blockHeight;
    };
}
