import { UploadController } from './upload.controller';
/*
https://docs.nestjs.com/modules
*/

import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { extname, join } from 'path';
import * as fs from 'fs';
import * as moment from 'moment'
import * as multer from 'multer';
import { SharedModule } from '@app/shared';
import { UploadService } from './upload.service';


export let storage = multer.diskStorage({
    // 配置上传文件夹
    destination: async (req, file, cd) => {
        let currentDate = moment().format('YYYYMMDD')
        let path = join('/var/www/public', `/upload/${currentDate}`)
        try {
            // 判断是否有该文件夹
            await fs.promises.stat(path)
        } catch (error) {
            // 没有该文件夹就创建
            await fs.promises.mkdir(path, { recursive: true })
        }
        // 挂载文件存储的路径
        req.query.fileName = '/upload/' + currentDate + '/'
        cd(null, path)
    },
    // 配置上传文件名
    filename: (req, file, cd) => {
        // Date.now() + '-'
        const uniqueSuffix = Math.round(Math.random() * 1E9).toString()
        // 挂载文件存储的路径
        const extName = extname(file.originalname)
        req.query.fileName = req.query.fileName + uniqueSuffix + extName
        cd(null, uniqueSuffix + extName)
    }
})

@Module({
    imports: [
        SharedModule,
        MulterModule.register({
            limits: {
                fieldNameSize: 300,
                fieldSize: 10048576,
                fileSize: 10048576, // 10 Mb
            },
            storage: storage,
            preservePath: false,
        })],
    controllers: [
        UploadController,],
    providers: [MulterModule, UploadService],
    exports: [UploadService]
})
export class UploadModule { }
