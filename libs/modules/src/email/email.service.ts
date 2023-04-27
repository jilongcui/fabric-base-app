import { PaginatedDto } from '@app/common/dto/paginated.dto';
import { PaginationDto } from '@app/common/dto/pagination.dto';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { stubObject } from 'lodash';
import { FindOptionsWhere, Repository } from 'typeorm';
import { CreateEmailDto, ListEmailDto, ReqEmailCodeCheckDto, SendEmailDto, SendEmailWithAttachDto } from './dto/create-email.dto';
import { UpdateEmailDto } from './dto/update-email.dto';
import { Email } from './entities/email.entity';
import { SES, SendRawEmailCommand } from '@aws-sdk/client-ses';
import { ApiException } from '@app/common/exceptions/api.exception';
import { USER_EMAILCODE_KEY } from '@app/common/contants/redis.contant';
import { InjectRedis } from '@liaoliaots/nestjs-redis';
import Redis from 'ioredis';
const nodemailer = require("nodemailer");

@Injectable()
export class EmailService {
  logger = new Logger(EmailService.name)
  platformEmail: string
  emailRegion: string
  emailVersion: string
  constructor(
    @InjectRepository(Email) private readonly emailRepository: Repository<Email>,
    @InjectRedis() private readonly redis: Redis,
    private readonly configService: ConfigService
  ) {
    this.platformEmail = this.configService.get<string>('aws.platformEmail')
    this.emailRegion = this.configService.get<string>('aws.emailRegion')
    this.emailVersion = this.configService.get<string>('aws.emailRegion')
  }


  create(createEmailDto: CreateEmailDto, userId: number) {
    const email = {
      ...createEmailDto,
      userId
    }
    return this.emailRepository.save(email)
  }

  
  /* 分页查询 */
  async list(listMailList: ListEmailDto, paginationDto: PaginationDto): Promise<PaginatedDto<Email>> {
    let where: FindOptionsWhere<Email> = {}
    let result: any;
    where = listMailList

    result = await this.emailRepository.findAndCount({
      where,
      relations: { user: true,},
      skip: paginationDto.skip,
      take: paginationDto.take,
      order: {
        createTime: 'DESC',
      }
    })

    return {
      rows: result[0],
      total: result[1]
    }
  }

  findOne(id: number) {
    return `This action returns a #${id} email`;
  }

  update(id: number, updateEmailDto: UpdateEmailDto) {
    return `This action updates a #${id} email`;
  }

  remove(id: number) {
    return `This action removes a #${id} email`;
  }

  async sendRegCode(email: string, lang: string) {
    await this.sendEmailCode(email, 'regCodeTemplate', lang);
  }

  async sendLoginCode(email: string, lang: string) {
      await this.sendEmailCode(email, 'loginCodeTemplate', lang);
  }

  async checkEmailCode(reqCodeCheckDto: ReqEmailCodeCheckDto) {
      const cacheCode = await this.redis.get(`${USER_EMAILCODE_KEY}:${reqCodeCheckDto.email}`)
      if (!cacheCode) throw new ApiException("邮箱验证码已过期")
      if (reqCodeCheckDto.code != cacheCode) throw new ApiException("邮箱验证码错误")
  }

  async checkAndDeleteEmailCode(reqSmsCodeCheckDto: ReqEmailCodeCheckDto) {
      this.checkEmailCode(reqSmsCodeCheckDto)
      await this.redis.del(`${USER_EMAILCODE_KEY}:${reqSmsCodeCheckDto.code}`)
  }
  
  async sendEmailCode(email: string, codeTemplateName: string, lang: string) {
    
    const code = `${this.random()}`;
    const subject = this.configService.get<any>(`email.${codeTemplateName}.subject.${lang}`)
    const content = this.configService.get<any>(`email.${codeTemplateName}.content.${lang}`)

    const sendEmailDto: SendEmailDto = {
      to: email,
      subject: subject.replace('{code}', code),
      text: content.replace('{code}', code),
    };

    try {
        await this.send(sendEmailDto);
        await this.redis.set(`${USER_EMAILCODE_KEY}:${email}`, code, 'EX', 300)

    } catch (err) {
        throw new ApiException(err)
    }
  }

  async send(sendEmailDto: SendEmailDto) {

    const ses = new SES({
      region: this.emailRegion,
      apiVersion: this.emailVersion,
      credentials: {
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
        accessKeyId: process.env.AWS_ACCESS_KEY_ID
      }
    });
    let transporter = nodemailer.createTransport({
      SES: {
        ses: ses,
        aws: { SendRawEmailCommand},
      }
    });

    // send mail with defined transport object
    let info = await transporter.sendMail({
      from: this.platformEmail,
      to: sendEmailDto.to,
      subject: sendEmailDto.subject,                // Subject line
      text: sendEmailDto.text,                      // plaintext version
      html: '<div>' + sendEmailDto.text + '</div>', // html version
    });

    console.log("Message sent: %s", info.messageId);
    // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>
    return info; // or something
  }

  async sendWithAttach(sendEmailDto: SendEmailWithAttachDto, userId: number) {

    let usefulData = 'some,stuff,to,send';
    
    const ses = new SES({
      region: this.emailRegion,
      apiVersion: this.emailVersion,
      credentials: {
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
        accessKeyId: process.env.AWS_ACCESS_KEY_ID
      }
    });
    let transporter = nodemailer.createTransport({
      SES: {
        ses: ses,
        aws: { SendRawEmailCommand},
      }
    });
    

    // send mail with defined transport object
    let info = await transporter.sendMail({
      from: this.platformEmail,
      to: sendEmailDto.to,
      subject: sendEmailDto.subject,                // Subject line
      text: sendEmailDto.text,                      // plaintext version
      html: '<div>' + sendEmailDto.text + '</div>', // html version
    });

    this.create(sendEmailDto as CreateEmailDto, userId)
    console.log("Message sent: %s", info.messageId);
    // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>
    return info; // or something
  }

  private random(): number {
    return Math.floor((Math.random() * 9999) + 1000);
}
}
