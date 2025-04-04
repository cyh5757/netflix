import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true, /// 정의되어있지 않는 값은 전달하지않는다. 알아서 필터링
    forbidNonWhitelisted: true, // 있으면 안되는 값이 들어온다고 하면 에러.
    transformOptions:{
      enableImplicitConversion: true
    }

  }));
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
