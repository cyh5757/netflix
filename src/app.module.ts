import { Module } from '@nestjs/common';

import { MovieModule } from './movie/movie.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import * as Joi from 'joi';
import { Movie} from './movie/entity/movie.entity';
import { MovieDetail } from './movie/entity/movie-dtail.entity';
import { DirectorModule } from './director/director.module';
import { Director } from './director/entity/director.entity';
import { GenreModule } from './genre/genre.module';
import { Genre } from './genre/entities/genre.entity';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { User } from './user/entities/user.entity';
import { envVariableKeys } from './common/const/env.const';
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
        HASH_ROUNDS: Joi.number().required(),
        ACCESS_TOKEN_SECRET: Joi.string().required(),
        REFRESH_TOKEN_SECRET: Joi.string().required(),
      })
    }),
    TypeOrmModule.forRootAsync({ // 비동기하는 이유: config 모듈이 인스턴스화 -> inject 받아야해서
      useFactory: (configService: ConfigService) => ({ 
        type: configService.get<string>(envVariableKeys.dbType) as "postgres",
        host: configService.get<string>(envVariableKeys.dbHost),
        port: configService.get<number>(envVariableKeys.dbPort),
        username: configService.get<string>(envVariableKeys.dbUsername),
        password: configService.get<string>(envVariableKeys.dbPassword),
        database: configService.get<string>(envVariableKeys.dbDatabase),
        entities: [
          Movie,
          MovieDetail,
          Director,
          Genre,
          User,

        ],
        synchronize: true, // 개발할때만 true.
      }),
      inject: [ConfigService] //config service 우선 동작해서 인스턴스화 하고 typeorm 실행 -> 비동기, 받아오기에 inject
    }),
    MovieModule,
    DirectorModule,
    GenreModule,
    AuthModule,
    UserModule,
  ],
})
export class AppModule { }
