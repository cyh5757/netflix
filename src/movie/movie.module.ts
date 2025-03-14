import { Module } from '@nestjs/common';
import { MovieService } from './movie.service';
import { MovieController } from './movie.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Movie} from './entity/movie.entity';
import { MovieDetail } from './entity/movie-dtail.entity';

@Module({
  imports: [TypeOrmModule.forFeature([
    Movie,
    MovieDetail,
    

  ])], // other modules that this module depends on
  controllers: [MovieController],
  providers: [MovieService],
})
export class MovieModule {}
