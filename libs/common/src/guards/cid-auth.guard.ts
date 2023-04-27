import { InjectRedis } from "@liaoliaots/nestjs-redis";
import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import Redis from "ioredis";
import { USER_CID_KEY } from "../contants/redis.contant";

@Injectable()
export class CIdAuthGuard implements CanActivate {

    constructor(@InjectRedis() private readonly redis: Redis) {

    }
    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest()
        const userId = request.user?.userId
        const cIdString = await this.redis.get(`${USER_CID_KEY}:${userId}`)
        if (cIdString)
            return true;
        return false;
    }

}