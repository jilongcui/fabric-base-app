import { Injectable, Logger } from '@nestjs/common';
import { Between, DataSource, FindOptionsWhere, Repository, TreeRepository } from 'typeorm';
// import { User } from '@app/modules/system/user/entities/user.entity';
import { ApiException } from '@app/common/exceptions/api.exception';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { UserService } from '../user/user.service';
import { InviteUser } from './entities/invite-user.entity';
import { User } from '../user/entities/user.entity';
import { ReqInviteUserListDto, ReqUpdateInviteUserDto } from './dto/request-inviteuser.dto';
import * as moment from 'moment';
import { ApiDataResponse } from '@app/common/decorators/api-data-response.decorator';

@Injectable()
export class InviteUserService {
    logger = new Logger(InviteUserService.name)
    inviteUserTreeRepository: TreeRepository<InviteUser>
    constructor(
        @InjectRepository(InviteUser) private readonly inviteRepository: Repository<InviteUser>,
        @InjectRepository(User) private readonly userRepository: Repository<User>,
        private readonly userService: UserService,
    ) {
        this.inviteUserTreeRepository = this.inviteRepository.manager.getTreeRepository(InviteUser)
    }

    async bindInviteCode(userId: number, code: string) {
        const parent = await this.userService.findOneByInviteCode(code)
        if (!parent) {
            throw new ApiException('邀请码不存在')
        }
        this.logger.debug(userId)
        // const user = await this.userService.findById(userId)
        return await this.bindParent(userId, parent.userId)
    }

    async bindParent(userId: number, parentId: number) {
        let inviteUser = await this.inviteUserTreeRepository.findOneBy({ id: userId })
        if (inviteUser) 
            return inviteUser
        let parent = await this.inviteUserTreeRepository.findOneBy({ id: parentId })
        if (!parent) {
            parent = new InviteUser()
            parent.id = parentId
            const user = await this.userRepository.findOneBy({ userId: parentId })
            if (!user) {
                throw new ApiException('邀请用户没找到')
            }
            parent.nickName = user.nickName
            parent.avatar = user.avatar
            await this.inviteUserTreeRepository.save(parent)
        }
        if (!inviteUser) {
            inviteUser = new InviteUser()
            inviteUser.id = userId
            const user = await this.userRepository.findOneBy({ userId: userId })
            if (!user) {
                throw new ApiException('被邀请用户没找到')
            }
            inviteUser.nickName = user.nickName
            inviteUser.avatar = user.avatar
            await this.inviteUserTreeRepository.save(inviteUser)
        }
        inviteUser.parent = parent

        return await this.inviteUserTreeRepository.save(inviteUser)
    }

    async allTree() {
        let trees = await this.inviteUserTreeRepository.findTrees({ depth: 3 })

        return trees
    }

    async treeChildren(userId: number) {
        let inviteUser = await this.inviteUserTreeRepository.findOneBy({ id: userId })
        if (inviteUser) {
            this.logger.debug(inviteUser.id)
            const children = await this.inviteUserTreeRepository.findDescendantsTree(inviteUser, { depth: 3 })
            return children
        }
        return null
    }

    async flatChildren(userId: number) {
        let inviteUser = await this.inviteUserTreeRepository.findOneBy({ id: userId })
        if (inviteUser) {
            const children = await this.inviteUserTreeRepository.findDescendants(inviteUser, { depth: 3 })
            return children
        }
        return null
    }

    async parent(userId: number) {
        let inviteUser = await this.inviteUserTreeRepository.findOneBy({ id: userId })
        let parents = await this.inviteUserTreeRepository.findAncestors(inviteUser, { depth: 1 })
        if (parents) {
            return parents[0]
        }
        return null
    }

    async relation(userId: number) {
        let inviteUser = await this.inviteUserTreeRepository.findOneBy({ id: userId })
        let parents = await this.inviteUserTreeRepository.findAncestors(inviteUser)
        if (inviteUser) {
            let children = await this.inviteUserTreeRepository.findDescendantsTree(inviteUser, { depth: 3 })
            return {
                parent: parents[0],
                children: children,
            }
        }
        return null
    }

    async findRelation(reqInviteUserListDto: ReqInviteUserListDto) {
        let where: FindOptionsWhere<User> = {}
        let result: any;
        let endTime;
        let beginTime;
        if (reqInviteUserListDto.params) {
            endTime = reqInviteUserListDto.params.endTime
            beginTime = reqInviteUserListDto.params.beginTime
        }
        endTime = endTime || moment(moment.now()).toDate()
        if (beginTime)
            where =
            {
                createTime: Between(beginTime, endTime)
            }
        let user = await this.userRepository.findOneBy({ userName: reqInviteUserListDto.userName, phonenumber: reqInviteUserListDto.phoneNumber })
        if (!user)
            throw new ApiException("未发现此用户")
        let inviteUser = await this.inviteUserTreeRepository.findOneBy({ id: user.userId })
        if (inviteUser && (inviteUser.id === user.userId)) {
            const children = await this.inviteUserTreeRepository.findDescendantsTree(inviteUser, { depth: reqInviteUserListDto.level || 3 })
            return children
        }
        return null
    }

    async update(reqUpdateInviteUserDto: ReqUpdateInviteUserDto) {
        return this.inviteUserTreeRepository.update(reqUpdateInviteUserDto.id, reqUpdateInviteUserDto)
    }
}
