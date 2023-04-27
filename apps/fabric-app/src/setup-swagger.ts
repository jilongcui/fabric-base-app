import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';


interface SwaggerConfig {
  title: string, version: string
}

export function setupSwagger(app: INestApplication, config: SwaggerConfig): void {
  const swaggerConfig = new DocumentBuilder()
    .setTitle(config.title)
    .setVersion(config.version)
    .setDescription('Api文档')
    .setTermsOfService('https://docs.nestjs.cn/8/introduction')
    .setLicense('MIT', 'https://www.baidu.com')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup(`swagger-ui`, app, document);
}
