/*
 * @Author: Sheng.Jiang
 * @Date: 2021-10-18 13:21:16
 * @LastEditTime: 2022-05-23 09:06:27
 * @LastEditors: Please set LastEditors
 * @Description: 
 * @FilePath: \meimei-admin\src\config\configuration.ts
 * You can you up，no can no bb！！
 */

import { Logger } from "@nestjs/common";

// 判断系统是否是开发环境
export function isDev(): boolean {
    return process.env.NODE_ENV === 'development';
}

// 根据环境变量判断使用配置
export default () => {
    let envConfig: IConfig = {};
    try {
        envConfig = require(`./config.${process.env.NODE_ENV}`).default;

    } catch (e) {
        const logger = new Logger('ConfigModule');
        logger.error(e);
    }

    // 返回环境配置
    return envConfig
};


// 配置文件接口
export interface IConfig {
    /**
     * 后台管理jwt token密钥
     */
    jwt?: {
        secret: string;
    };

    /**
     * 数据库配置
     */
    database?: {
        type?: string;
        host?: string;
        port?: number | string;
        username?: string;
        password?: string;
        database?: string;
        autoLoadModels: boolean; // 如果为true，模型将自动载入（默认:false)
        synchronize?: boolean;  //如果为true，自动载入的模型将同步
        logging?: any;
    };

    /**
     * redis 配置
     */
    redis?: {
        config: {
            url: string;
        }
    }

    /* 队列配置 */

    bullRedis?: {
        host: string,
        port: string,
        db: string,
        password: string,
    }

    /* 配置微信登录 */
    weixinLogin?: {
        appId: string,
        appSecret: string,
        webAppId: string,
        webAppSecret: string,
        gzhAppId: string,
        gzhAppSecret: string,
    },

    weixinPayment?: {
        appId: string,
        merchId: string,
        api3Key: string,
        notifyHost: string,
    }

    /* 配置SMS短信 */
    tencentSMS?: {
        SecretId: string,
        SecretKey: string,
        SmsSdkAppId: string,
        TemplateLoginId: string,
        TemplateRegId: string,
        SignName: string,
    }

    tencentCOS?: {
        SecretId: string,
        SecretKey: string,
        CosDomain: string,
        CosGlobalDomain: string,
        CosRegion: string,
        CosBucket: string,
    }

    crichain?: {
        apiUrl: string,
        tokenUrl: string,
        contractAddr: string,
        platformAddress: string,
        platformPrivateKey: string,
    }

    payment?: {
        baseUrl: string,
        notifyHost: string,
        platformPublicKey: string,
        merchSecretKey: string,
        merchPublicKey: string,
        merchId: string,
        orderSN: string,
    }

    wallet?: {
        baseUrl: string
        withdrawUrl: string
    }

    aws?: {
        platformEmail: string,
        emailRegion: string,
        emailVersion: string,
    }

    email?: {
        regCodeTemplate: {
            subject: {
                'CN': string,
                'EN': string,
                'HK': string,
            }

            content: {
                'CN': string,
                'EN': string,
                'HK': string,
            }
        },

        loginCodeTemplate: {
            subject: {
                'CN': string,
                'EN': string,
                'HK': string,
            }

            content: {
                'CN': string,
                'EN': string,
                'HK': string,
            }
        }
    }

    fund?: {
        baseCertUrl: string,
        basePayUrl: string,
        platformCert3DESKey: string,
        platformCertMD5Key: string,
        platformPay3DESKey: string,
        platformPayMD5Key: string,
        merchId: string,
    }

    fund33?: {
        baseUrl: string,
        appId: string,
        appKey: string,
        appSecret: string,
    }

    kyc?: {
        notifyUrl: string
    }

    platform?: {
        secret: string
    }

    screenshot?: {
        execPath: string
    }

    /* 是否演示环境 */
    isDemoEnvironment?: Boolean;
    /* 是否生成区块链地址 */
    isBlockchainAddress?: Boolean;
}