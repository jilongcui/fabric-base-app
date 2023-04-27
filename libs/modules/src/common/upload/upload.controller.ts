/*
https://docs.nestjs.com/controllers#controllers
*/

import { Controller, Post, Query, UploadedFile, UploadedFiles, UseInterceptors } from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import * as COS from 'cos-nodejs-sdk-v5';

import { ApiBearerAuth, ApiBody, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { UploadService } from './upload.service';
import { Public } from '@app/common/decorators/public.decorator';

export const ApiFile = (fileName: string = 'file'): MethodDecorator => (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor,
) => {
    ApiBody({
        schema: {
            type: 'object',
            properties: {
                [fileName]: {
                    type: 'string',
                    format: 'binary',
                },
            },
        },
    })(target, propertyKey, descriptor);
};

@ApiTags('文件上传')
@ApiBearerAuth()
@Controller('common')
export class UploadController {
    cos: COS
    bucket: string
    region: string

    constructor(
        private readonly configService: ConfigService,
        private readonly uploadService: UploadService
    ) {

    }
    /* 单文件上传 */
    @Post('upload')
    @ApiConsumes('multipart/form-data')
    @ApiFile()
    @UseInterceptors(FileInterceptor('file'))
    async uploadFile(@UploadedFile() file: Express.Multer.File, @Query('fileName') fileName) {
        return {
            fileName,
            originalname: file.originalname,
            mimetype: file.mimetype,
        }
    }

    /* 数组文件上传 */
    @Post('uploads')
    @UseInterceptors(FilesInterceptor('files'))
    async uploadFils(@UploadedFiles() files: Array<Express.Multer.File>) {
        /* 暂未处理 */
        return files
    }

    /* 单文件上传到Cos */
    @Post('uploadCos')
    @Public()
    @ApiConsumes('multipart/form-data')
    @ApiFile()
    @UseInterceptors(FileInterceptor('file'))
    async uploadFileCos(@UploadedFile() file: Express.Multer.File, @Query('fileName') fileName) {

        const url = await this.uploadService.uploadToCos(fileName, file.path)

        return {
            fileName,
            originalname: file.originalname,
            mimetype: file.mimetype,
            location: url,
        }
    }

    /* 数组文件上传到Cos */
    @Post('uploadsCos')
    @Public()
    @UseInterceptors(FileInterceptor('file'))
    async uploadFilesCos(@UploadedFile() files: Array<Express.Multer.File>) {
        // 分片上传
        // const result = await this.cos.sliceUploadFile({
        //     Bucket: this.bucket,
        //     Region: this.region,
        //     Key: fileName,
        //     FilePath: file.path // 本地文件地址，需自行替换
        // });
        return files
    }
}
