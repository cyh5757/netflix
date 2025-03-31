import { Controller,Request, Get, Post, Body, Patch, Param, Delete, Query, UseInterceptors, ClassSerializerInterceptor, ParseIntPipe, ParseFloatPipe, DefaultValuePipe, NotFoundException, UseGuards } from '@nestjs/common';
import { MovieService } from './movie.service';
import { CreateMovieDto } from './dto/create-movie.dto';
import { UpdateMovieDto } from './dto/update-movie.dto';
import { MovieTitleValidationPipe } from './pipe/movie-title-validation.pipe';
import { AuthGuard } from 'src/auth/guard/auth.guard';








@Controller('movie')
@UseInterceptors(ClassSerializerInterceptor)
export class MovieController {
  constructor(private readonly movieService: MovieService) { }

  @Get()
  getMovies(
    @Query('title',MovieTitleValidationPipe) title?: string,
  ) {

    /// title 쿼리의 타입이 string 타입인지?
    /// 이런거는 controller에서 하면 됨.
    // 하지만 논리는 service에서 진행
    return this.movieService.findAll(title);
  }
  @Get(':id')
  getMovie(
    @Param('id', ParseFloatPipe) id: number,
  ) {

    return this.movieService.findOne(id);
  }

  //path param이 필요없음
  @Post()
  postMovie(
    @Body() body: CreateMovieDto,
  ) {
    return this.movieService.create(
      body,
    );
  }
  //path param이 필요함.
  @Patch(':id')
  patchMovie(
    @Param('id',ParseIntPipe) id: string,
    @Body() body: UpdateMovieDto,
  ) {
    return this.movieService.update(
      +id,
      body,
    );

  }

  @Delete(':id')
  deleteMovie(
    @Param('id',ParseIntPipe) id: string,
    @Body('title') title: string,
  ) {
    return this.movieService.remove(+id);
  }
}
