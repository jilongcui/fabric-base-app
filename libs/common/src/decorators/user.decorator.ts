/*
https://docs.nestjs.com/openapi/decorators#decorators
*/

import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export enum UserEnum {
  'userId' = "userId",
  'userName' = "userName",
  "nickName" = "nickName",
  "deptId" = "deptId",
  "deptName" = "deptName",
  "avatar" = "avatar",
  'openId' = 'openId',
}

export const UserDec = createParamDecorator(
  (data: UserEnum, ctx: ExecutionContext) => {
    if (ctx.getType() === 'http') {
      const request = ctx.switchToHttp().getRequest();
      const user = request.user;
      return data ? user && user.userId : user
    } else if (ctx.getType() === 'ws') {
      const request = ctx.switchToWs().getClient()
      const user = request.user;
      return data ? user && user.userId : user
    } else {

    }
    
  },
);