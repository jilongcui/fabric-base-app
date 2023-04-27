import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { EmailService } from './email.service';
import { CreateEmailDto, ListEmailDto, ReqEmailCodeCheckDto, ReqEmailCodeSendDto, SendEmailDto } from './dto/create-email.dto';
import { UpdateEmailDto } from './dto/update-email.dto';
import { PaginationDto } from '@app/common/dto/pagination.dto';
import { PaginationPipe } from '@app/common/pipes/pagination.pipe';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { UserDec, UserEnum } from '@app/common/decorators/user.decorator';
import { RequiresRoles } from '@app/common/decorators/requires-roles.decorator';
import { Public } from '@app/common/decorators/public.decorator';
import { ApiException } from '@app/common/exceptions/api.exception';
import { SharedService } from '@app/shared';

@Controller('email')
@ApiTags('邮箱')
@ApiBearerAuth()
export class EmailController {
  constructor(
    private readonly emailService: EmailService,
    private readonly sharedService: SharedService
  ) {}

  @Post()
  create(@Body() createEmailDto: CreateEmailDto, @UserDec(UserEnum.userId) userId: number,) {
    return this.emailService.create(createEmailDto, userId);
  }

  @Get('list')
  @RequiresRoles(['admin', 'system'])
  list(@Query() listEmailDto: ListEmailDto, @Query(PaginationPipe) paginationDto: PaginationDto) {
    return this.emailService.list(listEmailDto, paginationDto);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.emailService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateEmailDto: UpdateEmailDto) {
    return this.emailService.update(+id, updateEmailDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.emailService.remove(+id);
  }

  @Post('send')
  send(@Body() sendEmailDto: SendEmailDto, @UserDec(UserEnum.userId) userId: number,) {
    return this.emailService.send(sendEmailDto);
  }

  // @RepeatSubmit()
  @Public()
  // @UseGuards(ImageCaptchaGuard)
  @Post("regCode")
  async sendRegCode(@Body() reqSmscodeSendDto: ReqEmailCodeSendDto): Promise<any> {
      if (!await this.sharedService.checkImageCaptcha(reqSmscodeSendDto.uuid, reqSmscodeSendDto.code))
          throw new ApiException('图形验证码错误')
      return this.emailService.sendRegCode(reqSmscodeSendDto.email, reqSmscodeSendDto.lang);
  }

  // @RepeatSubmit()
  @Public()
  // @UseGuards(ImageCaptchaGuard)
  @Post("loginCode")
  async sendLoginCode(@Body() reqSmscodeSendDto: ReqEmailCodeSendDto): Promise<any> {
      if (!await this.sharedService.checkImageCaptcha(reqSmscodeSendDto.uuid, reqSmscodeSendDto.code))
          throw new ApiException('图形验证码错误')
      return this.emailService.sendLoginCode(reqSmscodeSendDto.email, reqSmscodeSendDto.lang);
  }

  @Post("checkcode")
  @Public()
  async checkSmsCode(@Body() reqSmscodCheckDto: ReqEmailCodeCheckDto): Promise<any> {
      return this.emailService.checkEmailCode(reqSmscodCheckDto);
  }
}
