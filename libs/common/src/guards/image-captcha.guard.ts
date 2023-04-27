import { InjectRedis } from "@liaoliaots/nestjs-redis";
import Redis from "ioredis";
import { CanActivate, ExecutionContext, Injectable, Logger } from "@nestjs/common";
import { isEmpty } from "lodash";
import { CAPTCHA_IMG_KEY } from "../contants/redis.contant";
import { ApiException } from "../exceptions/api.exception";

@Injectable()
export class ImageCaptchaGuard implements CanActivate {
    logger: Logger;
    constructor(@InjectRedis() private readonly redis: Redis) {
        this.logger = new Logger(ImageCaptchaGuard.name)
    }
    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest()
        const uuid = request.body?.uuid
        const cacheCode = request.body?.code
        if (!uuid)
            throw new ApiException('图形验证码错误');
        const code = await this.redis.get(`${CAPTCHA_IMG_KEY}:${uuid}`)
        if (isEmpty(code) || code.toLowerCase() !== cacheCode.toLowerCase())
            throw new ApiException('图形验证码错误');
        await this.redis.del(`${CAPTCHA_IMG_KEY}:${uuid}`)
        return true;
    }

}