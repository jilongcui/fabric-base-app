import { USER_EMAILCODE_KEY } from '@app/common/contants/redis.contant';
import { ApiException } from '@app/common/exceptions/api.exception';
import { InjectRedis } from '@liaoliaots/nestjs-redis';
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import Redis from 'ioredis';
import { Strategy } from 'passport-local';
import { AuthService } from '../auth.service';

@Injectable()
export class EmailStrategy extends PassportStrategy(Strategy, 'email') {
  constructor(
    private readonly authService: AuthService,
    @InjectRedis() private readonly redis: Redis) {
    super(
      {
        usernameField: 'email',
        passwordField: 'code',
        passReqToCallback: true,   //设置回调函数第一个参数为 request
      }
    );
  }

  async validate(request, email: string, code: string): Promise<any> {
    let user;
    if (email && code) {
      const localCode = await this.redis.get(`${USER_EMAILCODE_KEY}:${email}`)
      if (!localCode || localCode != code) throw new ApiException("邮箱验证码错误");
      await this.redis.del(`${USER_EMAILCODE_KEY}:${code}`)
      user = await this.authService.validateEmail(email)
    }
    return user   //返回值会被 守卫的  handleRequest方法 捕获
  }
}
