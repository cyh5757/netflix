import { Controller, Get, Patch, Delete,Post,Param,Body,NotFoundException, Query } from '@nestjs/common';
import { AppService } from './app.service';



@Controller('movie')
export class AppController {
  // dependency injection
  constructor(private readonly appService: AppService) {}
  @Get()
  getMovies(
    @Query('title') title?: string,
  ){

    /// title 쿼리의 타입이 string 타입인지?
    /// 이런거는 controller에서 하면 됨.
    // 하지만 논리는 service에서 진행
    return this.appService.getManyMovies(title);
  }
  @Get(':id')
  getMovie(@Param('id') id:string){
    return this.appService.getMovieById(+id);

    
  }

  //path param이 필요없음
  @Post()
  postMovie(
    @Body('title') title: string,
  ){
    return this.appService.createMovie(title);
  }
  //path param이 필요함.
  @Patch(':id')
  patchMovie(
    @Param('id') id: string,
    @Body('title') title: string,
  ){
    return this.appService.updateMovie(+id, title)

  }

  @Delete(':id')
  deleteMovie(
    @Param('id') id: string,
    @Body('title') title: string,
  ){
    return this.appService.deleteMovie(+id);
  } 
}