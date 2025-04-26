import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';

async function bootstrap() {
  const app = await NestFactory.create(AppModule,{
    logger: ['verbose'],
  });
  app.enableVersioning({
    type: VersioningType.MEDIA_TYPE,
    key: 'v=',
  })
  app.useLogger(app.get(WINSTON_MODULE_NEST_PROVIDER))
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true, /// 정의되어있지 않는 값은 전달하지않는다. 알아서 필터링
    forbidNonWhitelisted: true, // 있으면 안되는 값이 들어온다고 하면 에러.
    transformOptions:{
      enableImplicitConversion: true,
    }

  }));
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
