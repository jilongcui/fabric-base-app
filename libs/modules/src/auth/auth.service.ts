import { InjectRedis } from '@liaoliaots/nestjs-redis';
import { Injectable, Logger } from '@nestjs/common';
import Redis from 'ioredis';
import { isEmpty } from 'lodash';
import { CAPTCHA_IMG_KEY, USER_ACCESS_TOKEN_KEY, USER_TOKEN_KEY, USER_VERSION_KEY } from '@app/common/contants/redis.contant';
import { ApiException } from '@app/common/exceptions/api.exception';
import { SharedService } from '@app/shared/shared.service';
import { UserService } from '../user/user.service';
import axios from 'axios';
import { ReqAddUserDto } from '../user/dto/req-user.dto';
import { ConfigService } from '@nestjs/config';
const strRandom = require('string-random');

@Injectable()
export class AuthService {

  logger = new Logger(AuthService.name);

  private appId: string;
  private webAppId: string;
  private secret: string;

  private grant_type = 'authorization_code'

  private appSecretMap = []

  constructor(
    @InjectRedis() private readonly redis: Redis,
    private readonly sharedService: SharedService,
    private readonly userService: UserService,
    private readonly configService: ConfigService,
  ) {
    this.appId = this.configService.get<string>('weixinLogin.appId')
    this.secret = this.configService.get<string>('weixinLogin.appSecret')

    const webAppId = this.configService.get<string>('weixinLogin.webAppId')
    const webSecret = this.configService.get<string>('weixinLogin.webAppSecret')
    this.webAppId = webAppId
    this.appSecretMap[webAppId] = webSecret

    const gzhAppId = this.configService.get<string>('weixinLogin.gzhAppId')
    const gzhSecret = this.configService.get<string>('weixinLogin.gzhAppSecret')
    this.appSecretMap[gzhAppId] = gzhSecret
  }

  /* 判断验证码是否正确 */
  async checkImgCaptcha(uuid: string, code: string) {
    const result = await this.redis.get(`${CAPTCHA_IMG_KEY}:${uuid}`);
    if (isEmpty(result) || code.toLowerCase() !== result.toLowerCase()) {
      throw new ApiException("图形验证码错误")
    }
    await this.redis.del(`${CAPTCHA_IMG_KEY}:${uuid}`)
  }

  /* 判断用户账号密码是否正确 */
  async validateUser(username: string, password: string) {
    const user = await this.userService.findOneByUsername(username);
    if (!user) throw new ApiException("用户名不存在")
    const comparePassword = this.sharedService.md5(password + user.salt)
    if (comparePassword !== user.password) throw new ApiException("用户名或密码错误")
    return user
  }

  /* 判断手机号或者邮箱是否正确 */
  async validateMixName(phoneOrEmail: string, password: string) {
    const user = await this.userService.findOneByMixName(phoneOrEmail);
    if (!user) throw new ApiException("用户不存在")
    const comparePassword = this.sharedService.md5(password + user.salt)
    if (comparePassword !== user.password) throw new ApiException("密码错误")
    return user
  }

  /* 判断手机号是否正确 */
  async validatePhone(phone: string) {
    const user = await this.userService.findOneByPhone(phone);
    if (!user) throw new ApiException("手机号不存在")
    return user
  }

  /* 判断邮箱是否正确 */
  async validateEmail(phone: string) {
    const user = await this.userService.findOneByEmail(phone);
    if (!user) throw new ApiException("邮箱不存在")
    return user
  }

  /* 判断微信登录的逻辑 */
  async validateWeixin(code: string) {
    /* Get openID and session_key from weixin service by code */
    const url = `https://api.weixin.qq.com/sns/jscode2session?grant_type=${this.grant_type}&appid=${this.appId}&secret=${this.secret}&js_code=${code}`
    // const info = await this.getInfo(url) // 获取openid和session_key
    // this.logger.debug(url)
    const info: any = await axios.get(url);
    // this.logger.debug(info.data)
    if (info.data.errcode && info.data.errcode !== 0) {
      throw new ApiException(info.data.errmsg)
    }

    let user = await this.userService.findOneByUnionId(info.data.unionid)

    if(!user) {
      // 通过openid 来查找用户是否存在
      user = await this.userService.findOneByOpenId(info.data.openid)
    }

    if (!user) {
      /* 如果用户不存在，需要创建新的用户 */

      const reqAddUserDto = new ReqAddUserDto()
      const wxName = "wx_" + strRandom(8).toLowerCase()
      // reqAddUserDto.phonenumber = phone;
      reqAddUserDto.userName = wxName;
      reqAddUserDto.nickName = wxName;
      reqAddUserDto.userType = '02'; // weixin user.
      reqAddUserDto.postIds = [];
      reqAddUserDto.roleIds = [];
      reqAddUserDto.openId = info.data.openid;
      reqAddUserDto.unionId = info.data.unionid;
      reqAddUserDto.createBy = reqAddUserDto.updateBy = 'admin'
      return await this.userService.addUser(reqAddUserDto)
    }
    if (!user.unionId) {
      user.unionId = info.data.unionid;
      await this.userService.changeUnionId(user.userId, user.unionId)
    }

    if (user.openId != info.data.openid) {
      user.openId = info.data.openid;
      await this.userService.changeOpenId(user.userId, user.openId)
    }
    return user
  }

