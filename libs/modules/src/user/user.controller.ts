/*
https://docs.nestjs.com/controllers#controllers
*/

import { Body, Controller, Delete, forwardRef, Get, Inject, Param, Post, Put, Query, StreamableFile, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ApiPaginatedResponse } from '@app/common/decorators/api-paginated-response.decorator';
import { UserEnum } from '@app/common/decorators/user.decorator';
import { UserInfoPipe } from '@app/common/pipes/user-info.pipe';
import { ReqAddUserDto, ReqChangeStatusDto, ReqResetPwdDto, ReqSetSelfPwd, ReqUpdataSelfDto, ReqUpdateAuthRoleDto, ReqUpdateEmail, ReqUpdatePhone, ReqUpdateSelfPwd, ReqUpdateUserDto, ReqUserListDto } from './dto/req-user.dto';
import { ResUserDto, ResUserInfoDto } from './dto/res-user.dto';
import { User } from './entities/user.entity';
import { UserDec } from '@app/common/decorators/user.decorator';
import { UserService } from './user.service';
import { ApiException } from '@app/common/exceptions/api.exception';
import { PaginationPipe } from '@app/common/pipes/pagination.pipe';
import { ExcelService } from '@app/modules/common/excel/excel.service';
import { Keep } from '@app/common/decorators/keep.decorator';
import { FileInterceptor } from '@nestjs/platform-express';
import { BusinessTypeEnum, Log } from '@app/common/decorators/log.decorator';
import { DataScope } from '@app/common/decorators/datascope.decorator';
import { DataScopeSql } from '@app/common/decorators/data-scope-sql.decorator';
import { RequiresPermissions } from '@app/common/decorators/requires-permissions.decorator';
import { RepeatSubmit } from '@app/common/decorators/repeat-submit.decorator';
import { UploadService } from '@app/modules/common/upload/upload.service';
import { join } from 'path';
import { ThrottlerBehindProxyGuard } from '@app/common/guards/throttler-behind-proxy.guard';
import { PaginationDto } from '@app/common/dto/pagination.dto';
import { SmsCodeGuard } from '@app/common/guards/sms-code.guard';
import { EmailCodeGuard } from '@app/common/guards/email-code.guard';

@ApiTags('用户管理')
@ApiBearerAuth()
@UseGuards(ThrottlerBehindProxyGuard)
@Controller('user')
export class UserController {
    constructor(
        private readonly userService: UserService,
        private readonly excelService: ExcelService,
        private readonly uploadService: UploadService,
    ) {
    }

    /* 分页查询用户列表 */
    @Get('list')
    @DataScope({
        userAlias: 'user2'
    })
    // @RequiresPermissions('system:user:query')
    @ApiPaginatedResponse(User)
    async list(@Query() reqUserListDto: ReqUserListDto, @Query(PaginationPipe) paginationDto: PaginationDto, @DataScopeSql() sataScopeSql: string) {
        return this.userService.list(reqUserListDto, paginationDto, null, null, sataScopeSql)
    }

    /* 获取用户信息 */
    @Get('profile')
    async profile(@UserDec(UserEnum.userId) userId: number) {
        const user = await this.userService.userAllInfo(userId)
        return {
            user,
        }
    }

    /* 更改个人用户信息 */
    @RepeatSubmit()
    @Put('profile')
    @Log({
        title: '用户管理',
        businessType: BusinessTypeEnum.update
    })
    async updataProfile(@Body() reqUpdataSelfDto: ReqUpdataSelfDto, @UserDec(UserEnum.userId) userId: number) {
        await this.userService.updataProfile(reqUpdataSelfDto, userId)
    }

    /* 首次设置个人密码 */
    @RepeatSubmit()
    @Put('profile/setPwd')
    @Log({
        title: '用户管理',
        businessType: BusinessTypeEnum.update
    })
    async setSelfPwd(@Query() reqSetSelfPwd: ReqSetSelfPwd, @UserDec(UserEnum.userName, UserInfoPipe) userName: string) {
        await this.userService.setSelfPwd(reqSetSelfPwd, userName)
    }

    /* 更改个人密码 */
    @RepeatSubmit()
    @Put('profile/updatePwd')
    @Log({
        title: '用户管理',
        businessType: BusinessTypeEnum.update
    })
    async updateSelfPwd(@Query() reqUpdateSelfPwd: ReqUpdateSelfPwd, @UserDec(UserEnum.userName, UserInfoPipe) userName: string) {
        await this.userService.updateSelfPwd(reqUpdateSelfPwd, userName)
    }

    /* 更换邮箱 */
    @RepeatSubmit()
    @Put('profile/email')
    @Log({
        title: '更改邮箱',
        businessType: BusinessTypeEnum.update
    })
    @UseGuards(EmailCodeGuard)
    async updateEmail(@Body() reqUpdateEmail: ReqUpdateEmail, @UserDec(UserEnum.userId) userId: number) {
        await this.userService.updateEmail(reqUpdateEmail, userId)
    }

