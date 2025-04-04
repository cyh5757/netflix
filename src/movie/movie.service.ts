import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateMovieDto } from './dto/create-movie.dto';
import { UpdateMovieDto } from './dto/update-movie.dto';
import { Movie } from './entity/movie.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, In, Like, Repository } from 'typeorm';
import { MovieDetail } from './entity/movie-dtail.entity';
import { Director } from 'src/director/entity/director.entity';
import { Genre } from 'src/genre/entities/genre.entity';
import { GetMoivesDto } from './dto/get-movies.dto';
import { CommonService } from 'src/common/common.service';



@Injectable()
export class MovieService {

  constructor(
    @InjectRepository(Movie)
    private readonly movieRepository: Repository<Movie>,
    @InjectRepository(MovieDetail)
    private readonly movieDetailRepository: Repository<MovieDetail>,
    @InjectRepository(Director)
    private readonly directorRepository: Repository<Director>,
    @InjectRepository(Genre)
    private readonly genreRepository: Repository<Genre>,
    private readonly dataSource: DataSource,
    private readonly commonService: CommonService,

  ) { }

  async findAll(dto?: GetMoivesDto) {
    const {title, take, page} = dto;
    const qb = await this.movieRepository.createQueryBuilder('movie')
      .leftJoinAndSelect('movie.director', 'director')
      .leftJoinAndSelect('movie.genres', 'genres');

    if (title) {
      qb.where('movie.title LIKE :title', { title: `%${title}%` })
    }

    if(take && page){
      this.commonService.applyPagePaginationParamsToQb(qb,dto);
    }


    return await qb.getManyAndCount();
  }
  async findOne(id: number) {
    const movie = await this.movieRepository.createQueryBuilder('movie')
      .leftJoinAndSelect('movie.director', 'director')
      .leftJoinAndSelect('movie.genres', 'genres')
      .leftJoinAndSelect('movie.detail', 'detail')
      .where('movie.id=:id', { id })
      .getOne();


    // const movie = await this.movieRepository.findOne({
    //   where: {
    //     id,
    //   },
    //   relations: ['detail','director','genres']
    // });
    if (!movie) {
      throw new NotFoundException("존재하지 않는 ID의 영화입니다.")
    }
    return movie
  }
  async create(createMovieDto: CreateMovieDto) {
    //create는 객체만 생성, save를 사용해야 저장
    // const movieDetail = await this.movieDetailRepository.save({
    //   detail: createMovieDto.detail,
    // })
    const qr = this.dataSource.createQueryRunner();
    await qr.connect();
    await qr.startTransaction();


    try {
      const director = await qr.manager.findOne(Director, {
        where: {
          id: createMovieDto.directorID,
        },
      });

      if (!director) {
        throw new NotFoundException('존재하지않는 감독')
      }

      const genres = await qr.manager.find(Genre, {
        where: {
          id: In(createMovieDto.genreIds),
        },
      });

      if (genres.length !== createMovieDto.genreIds.length) {
        throw new NotFoundException(`존재하지않는 장르가 있습니다! 존재하는 ids ->${genres.map(genre => genre.id).join(',')}`)
      }

      const movieDetail = await qr.manager.createQueryBuilder()
        .insert()
        .into(MovieDetail)
        .values({
          detail: createMovieDto.detail,
        })
        .execute();

      const movieDetailId = movieDetail.identifiers[0].id;

      const movie = await qr.manager.createQueryBuilder()
        .insert()
        .into(Movie)
        .values({
          title: createMovieDto.title,
          detail: {
            //Cascade 옵션 사용
            id: movieDetailId,
          },
          director,
          //manytomany는 안된다. 따로 해야한다
        })
        .execute();

      const movieId = movie.identifiers[0].id;

      await qr.manager.createQueryBuilder()
        .relation(Movie, 'genres')
        .of(movieId)
        .add(genres.map(genre => genre.id))


      await qr.commitTransaction();

      return await this.movieRepository.findOne({
        where: {
          id: movieId,
        },
        relations: ['detail', 'director', 'genres']
      });

    } catch (e) {
      await qr.rollbackTransaction();
      throw e;
    } finally {
      await qr.release();
    }





    // 위 코드는 진짜 위험한 코드다
    // 중간 코드가 문제가 있으면 첫번째 insert가 계속 하게 될거다.
    // 따라서 쿼리를 한개로 모아줘야한다.<- 트랜잭셕

    // const movie = await this.movieRepository.save({
    //   title: createMovieDto.title,
    //   detail: {
    //     //Cascade 옵션 사용
    //     detail: createMovieDto.detail,
    //   },
    //   director,
    //   genres, 
    // });


  }
  async update(id: number, updateMovieDto: UpdateMovieDto) {
    const qr = this.dataSource.createQueryRunner();
    await qr.connect();
    await qr.startTransaction();


    try {
      const movie = await qr.manager.findOne(Movie,{
        where: {
          id,
        },
        relations: ['detail', 'genres']
      });
  
      if (!movie) {
        throw new NotFoundException(`존재하지 않는 ID의 영화입니다. ${id}`);
      }
  
      const { detail, directorID, genreIds, ...movieRest } = updateMovieDto;
  
      let newDirector;
  
      if (directorID) {
        const director = await qr.manager.findOne(Director,{
          where: {
            id: directorID,
          }
        });
  
        if (!director) {
          throw new NotFoundException(`존재하지 않는 ID의 영화입니다. ${id}`);
        }
  
        newDirector = director;
      }
  
      let newGenres;
  
      if (genreIds) {
        const genres = await qr.manager.find(Genre,{
          where: {
            id: In(genreIds),
          },
        });
        if (genres.length !== updateMovieDto.genreIds.length) {
          throw new NotFoundException(`존재하지않는 장르가 있습니다! 존재하는 ids ->${genres.map(genre => genre.id).join(',')}`)
        }
        newGenres = genres;
      }
      /*
      {director: director} --> x
      director: director 형태로 들어가짐
      */
      const movieUpdateFields = {
        ...movieRest,
        ...(newDirector && { director: newDirector })
      }
  
      await qr.manager.createQueryBuilder()
        .update(Movie)
        .set(movieUpdateFields)
        .where('id = :id', { id })
        .execute()
  
      // await this.movieRepository.update(
      //   { id },
      //   movieUpdateFields, //update된 값을 반환하지 않기에 또 findone을 사용해서 가져와야한다.
      // );
  
      if (detail) {
        await qr.manager.createQueryBuilder()
          .update(MovieDetail)
          .set({
            detail,
          })
          .where('id=:id', { id: movie.detail.id })
          .execute();
  
  
        // await this.movieDetailRepository.update(
        //   {
        //     id: movie.detail.id,
        //   },
        //   {
        //     detail,
        //   }
        //  )
  
      }
      if (newGenres) {
        await qr.manager.createQueryBuilder()
          .relation(Movie, 'genres')
          .of(id)
          .addAndRemove(newGenres.map(genre => genre.id), movie.genres.map(genre => genre.id));//첫번째꺼는 새로 추가 아이디 생성, 두번째꺼는 원래 존재하던것 삭제
      }
      // const newMovie = await this.movieRepository.findOne({
      //   where: {
      //     id,
      //   },
      //   relations: ['detail', 'director']
      // })
      // newMovie.genres = newGenres;
  
      // await this.movieRepository.save(newMovie);
  
  

      await qr.commitTransaction();

      return this.movieRepository.findOne({
        where: {
          id,
        },
        relations: ['detail', 'director', 'genres']
      });

    } catch (e) {
      await qr.rollbackTransaction();
      throw e;
    } finally {
      await qr.release();
    }

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

    await this.movieRepository.createQueryBuilder()
      .delete()
      .where('id =:id', { id })
      .execute();

    // await this.movieRepository.delete(id)
    await this.movieDetailRepository.delete(movie.detail.id)

  }

}
