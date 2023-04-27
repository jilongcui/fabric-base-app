import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PaginatedDto } from '@app/common/dto/paginated.dto';
import { PaginationDto } from '@app/common/dto/pagination.dto';
import { Repository, FindOptionsWhere } from 'typeorm';
import * as COS from 'cos-nodejs-sdk-v5';
import { ConfigService } from '@nestjs/config';
import path, { join } from 'path';

@Injectable()
export class UploadService {
    logger = new Logger(UploadService.name)
    cos: COS
    bucket: string
    region: string
    cosDomain: string
    cosGlobalDomain: string

    constructor(
        private readonly configService: ConfigService,
    ) {
        const secretId = this.configService.get<string>('tencentCOS.SecretId')
        const secretKey = this.configService.get<string>('tencentCOS.SecretKey')
        this.cosDomain = this.configService.get<string>('tencentCOS.CosDomain')
        this.cosGlobalDomain = this.configService.get<string>('tencentCOS.CosGlobalDomain')
        this.bucket = this.configService.get<string>('tencentCOS.CosBucket')
        this.region = this.configService.get<string>('tencentCOS.CosRegion')
        // this.logger.debug('secretId ' + secretId)
        this.cos = new COS({
            SecretId: secretId,
            SecretKey: secretKey,
            Domain: this.cosGlobalDomain
        });

    }

    async uploadToCos(fileName: string, localPath: string): Promise<string> {
        // 分片上传
        await this.cos.sliceUploadFile({
            Bucket: this.bucket,
            Region: this.region,
            Key: fileName,
            ChunkSize: 8 * 1024 * 1024,
            FilePath: localPath // 本地文件地址，需自行替换
        });

        return await this.thumbnail(fileName, '/2/w/1024')
        // return this.cosDomain + '/' + fileName
    }

    async uploadBufferToCos(fileName: string, buffer: Buffer): Promise<string> {
        // 分片上传
        await this.cos.putObject({
            Bucket: this.bucket,
            Region: this.region,
            Key: fileName,              /* 必须 */
            ContentType:"image/png",
            Body: buffer, // 上传文件对象
            onProgress: function(progressData) {
                //console.log(JSON.stringify(progressData));
            }
        });

        return this.cosDomain + '/' + fileName
    }

    async uploadBase64ToCos(fileName: string, base64: string): Promise<string> {
        // 分片上传
        await this.cos.putObject({
            Bucket: this.bucket,
            Region: this.region,
            Key: fileName,              /* 必须 */
            ContentType:"image/png",
            Body: Buffer.from(base64, 'base64'), // 上传文件对象
            onProgress: function(progressData) {
                //console.log(JSON.stringify(progressData));
            }
        });

        return this.cosDomain + '/' + fileName
    }

    async thumbnail(fileName: string, scale: string) {
        // 生成带图片处理参数的文件 URL，不带签名。
        return new Promise<string>((resolve, reject) => {
            this.cos.getObjectUrl({
                Bucket: this.bucket,
                Region: this.region,
                Key: fileName,
                QueryString: `imageMogr2/thumbnail/${scale}/`,
                Sign: false,
            }, (err, data) => {
                if (data) {
                    resolve(data.Url)
                } else {
                    reject(new Error("thumbnail error."))
                }
            })
        })
    }

    /**
     * 将以base64的图片url数据转换为Blob
     * @param urlData
     *            用url方式表示的base64图片数据
     */
    convertBase64UrlToBlob(urlData){

        var bytes=window.atob(urlData.split(',')[1]);        //去掉url的头，并转换为byte

        //处理异常,将ascii码小于0的转换为大于0
        var ab = new ArrayBuffer(bytes.length);
        var ia = new Uint8Array(ab);
        for (var i = 0; i < bytes.length; i++) {
            ia[i] = bytes.charCodeAt(i);
        }

        return new Blob( [ab] , {type : 'image/png'});
    }
}