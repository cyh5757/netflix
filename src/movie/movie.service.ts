import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateMovieDto } from './dto/create-movie.dto';
import { UpdateMovieDto } from './dto/update-movie.dto';
import { Movie } from './entity/movie.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Like, Repository } from 'typeorm';



@Injectable()
export class MovieService {

  constructor(
    @InjectRepository(Movie)
    private readonly movieRepository: Repository<Movie>
  ) { }

  async getManyMovies(title?: string) {
    /// 나중에 title 필터 기능 추가하기
    if(!title){
      return [await this.movieRepository.find(), await this.movieRepository.count()];
    }
    return this.movieRepository.findAndCount({
      where: {
        title: Like(`%${title}%`),
      }
    });
    return this.movieRepository.find();

  }
  async getMovieById(id: number) {
    const movie = await this.movieRepository.findOne({
      where: {
        id,
      }
    })
    return movie
  }
  async createMovie(createMovieDto: CreateMovieDto) {
    //create는 객체만 생성, save를 사용해야 저장
    const movie = await this.movieRepository.save(createMovieDto)
  
    return movie;
  }
  async updateMovie(id: number, updateMovieDto: UpdateMovieDto) {
    const movie = await this.movieRepository.findOne({
      where: {
        id,
      }
    });

    if (!movie) {
      throw new NotFoundException(`존재하지 않는 ID의 영화입니다. ${id}`);
    }
    this.movieRepository.update(
      {id},
      updateMovieDto, //update된 값을 반환하지 않기에 또 findone을 사용해서 가져와야한다.
    );
    const newmovie = await this.movieRepository.findOne({
      where: {
        id,
      }
    })

    return newmovie;
  }

  async deleteMovie(id: number) {
    const movie = await this.movieRepository.findOne({
      where: {
        id,
      }
    })
    if (!movie) {
      throw new NotFoundException(`존재하지 않는 ID의 영화입니다. ${id}`);
    }
    await this.movieRepository.delete(id)

  }

}
