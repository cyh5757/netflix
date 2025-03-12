import { Module } from '@nestjs/common';

import { MovieModule } from './movie/movie.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import * as Joi from 'joi';
import { Content, Movie, Series } from './movie/entity/movie.entity';
/// 중앙집합 모듈.

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        //joi validation
        ENV: Joi.string().valid('dev', 'prod').required(),
        DB_TYPE: Joi.string().valid('postgres').required(),
        DB_HOST: Joi.string().required(),
        DB_PORT: Joi.number().required(),
        DB_USERNAME: Joi.string().required(),
        DB_PASSWORD: Joi.string().required(),
        DB_DATABASE: Joi.string().required(),


      })
    }),
    TypeOrmModule.forRootAsync({ // 비동기하는 이유: config 모듈이 인스턴스화 -> inject 받아야해서
      useFactory: (configService: ConfigService) => ({ 
        type: configService.get<string>('DB_TYPE') as "postgres",
        host: configService.get<string>('DB_HOST'),
        port: configService.get<number>('DB_PORT'),
        username: configService.get<string>('DB_USERNAME'),
        password: configService.get<string>('DB_PASSWORD'),
        database: configService.get<string>('DB_DATABASE'),
        entities: [
          Movie,
          Series,
          Content,
        ],
        synchronize: true, // 개발할때만 true.
      }),
      inject: [ConfigService] //config service 우선 동작해서 인스턴스화 하고 typeorm 실행 -> 비동기, 받아오기에 inject
    }),
    MovieModule,
  ],
})
export class AppModule { }
