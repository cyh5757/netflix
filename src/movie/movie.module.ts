import { Module } from '@nestjs/common';
import { MovieService } from './movie.service';
import { MovieController } from './movie.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Movie } from './entity/movie.entity';
import { MovieDetail } from './entity/movie-dtail.entity';
import { Director } from 'src/director/entity/director.entity';
import { DirectorService } from 'src/director/director.service';
import { Genre } from 'src/genre/entities/genre.entity';
import { CommonModule } from 'src/common/common.module';

@Module({
  imports: [TypeOrmModule.forFeature([
    Movie,
    MovieDetail,
    Director,
    Genre,
  ]),
  CommonModule,

  ], // other modules that this module depends on
  controllers: [MovieController],
  providers: [MovieService],

})
export class MovieModule { }
