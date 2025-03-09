import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseInterceptors, ClassSerializerInterceptor } from '@nestjs/common';
import { MovieService } from './movie.service';
import { CreateMovieDto } from './dto/create-movie.dto';
import { UpdateMovieDto } from './dto/update-movie.dto';


@Controller('movie')
@UseInterceptors(ClassSerializerInterceptor)
export class MovieController {
  constructor(private readonly movieService: MovieService) { }

  @Get()
  getMovies(
    @Query('title') title?: string,
  ) {

    /// title 쿼리의 타입이 string 타입인지?
    /// 이런거는 controller에서 하면 됨.
    // 하지만 논리는 service에서 진행
    return this.movieService.getManyMovies(title);
  }
  @Get(':id')
  getMovie(@Param('id') id: string) {
    return this.movieService.getMovieById(+id);
  }

  //path param이 필요없음
  @Post()
  postMovie(
    @Body() body: CreateMovieDto,
  ) {
    return this.movieService.createMovie(
      body,
    );
  }
  //path param이 필요함.
  @Patch(':id')
  patchMovie(
    @Param('id') id: string,
    @Body() body: UpdateMovieDto,
  ) {
    return this.movieService.updateMovie(
      +id,
      body,
    );

  }

  @Delete(':id')
  deleteMovie(
    @Param('id') id: string,
    @Body('title') title: string,
  ) {
    return this.movieService.deleteMovie(+id);
  }
}
