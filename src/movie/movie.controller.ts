import { Controller, Request, Get, Post, Body, Patch, Param, Delete, Query, UseInterceptors, ClassSerializerInterceptor, ParseIntPipe, ParseFloatPipe, DefaultValuePipe, NotFoundException, UseGuards, UploadedFile, UploadedFiles, BadRequestException, Version, VERSION_NEUTRAL } from '@nestjs/common';
import { MovieService } from './movie.service';
import { CreateMovieDto } from './dto/create-movie.dto';
import { UpdateMovieDto } from './dto/update-movie.dto';
import { MovieTitleValidationPipe } from './pipe/movie-title-validation.pipe';
import { AuthGuard } from 'src/auth/guard/auth.guard';
import { Public } from 'src/auth/decorator/public.decorator';
import { RBAC } from 'src/auth/decorator/rbac.decorator';
import { Role } from 'src/user/entities/user.entity';
import { GetMoivesDto } from './dto/get-movies.dto';
import { Transaction } from 'typeorm';
import { TransactionInterceptor } from 'src/common/interceptor/transaction.interceptor';
import { FileFieldsInterceptor, FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { MovieFilePipe } from './pipe/movie-file.pipe';
import { UserId } from 'src/user/decorator/user-id.decorator';
import { QueryRunner } from 'src/common/decorator/query-runner.decorator';
import {QueryRunner as QR} from 'typeorm';
import { CacheInterceptor } from 'src/common/interceptor/cache.interceptor';
import {CacheKey, CacheTTL, CacheInterceptor as CI} from '@nestjs/cache-manager';
import { ThrottleInterceptor } from 'src/common/interceptor/throttle.interceptor';
import { Throttle } from 'src/common/decorator/throttle.decorator';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';




@Controller('movie')
@ApiBearerAuth()
@ApiTags('movie')
@UseInterceptors(ClassSerializerInterceptor)
export class MovieController {
  constructor(private readonly movieService: MovieService) { }

  @Get()
  @Public()
  @Throttle({
    count: 5,
    unit: 'minute',
  })
  @ApiOperation({
    description: '[Movie]를 pagination하는 Api'
  })
  @ApiResponse({
    status: 200,
    description: '성공적으로 API Pagination을 시행했을 때'
  })
  getMovies(
    @Query() dto?: GetMoivesDto,
    @UserId() userId?: number,
  ) {

    /// title 쿼리의 타입이 string 타입인지?
    /// 이런거는 controller에서 하면 됨.
    // 하지만 논리는 service에서 진행
    return this.movieService.findAll(dto, userId);
  }
  /// get :id 보다 먼저 나와야한다.
  @Get('recent')
  @UseInterceptors(CI)
  @CacheKey('getMoviewRecent')
  @CacheTTL(1000)
  getMoviesRecent(){
    return this.movieService.findRecent();


  }

  
  @Get(':id')
  @Public()
  getMovie(
    @Param('id', ParseFloatPipe) id: number,
  ) {

    return this.movieService.findOne(id);
  }

  //path param이 필요없음
  @Post()
  @RBAC(Role.admin)
  @UseInterceptors(TransactionInterceptor)
  postMovie(
    @Body() body: CreateMovieDto,
    @QueryRunner() QueryRunner: QR,
    @UserId() userId: number,
  ) {
    return this.movieService.create(
      body,
      userId,
      QueryRunner,

    );
  }
  //path param이 필요함.
  @Patch(':id')
  @RBAC(Role.admin)
  patchMovie(
    @Param('id', ParseIntPipe) id: string,
    @Body() body: UpdateMovieDto,
  ) {
    return this.movieService.update(
      +id,
      body,
    );

  }

  @Delete(':id')
  @RBAC(Role.admin)
  deleteMovie(
    @Param('id', ParseIntPipe) id: string,
    @Body('title') title: string,
  ) {
    return this.movieService.remove(+id);
  }

  /*
    [Like] [Dislike]

    아무것도 누르지 않은 상태
    like & Dislike 모두 버튼 꺼져있음.

    Like 버튼 누르면
    Like 버튼 불 켜짐

    Like 버튼 다시 누르면
    Like 버튼 불 꺼짐

    Dislike 버튼 누르면
    Dislike 버튼 불 켜짐

    Dislike 버튼 다시 누르면
    Dislike 버튼 불 꺼짐


    Dislike 버튼 누름
    Like 버튼 불 꺼지고 Dislike 버튼 불 켜짐.
  */

    @Post(':id/like')
    createMovieLike(
      @Param('id', ParseIntPipe) movieId: number,
      @UserId() userId: number,
    ){
      return this.movieService.toggleMovieLike(movieId, userId, true);
    }

    @Post(':id/dislike')
    createMovieDislike(
      @Param('id', ParseIntPipe) movieId: number,
      @UserId() userId: number,
    ){
      return this.movieService.toggleMovieLike(movieId, userId, false);
    }




}