  /* 判断微信登录的逻辑 */
  async validateWeixinWeb(appId: string, code: string) {
    /* Get openID and session_key from weixin service by code */
    if(appId === undefined)
      appId = this.webAppId
    const appSecret = this.appSecretMap[appId]
    this.logger.debug(appSecret)
    const url = `https://api.weixin.qq.com/sns/oauth2/access_token?grant_type=${this.grant_type}&appid=${appId}&secret=${appSecret}&code=${code}`
    // const info = await this.getInfo(url) // 获取openid和session_key
    this.logger.debug(url)
    const info: any = await axios.get(url);
    this.logger.debug(info.data)
    if (info.data.errcode && info.data.errcode !== 0) {
      throw new ApiException(info.data.errmsg)
    }

    // 通过unionId来查找用户是否存在
    let user = await this.userService.findOneByUnionId(info.data.unionid)

    if(!user) {
      // 通过openid 来查找用户是否存在
      user = await this.userService.findOneByOpenId(info.data.openid)
    }
    
    if (!user) {
      /* 如果用户不存在，需要创建新的用户 */
      const reqAddUserDto = new ReqAddUserDto()
      const wxName = "wx_" + strRandom(8).toLowerCase()
      // reqAddUserDto.phonenumber = phone;
      reqAddUserDto.userName = wxName;
      reqAddUserDto.nickName = wxName;
      reqAddUserDto.userType = '02'; // weixin user.
      reqAddUserDto.postIds = [];
      reqAddUserDto.roleIds = [];
      reqAddUserDto.openId = info.data.openid;
      reqAddUserDto.unionId = info.data.unionid;

      reqAddUserDto.createBy = reqAddUserDto.updateBy = 'admin'
      return await this.userService.addUser(reqAddUserDto)

    }
    if (!user.unionId) {
      user.unionId = info.data.unionid;
      await this.userService.changeUnionId(user.userId, info.data.unionid)
    }
    if (user.openId != info.data.openid) {
      user.openId = info.data.openid;
      await this.userService.changeOpenId(user.userId, user.openId)
    }
    return user
  }

  /* 判断token 是否过期 或者被重置 */
  async validateToken(userId: number, pv: number, restoken: string) {
    const token = await this.redis.get(`${USER_TOKEN_KEY}:${userId}`)
    if (restoken !== token) throw new ApiException("登录状态已过期", 401)
    const passwordVersion = parseInt(await this.redis.get(`${USER_VERSION_KEY}:${userId}`))
    if (pv !== passwordVersion) throw new ApiException("用户信息已被修改", 401)
  }

  /* 获取微信登录access token */
  async getAccessToken() {
    try {
      let accessToken = await this.redis.get(`${USER_ACCESS_TOKEN_KEY}`)
      if (!accessToken) {
        const url = `https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=${this.appId}&secret=${this.secret}`
        // const info = await this.getInfo(url) // 获取openid和session_key
        this.logger.debug(url)
        const info: any = await axios.get(url);
        this.logger.debug(info.data)
        if (info.data.errcode && info.data.errcode !== 0) {
          throw new ApiException(info.data.errmsg)
        }
        await this.redis.set(`${USER_ACCESS_TOKEN_KEY}`, info.data.access_token, 'EX', 60 * 60 * 2)
        accessToken = info.data.access_token
      }
      return accessToken
    } catch(error) {
      
    }
  }

  /* 判断微信登录的逻辑 */
  async securityCheck(openId: string, text: string) {
    const accessToken = await this.getAccessToken()
    /* Get openID and session_key from weixin service by code */
    const url = `https://api.weixin.qq.com/wxa/msg_sec_check?access_token=${accessToken}`
    // const info = await this.getInfo(url) // 获取openid和session_key
    // this.logger.debug(url)

    return true
    const data = {
      "openid": openId,
      "scene": 3,
      "version": 2,
      "content": text
    }
    // this.logger.debug(JSON.stringify(data))
    const info: any = await axios.post(url, data);
    // this.logger.debug(info.data)
    // result.result.errcode === 0 && result.result.suggest === 'risky'
    // this.logger.debug(info.data)
    if (info.data.errcode !== 0 ) {
      throw Error("执行安全检测出错")
    }

    const suggest = info.data.result.suggest

    if( suggest === 'pass') {
      return true
    } else if(suggest === 'review') {
      // Check detail
      for(const detail of info.data.detail) {
        if(detail.strategy === 'keyword') {
          if (detail.suggest === 'risky') {
            this.logger.debug("Risky Keyword at " + openId +":"+ detail.keyword)
            return false
          }
        }
      }
    } else if (suggest === 'risky') {
      this.logger.debug("Risky Content at " + openId)
      this.logger.debug(info.data)
      return false
    }

    return true
  }
}
