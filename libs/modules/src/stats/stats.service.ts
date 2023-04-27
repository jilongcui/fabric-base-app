import { ParamsDto } from '@app/common/dto/params.dto';
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import moment from 'moment';
import { FindOptionsWhere, Between, In, Like, Repository, IsNull, Not } from 'typeorm';
import { Asset } from '../collection/entities/asset.entity';
import { InviteUser } from '../inviteuser/entities/invite-user.entity';
import { User } from '../user/entities/user.entity';
import { UserInviteStatsDto } from './dto/request-stats.dto';

@Injectable()
export class StatsService {
    logger = new Logger(StatsService.name)

    constructor(
        @InjectRepository(User) private readonly userRepository: Repository<User>,
        @InjectRepository(Asset) private readonly assetRepository: Repository<Asset>,
        @InjectRepository(InviteUser) private readonly inviteUserRepository: Repository<InviteUser>,
    ) { }

    getInfo() {

    }

    async getUserInviteInfo(params: UserInviteStatsDto) {
        let where: FindOptionsWhere<InviteUser> = {}
        where.createTime = Between(params.beginTime, params.endTime)
        where.parent = Not(IsNull())
        const myQueryBuilder = this.inviteUserRepository.createQueryBuilder('inviteUser')
            .select('count(*)', 'inviteCount')
            .addSelect('parent.id', 'userId')
            .addSelect('parent.user_name', 'userName')
            .leftJoin('inviteUser.parent', 'parent')
            .where(where)
            .orderBy('inviteCount', 'DESC')
            .groupBy('inviteUser.parentId')
            .limit(params.count)
        this.logger.debug(myQueryBuilder.getQuery())
        // this.logger.debug(myQueryBuilder.getSql())

        const resultArr = await myQueryBuilder.getRawMany()
        return resultArr.map((item, index) => { item.rank = index + 1; if (item.inviteCount >= 1) return item }).filter(l => l != undefined)
    }

    async listOfInviteUser(params: UserInviteStatsDto) {
        let where: FindOptionsWhere<InviteUser> = {}
        where.createTime = Between(params.beginTime, params.endTime)
        where.parent = Not(IsNull())
        const myQueryBuilder = this.inviteUserRepository.createQueryBuilder('inviteUser')
            .select('id', 'userId')
            .addSelect('user_name', 'userName')
            .addSelect('create_time', 'createTime')
            // .leftJoin('inviteUser.parent', 'parent')
            .where(where)
            .orderBy('create_time', 'ASC')
        // .limit(params.count)
        this.logger.debug(myQueryBuilder.getQuery())
        // this.logger.debug(myQueryBuilder.getSql())

        const resultArr = await myQueryBuilder.getRawMany()
        return resultArr.filter(l => l != undefined)
    }

    /* 导出拥有多个藏品的用户id */
    async listUserByCollections(collections: string) {
        const queryString = `select * from (select user_id userId,GROUP_CONCAT(DISTINCT collection_id ORDER BY collection_id ASC SEPARATOR ',') collections from asset group by user_id) as sb where sb.collections like '%${collections}%'`;
        // this.logger.debug(queryString)
        const rows = await this.assetRepository.query(queryString)
        return {
            rows: rows,
            total: rows.length
        }
    }
}
