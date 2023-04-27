import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import configuration from './config/configuration'
import { SharedModule } from '@app/shared/shared.module';
import { UserModule } from '@app/modules/user/user.module';
import { CommonModule } from '@app/modules/common/common.module';
import { LoginModule } from '@app/modules/login/login.module';
import { AuthModule } from '@app/modules/auth/auth.module';

@Module({
  imports: [
    HttpModule.register({
      timeout: 5000,
      maxRedirects: 5,
    }),

    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration]
    }),

    /* 公共模块 */
    SharedModule,
    /* 业务模块 */
    CommonModule,
    LoginModule,
    AuthModule,
    UserModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
