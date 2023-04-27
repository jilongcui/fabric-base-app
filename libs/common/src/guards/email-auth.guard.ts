/*
 * @Author: Sheng.Jiang
 * @Date: 2021-12-09 14:30:28
 * @LastEditTime: 2021-12-24 13:16:49
 * @LastEditors: Sheng.Jiang
 * @Description: 登录守卫 ，可进行登录日志记录
 * @FilePath: \meimei\src\common\guards\local-auth.guard.ts
 * You can you up，no can no bb！！
 */
import { ExecutionContext, Injectable, Logger } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Observable } from 'rxjs';
import { ApiException } from '../exceptions/api.exception';
import { LogService } from '@app/modules/monitor/log/log.service';

@Injectable()
export class EmailAuthGuard extends AuthGuard('email') {
    logger: Logger
    constructor(
        private readonly logService: LogService
    ) {
        super()
        this.logger = new Logger(EmailAuthGuard.name)
    }
    context: ExecutionContext
    canActivate(
        context: ExecutionContext,
    ): boolean | Promise<boolean> | Observable<boolean> {
        this.context = context
        return super.canActivate(context)
    }

    /* 主动处理错误,进行日志记录 */
    handleRequest(err, user, info) {
        if (err || !user) {
            const request = this.context.switchToHttp().getRequest()
            request.user = user
            this.logService.addLogininfor(request, err.response)
            throw err || new ApiException(err);
        }
        return user
    }
}
