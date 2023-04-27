import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from '@app/common/filters/all-exception.filter';
import { setupSwagger } from './setup-swagger';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  /* 全局异常过滤器 */
  app.useGlobalFilters(new AllExceptionsFilter())  // 全局异常过滤器

  app.setGlobalPrefix("api")

  app.disable('x-powered-by')

  // app.useWebSocketAdapter(new IoAdapter(app));

  /* 全局参数校验管道 */
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,  // 启用白名单，dto中没有声明的属性自动过滤
    transform: true,   // 自动类型转换
  }))

  /* 配置静态资源目录 */
  // app.useStaticAssets(join(__dirname, '../public'));

  /* 启动swagger */
  setupSwagger(app, {title: 'Fabric App', version: '0.0.1'})

  const port = process.env.APP_PORT || 3000
  await app.listen(port);
  /* 打印swagger地址 */
  console.log(`http://127.0.0.1:${port}/swagger-ui/`);
}
bootstrap();
