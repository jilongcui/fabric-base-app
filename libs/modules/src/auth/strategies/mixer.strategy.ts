import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { ReqLoginDto } from '@app/modules/login/dto/req-login.dto';
import { AuthService } from '../auth.service';

@Injectable()
export class MixerStrategy extends PassportStrategy(Strategy, 'mixer') {
  constructor(
    private readonly authService: AuthService,
  ) {
    super(
      {
        usernameField: 'username',
        passwordField: 'password',
        passReqToCallback: true,   //设置回调函数第一个参数为 request
      }
    );
  }

  async validate(request, username: string, password: string): Promise<any> {
    let user;
    const body: ReqLoginDto = request.body  // 获取请求体
    user = await this.authService.validateMixName(username, password)
    return user   //返回值会被 守卫的  handleRequest方法 捕获
  }
}
