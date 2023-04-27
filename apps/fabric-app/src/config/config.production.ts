/*
 * @Author: Sheng.Jiang
 * @Date: 2021-09-03 11:32:52
 * @LastEditTime: 2022-05-23 09:20:26
 * @LastEditors: Please set LastEditors
 * @Description: 正式环境配置文件
 * @FilePath: \meimei-admin\src\config\config.production.ts
 * You can you up，no can no bb！！
 */
import { defineConfig } from './defineConfig';

export default defineConfig({
  jwt: {
    secret: process.env.JWT_SECRET || '123456',
  },
  // typeorm 配置
  database: {
    type: 'mysql',
    host: process.env.MYSQL_HOST || 'localhost',
    port: process.env.MYSQL_PORT || 3306,
    username: process.env.MYSQL_USERNAME || 'root',
    password: process.env.MYSQL_PASSWORD || 'admin',
    database: process.env.MYSQL_DATABASE || 'mei-mei',
    autoLoadModels: true,
    synchronize: true,
    logging: false,
  },
  // redis 配置
  redis: {
    config: {
      url: `redis://:123456@${process.env.REDIS_HOST}:${process.env.REDIS_PORT}/${process.env.REDIS_DB}`
    }
  },

  // 队列reids 配置
  bullRedis: {
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT,
    db: process.env.REDIS_DB,
    password: '123456'
  },

  weixinLogin: {
    appId: process.env.WEIXIN_APPID,
    appSecret: process.env.WEIXIN_APPSECRET,
    webAppId: process.env.WEIXIN_WEBAPPID,
    webAppSecret: process.env.WEIXIN_WEBAPPSECRET,
    gzhAppId: process.env.WEIXIN_GZHAPPID,
    gzhAppSecret: process.env.WEIXIN_GZHAPPSECRET,
  },

  weixinPayment: {
    appId: process.env.WEIXIN_APPID,
    merchId: process.env.WEIXIN_MCHID,
    api3Key: process.env.WEIXIN_API3KEY,
    notifyHost: process.env.WEIXIN_NOTIFY_HOST,
  },

  tencentSMS: {
    SecretId: process.env.SecretId,
    SecretKey: process.env.SecretKey,
    SmsSdkAppId: process.env.SmsSdkAppId || '1400706961',
    TemplateLoginId: process.env.TemplateLoginId || '1473029',
    TemplateRegId: process.env.TemplateRegId || '1473032',
    SignName: process.env.SignName || 'Startland'
  },

  tencentCOS: {
    SecretId: process.env.CosSecretId,
    SecretKey: process.env.CosSecretKey,
    CosDomain: process.env.CosDomain || 'https://img.xiaohe.biz',
    CosGlobalDomain: process.env.CosGlobalDomain || 'https://image.xiaohe.biz',
    CosBucket: process.env.CosBucket || 'startland-1312838165',
    CosRegion: process.env.CosRegion || 'ap-shanghai',
  },

  crichain: {
    apiUrl: 'https://openapi.crichain.cn/',
    tokenUrl: 'https://api.startland.top/api/token/',
    contractAddr: '0x6073ec873f48099ab2818b3c3089e7f339c4787f',
    platformAddress: '0x95aba0fdff121a98dd8007c96d3324f64b8db467',
    platformPrivateKey: process.env.PlatformPrivateKey,
  },

  payment: {
    baseUrl: 'https://Pay.Heepay.com/',
    notifyHost: process.env.PLATFORM_NOTIFY_HOST || 'https://www.startland.top',
    platformPublicKey: process.env.PLATFORM_PUBLICKEY || 'MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA3jSzrlNHBuZEME7Mbg0RFcgNvq6VCcx3UEmjLkWO4PdCHLTNP27a4+fjtbyndIPLYDe52SbiIq6SY0LUG0xLR0o1aXESVxpp/04CXuURhlsngmkzFqetkey60QhXKWWf+bC8EnLbcew9Z49yAgwPjsiAOikMZ8Yq8WBH+6iza8EnVGXGrH6Et0Qv5CheTUZY1/sgMg+2niCpJQxDTviQGmmhIJZM8an3/nq0insbqARmiIseLlqFloiuhP54o8tP3z2ddCloWWzd+ZtuWG9AOd+vkZNkiDM4oex934oR/G7qbNBa5i6hIKZ3JJBVkGnuVA7tftVCRCsqCvgwpL6R/QIDAQAB',
    merchSecretKey: process.env.MERCH_SECRETKEY || 'MIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC5XkR5gTRgWLAUeyCvnQZA4pdZ6ayV8R+//KzQjDW18SEaFb/g+9b4jX6tyWniEXWYhXrHXyTbI6ZvykRpD2HfMo1Bvb1OKIVZYKG9chJmcekGKufbmQ4Pxuoy72I8Qhi8zmO29pROE7nM7EHgh1aYtcpJIBmq9Zuc8BddIk6t4Cxo6NMtHSbgzXCcqw67zCRDyf8mLZIc+o5ObzNZqbqAwD7bRUctCbYlUumXNJYBzbQ3aNQxZow1GDw23zbqqPgRVI3iXyNX5FWipTMUgGDpo6wDF3hOT1Z0xRdtBfEkdT6UyruRKGbbWiDd9roa75W4mlmvM0y7g7ZhuVkoaJn7AgMBAAECggEAFGeKBg3w5AIfL8H18R7Jx26p1l3gf4jRQ+Leav5kEyj9yc9HFc7i9O0uWpbnLtlZJnba8wNIHU8pTPjo2t+0mEsKPYhTRD01oIcAhsf9uoUjb2hdqVCJubbdpMmw+I0WCAJ3+3XdEVMeiq4e+kYrhBfOson0CVuLy5SqHbhfDMiF6SzRiTFMAELos7SwfjXZ0VAclGP7do/XWyUp2b2l9Z0nnaeKU2ecNBZlDXKcpsZ2Omz8HIXyJpeKooN63DSkjobPm6+/saNAL5118ZC8SxnvbZ61gsEk8/feHoYr58g6zgllLEb5uR7DJjmxrCF/bMqGv2OQ35s0cnPwUds/cQKBgQD7JACTjg2D/mvBSeZxsmOiLqJIoxeUOlH7OliPe6uF9XAJat2LJCpN5UPbUqgBC280SvzhJG103WeZIBNYiRqxC0qQUw1qUkpavJ1TkYw7lO5m/9b5TebQ05qTiBWd1DmJYbXfPQRjwjAG2/MkGIvdnZ43NhqnQeNXUHtr7T1RrQKBgQC89HgDymVmgHo1Ffc1z1cMOdnJzIXr6O3Gtj5Zhra+98qqKT/HAIAIhKsn9zNLUGT+XbkB1J5K68A1JlXc1LEZIiq0TEXAEerTH3XlplhdZ8qvRnVm48hqwyIQ+ZTllzOYloH5cHQkBsPkCIN7rz0N+P2SC7cw5Uo1Rr3vS+8fRwKBgC8lSBJrNXBU/8eOZvtrILceiAqYy2FhPWirQFrXPZDtTXYHIMXxKRvscTuoHa/shJjNhwGBBCdPNRaS5e7V9jPMSdgkLz2JaznzdJlulmPNBqBBYQr2K+GCB9+wSVaSs6ZtuGXLH5rWpotzGQbqsL8OytfUiVZi0RngGvtc0wkVAoGADb5+iFANhiIsQXZCkBBv1XzTwaD10M4VlZGmAV8SJdviSvRLJk98AKKdzH9npL/JSNNKZL6xcOOrDHKoZjK2WwyoLIsru6fR+99a9QRfgxPMo2ktmvlQl6tv6+orkXOpFh1EgP9UA1bWotyXq8R4XW7SCvB9N7pF5pApuqE8WHsCgYEAvKir/VM1K9Qhk78EshIXygL9F8LQxhpRkquZ3w/81fchn+/xLJv6HHpGLaGywAPM/kONcDkvJFLmHJDQ2cwLgrX2x0bUFRxNjQ0RLT7zjIuJq/WxECLVh6xDI8yGqT6OU0wfMEzinzm5eLaIwqRQLZoI0Qxvvn0nBjSh6/+iJD0=',
    merchPublicKey: process.env.MERCH_PUBLICKEY || 'MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAuV5EeYE0YFiwFHsgr50GQOKXWemslfEfv/ys0Iw1tfEhGhW/4PvW+I1+rclp4hF1mIV6x18k2yOmb8pEaQ9h3zKNQb29TiiFWWChvXISZnHpBirn25kOD8bqMu9iPEIYvM5jtvaUThO5zOxB4IdWmLXKSSAZqvWbnPAXXSJOreAsaOjTLR0m4M1wnKsOu8wkQ8n/Ji2SHPqOTm8zWam6gMA+20VHLQm2JVLplzSWAc20N2jUMWaMNRg8Nt826qj4EVSN4l8jV+RVoqUzFIBg6aOsAxd4Tk9WdMUXbQXxJHU+lMq7kShm21og3fa6Gu+VuJpZrzNMu4O2YblZKGiZ+wIDAQAB',
    merchId: process.env.MERCH_ID || '1664502',
    orderSN: process.env.ORDER_SN || 'SN'
  },

  wallet: {
    baseUrl: process.env.WALLET_BASEURL || 'https://wallet.base.com/',
    withdrawUrl: process.env.WALLET_WITHDRAW_URL
  },

  aws: {
    platformEmail: process.env.PLATFORM_EMAIl || 'jilongcui@gmail.com',
    emailRegion: process.env.EMAIL_REGION || 'ap-southeast-1',
    emailVersion: process.env.EMAIL_VERSION || '2010-12-01',
  },

  email: {
    regCodeTemplate: {
      subject: {
        'CN': '注册验证码 {code}',
        'EN': 'Register Code {code}',
        'HK': '注册验证码 {code}',
      },
      content: {
        'CN': '注册验证码 {code}',
        'EN': 'Register Code {code}',
        'HK': '注册验证码 {code}',
      }
    },

    loginCodeTemplate: {
      subject: {
        'CN': '登录验证码 {code}',
        'EN': 'Login Code {code}',
        'HK': '登录验证码 {code}',
      },
      content: {
        'CN': '登录验证码 {code}',
        'EN': 'Login Code {code}',
        'HK': '登录验证码 {code}',
      }
    },
  },

  fund: {
    baseCertUrl: 'https://www.heepay.com/',
    basePayUrl: 'https://Pay.heepay.com/',
    platformCert3DESKey: process.env.PLATFORM_CERT_3DESKEY,
    platformCertMD5Key: process.env.PLATFORM_CERT_MD5KEY,
    platformPay3DESKey: process.env.PLATFORM_PAY_3DESKEY,
    platformPayMD5Key: process.env.PLATFORM_PAY_MD5KEY,
    merchId: process.env.MERCH_ID || '1664502',
  },

  fund33: {
    baseUrl: process.env.FUND33_BASEURL,
    appId: process.env.FUND33_APPID,
    appKey: process.env.FUND33_APPKEY,
    appSecret: process.env.FUND33_APPSECRET,
  },

  kyc: {
    notifyUrl: process.env.FUND33_NOTIFY_URL
  },

  platform: {
    secret: process.env.PlatformSecret || '156duv'
  },

  screenshot: {
    execPath: process.env.SCREENSHOT_EXECPATH || '/Applications/Chromium.app/Contents/MacOS/Chromium'
  },

  isDemoEnvironment: false,
  isBlockchainAddress: false,
});
