import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from "passport-jwt";
import { AuthService } from '../auth.service';
import { jwtConstants } from '../auth.constants';
import { Payload } from '@app/modules/login/login.interface';

@Injectable()
export class JwtWsStrategy extends PassportStrategy(Strategy, 'jwt-ws') {
  constructor(
    private readonly authService: AuthService
  ) {
    super({
      jwtFromRequest: JwtWsStrategy.fromAuth('token'),
      ignoreExpiration: false,
      secretOrKey: jwtConstants.secret,
      passReqToCallback: true,   //设置回调的第一个参数是  request
    });
  }

  async validate(request: Request, payload: Payload) {
    let { userId, pv } = payload
    let token = (request.headers as any).authorization.slice(7)
    await this.authService.validateToken(userId, pv, token)
    return { userId };  //返回值会被 守卫的  handleRequest方法 捕获
  }

  static fromAuth = function (header_name) {
    return function (request) {
        var token = null;
        if (request.auth[header_name]) {
            token = request.auth[header_name];
        }
        return token;
    };
};
}