    /* 更改手机号 */
    @RepeatSubmit()
    @Put('profile/phone')
    @Log({
        title: '更改手机号',
        businessType: BusinessTypeEnum.update
    })
    @UseGuards(SmsCodeGuard)
    async updatePhone(@Body() reqUpdatePhone: ReqUpdatePhone, @UserDec(UserEnum.userId) userId: number) {
        await this.userService.updatePhone(reqUpdatePhone, userId)
    }

    /* 上传头像 */
    // @RepeatSubmit()
    @Post('profile/avatar')
    @UseInterceptors(FileInterceptor('avatarfile'))
    async avatar(@UploadedFile() file: Express.Multer.File, @Query('fileName') fileName, @UserDec(UserEnum.userId) userId: number) {
        const url = await this.uploadService.uploadToCos(fileName, file.path)

        const reqUpdataSelfDto = new ReqUpdataSelfDto()
        reqUpdataSelfDto.avatar = url
        await this.userService.updataProfile(reqUpdataSelfDto, userId)
        return {
            imgUrl: url,
        }
    }

    /* 通过id查询用户信息 */
    @Get(':userId')
    @RequiresPermissions('system:user:query')
    async one(@Param('userId') userId: number): Promise<ResUserInfoDto> {
        const user = await this.userService.userAllInfo(userId) as ResUserDto
        return {
            user
        }
    }

    /* 新增用户 */
    @RepeatSubmit()
    @Post()
    @RequiresPermissions('system:user:add')
    @Log({
        title: '用户管理',
        businessType: BusinessTypeEnum.insert
    })
    async add(@Body() reqAddUserDto: ReqAddUserDto, @UserDec(UserEnum.userName, UserInfoPipe) userName: string) {
        const user = await this.userService.findOneByUserNameState(reqAddUserDto.userName)
        if (user) throw new ApiException('该用户名已存在，请更换')
        reqAddUserDto.createBy = reqAddUserDto.updateBy = userName
        await this.userService.addUser(reqAddUserDto)
    }

    /* 编辑用户 */
    @RepeatSubmit()
    @Put()
    @RequiresPermissions('system:user:edit')
    @Log({
        title: '用户管理',
        businessType: BusinessTypeEnum.update
    })
    async update(@Body() reqUpdateUserDto: ReqUpdateUserDto, @UserDec(UserEnum.userName, UserInfoPipe) userName: string) {
        const user = await this.userService.findOneByUserNameState(reqUpdateUserDto.userName)
        reqUpdateUserDto.updateBy = userName
        await this.userService.updateUser(reqUpdateUserDto)
    }

    /* 删除用户 */
    @Delete(':userIds')
    @RequiresPermissions('system:user:remove')
    @Log({
        title: '用户管理',
        businessType: BusinessTypeEnum.delete
    })
    async delete(@Param('userIds') userIds: string, @UserDec(UserEnum.userName, UserInfoPipe) userName: string) {
        const userIdArr = userIds.split(',')
        await this.userService.delete(userIdArr, userName)
    }


    //重置密码
    @RepeatSubmit()
    @Put('resetPwd')
    @RequiresPermissions('system:user:resetPwd')
    async resetPwd(@Body() reqResetPwdDto: ReqResetPwdDto, @UserDec(UserEnum.userName, UserInfoPipe) userName: string) {
        await this.userService.resetPwd(reqResetPwdDto.userId, reqResetPwdDto.password, userName)
    }

    /* 改变用户状态 */
    @RepeatSubmit()
    @Put("changeStatus")
    async changeStatus(@Body() reqChangeStatusDto: ReqChangeStatusDto, @UserDec(UserEnum.userName, UserInfoPipe) userName: string) {
        await this.userService.changeStatus(reqChangeStatusDto.userId, reqChangeStatusDto.status, userName)
    }

    /* 导出用户 */
    @RepeatSubmit()
    @Post('export')
    @RequiresPermissions('system:user:export')
    @Keep()
    @Log({
        title: '用户管理',
        businessType: BusinessTypeEnum.export,
        isSaveResponseData: false
    })
    async export(@Body() reqUserListDto: ReqUserListDto, @Body(PaginationPipe) paginationDto: PaginationDto,) {
        const { rows } = await this.userService.list(reqUserListDto, paginationDto)
        const file = await this.excelService.export(User, rows)
        return new StreamableFile(file)
    }

    /* 下载模板 */
    @RepeatSubmit()
    @Post('importTemplate')
    @Keep()
    async importTemplate() {
        const file = await this.excelService.importTemplate(User)
        return new StreamableFile(file)
    }

    /* 用户导入 */
    @RepeatSubmit()
    @Post('importData')
    @RequiresPermissions('system:user:import')
    @UseInterceptors(FileInterceptor('file'))
    async importData(@UploadedFile() file: Express.Multer.File) {
        const data = await this.excelService.import(User, file)
        await this.userService.insert(data)
    }
}