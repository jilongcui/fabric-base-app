/*
 * @Author: Sheng.Jiang
 * @Date: 2021-12-08 16:44:29
 * @LastEditTime: 2022-05-23 09:09:56
 * @LastEditors: Please set LastEditors
 * @Description: 公共模块
 * @FilePath: \meimei-admin\src\shared\shared.module.ts
 * You can you up，no can no bb！！
 */
import { SharedService } from './shared.service';
import { CacheModule, Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { ReponseTransformInterceptor } from '@app/common/interceptors/reponse-transform.interceptor';
import { OperationLogInterceptor } from '@app/common/interceptors/operation-log.interceptor';
import { JwtAuthGuard } from '@app/common/guards/jwt-auth.guard';
import { PermissionAuthGuard } from '@app/common/guards/permission-auth.guard';
import { RoleAuthGuard } from '@app/common/guards/role-auth.guard';
import { LogModule } from '@app/modules/monitor/log/log.module';
import { BullModule } from '@nestjs/bull';
import { RepeatSubmitGuard } from '@app/common/guards/repeat-submit.guard';
import { DemoEnvironmentGuard } from '@app/common/guards/demo-environment.guard';
import { RedisModule } from '@liaoliaots/nestjs-redis';
import Redis from 'ioredis';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { JwtModule } from '@nestjs/jwt';


@Global()
@Module({
    imports: [
        /* 连接mysql数据库 */
        TypeOrmModule.forRootAsync({
            name: 'default',
            useFactory: (configService: ConfigService) => ({
                autoLoadEntities: true,
                type: configService.get<any>('database.type'),
                host: configService.get<string>('database.host'),
                port: configService.get<number>('database.port'),
                username: configService.get<string>('database.username'),
                password: configService.get<string>('database.password'),
                database: configService.get<string>('database.database'),
                autoLoadModels: configService.get<boolean>('database.autoLoadModels'),
                synchronize: configService.get<boolean>('database.synchronize'),
                logging: configService.get('database.logging'),
            }),
            inject: [ConfigService]
        }),

        /* 连接redis */
        RedisModule.forRootAsync({
            useFactory: (configService: ConfigService) => configService.get<any>('redis'),
            inject: [ConfigService]
        }),
        /* 启用队列 */
        BullModule.forRootAsync({
            useFactory: async (configService: ConfigService) => ({
                redis: {
                    host: configService.get<string>('bullRedis.host'),
                    port: configService.get<number>('bullRedis.port'),
                    db: configService.get<number>('bullRedis.db'),
                    password: configService.get<string>('bullRedis.password'),
                }
            }),
            inject: [ConfigService]

        }),
        // {executablePath: configService.get<string>('screenshot.execPath')
        // PuppeteerModule.forRootAsync({
        //     useFactory: async (configService: ConfigService) => ({
        //         launchOptions: {executablePath:'/Applications/Chromium.app/Contents/MacOS/Chromium', isGlobal: true }, 
        //     }),
        //     inject: [ConfigService]
        // }),
        LogModule,
        ThrottlerModule.forRoot({
            ttl: 10,
            limit: 50000,
        }),
    ],
    controllers: [],
    providers: [
        SharedService,

        //jwt守卫
        {
            provide: APP_GUARD,
            useClass: JwtAuthGuard,
        },

        // // 角色守卫
        // {
        //     provide: APP_GUARD,
        //     useClass: RoleAuthGuard,
        // },

        // // 权限守卫
        // {
        //     provide: APP_GUARD,
        //     useClass: PermissionAuthGuard,
        // },
        //阻止连续提交守卫
        {
            provide: APP_GUARD,
            useClass: RepeatSubmitGuard,
        },
        //是否演示环境守卫
        {
            provide: APP_GUARD,
            useClass: DemoEnvironmentGuard,
        },

        {
            provide: APP_GUARD,
            useClass: ThrottlerGuard
        },

        /* 操作日志拦截器 。 注：拦截器中的 handle 从下往上执行（ReponseTransformInterceptor ----> OperationLogInterceptor），返回值值依次传递 */
        {
            provide: APP_INTERCEPTOR,
            useClass: OperationLogInterceptor
        },
        /* 全局返回值转化拦截器 */
        {
            provide: APP_INTERCEPTOR,
            useClass: ReponseTransformInterceptor
        },

    ],
    exports: [
        SharedService,
    ]
})
export class SharedModule { }
