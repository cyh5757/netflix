import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateMovieDto } from './dto/create-movie.dto';
import { UpdateMovieDto } from './dto/update-movie.dto';
import { Movie } from './entity/movie.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Like, Repository } from 'typeorm';
import { MovieDetail } from './entity/movie-dtail.entity';
import { Director } from 'src/director/entity/director.entity';



@Injectable()
export class MovieService {

  constructor(
    @InjectRepository(Movie)
    private readonly movieRepository: Repository<Movie>,
    @InjectRepository(MovieDetail)
    private readonly movieDetailRepository: Repository<MovieDetail>,
    @InjectRepository(Director)
    private readonly directorRepository: Repository<Director>,
    
  ) { }

  async findAll(title?: string) {
    /// 나중에 title 필터 기능 추가하기
    if(!title){
      return [await this.movieRepository.find({
        relations:["director"]
      }), await this.movieRepository.count()];
    }
    return this.movieRepository.findAndCount({
      where: {
        title: Like(`%${title}%`),
      },
      relations: ['director']
    });
    return this.movieRepository.find();

  }
  async findOne(id: number) {
    const movie = await this.movieRepository.findOne({
      where: {
        id,
      },
      relations: ['detail','director']
    });
    if(!movie){
      throw new NotFoundException("존재하지 않는 ID의 영화입니다.")
    }
    return movie
  }
  async create(createMovieDto: CreateMovieDto) {
    //create는 객체만 생성, save를 사용해야 저장
    // const movieDetail = await this.movieDetailRepository.save({
    //   detail: createMovieDto.detail,
    // })
    const director = await this.directorRepository.findOne({
      where:{
        id: createMovieDto.directorID,
      },
    })

    if(!director){
      throw new NotFoundException('존재하지않는 감독')
    }

    const movie = await this.movieRepository.save({
      title: createMovieDto.title,
      genre: createMovieDto.genre,
      detail: {
        //Cascade 옵션 사용
        detail: createMovieDto.detail,
      },
      director,
      
      
    });
  
    return movie;
  }
  async update(id: number, updateMovieDto: UpdateMovieDto) {
    const movie = await this.movieRepository.findOne({
      where: {
        id,
      },
      relations: ['detail']
    });

    if (!movie) {
      throw new NotFoundException(`존재하지 않는 ID의 영화입니다. ${id}`);
    }

    const {detail,directorID, ...movieRest} = updateMovieDto;

    let newDirector;

    if(directorID){
      const director = await this.directorRepository.findOne({
        where:{
          id: directorID,
        }
      });

      if(!director){
        throw new NotFoundException(`존재하지 않는 ID의 영화입니다. ${id}`);
      }

      newDirector = director;
    }
    /*
    {director: director} --> x
    director: director 형태로 들어가짐
    */
    const movieUpdateFields ={
      ...movieRest,
      ...(newDirector && {director: newDirector})
    }

    this.movieRepository.update(
      {id},
      movieUpdateFields, //update된 값을 반환하지 않기에 또 findone을 사용해서 가져와야한다.
    );

    if(detail){
      await this.movieDetailRepository.update(
        {
          id: movie.detail.id,
        },
        {
          detail,
        }

      )
    }

    const newmovie = await this.movieRepository.findOne({
      where: {
        id,
      },
      relations: ['detail','director']
    })

    return newmovie;
  }

  async remove(id: number) {
    const movie = await this.movieRepository.findOne({
      where: {
        id,
      },
      relations: ['detail']
    })
    if (!movie) {
      throw new NotFoundException(`존재하지 않는 ID의 영화입니다. ${id}`);
    }
    await this.movieRepository.delete(id)
    await this.movieDetailRepository.delete(movie.detail.id)

  }
    
}
