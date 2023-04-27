import { InjectRedis } from "@liaoliaots/nestjs-redis";
import Redis from 'ioredis';
import { CanActivate, ExecutionContext, Injectable, Logger } from "@nestjs/common";
import { USER_EMAILCODE_KEY } from "../contants/redis.contant";

@Injectable()
export class EmailCodeGuard implements CanActivate {
    logger = new Logger(EmailCodeGuard.name)
    constructor(@InjectRedis() private readonly redis: Redis) {

    }
    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest()
        const email = request.body?.email
        const cacheCode = request.body?.code
        this.logger.debug(`${email} : case code ${cacheCode}`)
        if (!email || !cacheCode) return false;
        const code = await this.redis.get(`${USER_EMAILCODE_KEY}:${email}`)
        this.logger.debug(`${code} : cache code ${cacheCode}`)
        if (!code || code != cacheCode) return false;
        await this.redis.del(`${USER_EMAILCODE_KEY}:${email}`)
        return true;
    }

}