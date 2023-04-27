import { InjectRedis } from "@liaoliaots/nestjs-redis";
import Redis from 'ioredis';
import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { USER_SMSCODE_KEY } from "../contants/redis.contant";

@Injectable()
export class SmsCodeGuard implements CanActivate {

    constructor(@InjectRedis() private readonly redis: Redis) {

    }
    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest()
        const phone = request.body?.phone
        const cacheCode = request.body?.code
        if (!phone || !cacheCode) return false;
        const code = await this.redis.get(`${USER_SMSCODE_KEY}:${phone}`)
        if (!code || code !== cacheCode) return false;
        await this.redis.del(`${USER_SMSCODE_KEY}:${phone}`)
        return true;
    }

}