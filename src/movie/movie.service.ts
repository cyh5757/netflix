import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { CreateMovieDto } from './dto/create-movie.dto';
import { UpdateMovieDto } from './dto/update-movie.dto';
import { Movie } from './entity/movie.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, In, Like, QueryRunner, Repository } from 'typeorm';
import { MovieDetail } from './entity/movie-dtail.entity';
import { Director } from 'src/director/entity/director.entity';
import { Genre } from 'src/genre/entities/genre.entity';
import { GetMoivesDto } from './dto/get-movies.dto';
import { CommonService } from 'src/common/common.service';
import { join } from 'path';
import { rename } from 'fs/promises'
import { User } from 'src/user/entities/user.entity';
import { MovieUserLike } from './entity/movie-user-like.entity';


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
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(MovieUserLike)
    private readonly movieUserLikeRepository: Repository<MovieUserLike>,


    private readonly dataSource: DataSource,
    private readonly commonService: CommonService,


  ) { }

  async findAll(dto?: GetMoivesDto, userId?: number) {
    const { title } = dto;
    const qb = await this.movieRepository.createQueryBuilder('movie')
      .leftJoinAndSelect('movie.director', 'director')
      .leftJoinAndSelect('movie.genres', 'genres');

    if (title) {
      qb.where('movie.title LIKE :title', { title: `%${title}%` })
    }

    // this.commonService.applyPagePaginationParamsToQb(qb,dto);
    const { nextCursor } = await this.commonService.applyCursorPaginationParamsToQb(qb, dto)

    let [data, count] = await qb.getManyAndCount();
    if (userId) {
      const movieIds = data.map(movie => movie.id);
      const likedMovies = movieIds.length < 1 ? [] : await this.movieUserLikeRepository.createQueryBuilder('mul')
        .leftJoinAndSelect('mul.user', 'user')
        .leftJoinAndSelect('mul.movie', 'movie')
        .where('movie.id IN(:...movieIds)', { movieIds })
        .andWhere('user.id= :userId', { userId })
        .getMany();

      /**
       * {
       *  movieId: boolean
       * }
       */
      const likedMovieMap = likedMovies.reduce((acc, next) => ({
        ...acc,
        [next.movie.id]: next.isLike,
      }), {});

      data = data.map((x) => ({
        ...x,
        /// null || true || false
        likeStatus: x.id in likedMovieMap ? likedMovieMap[x.id] : null,
      }));

    }

    return {
      data,
      nextCursor,
      count,
    }
  }
  async findOne(id: number) {
    const movie = await this.movieRepository.createQueryBuilder('movie')
      .leftJoinAndSelect('movie.director', 'director')
      .leftJoinAndSelect('movie.genres', 'genres')
      .leftJoinAndSelect('movie.detail', 'detail')
      .leftJoinAndSelect('movie.creator', 'creator')
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
  async create(createMovieDto: CreateMovieDto, userId: number, qr: QueryRunner) {
    //create는 객체만 생성, save를 사용해야 저장
    // const movieDetail = await this.movieDetailRepository.save({
    //   detail: createMovieDto.detail,
    // })

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

    const movieFolder = join('public', 'movie');

    const tempFolder = join('public', 'temp');






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
        creator: {
          id: userId,
        },
        //manytomany는 안된다. 따로 해야한다
        movieFilePath: join(movieFolder, createMovieDto.movieFileName),
      })
      .execute();

    const movieId = movie.identifiers[0].id;

    await qr.manager.createQueryBuilder()
      .relation(Movie, 'genres')
      .of(movieId)
      .add(genres.map(genre => genre.id))

    await rename(
      join(process.cwd(), tempFolder, createMovieDto.movieFileName),
      join(process.cwd(), movieFolder, createMovieDto.movieFileName),
    )

    return await qr.manager.findOne(Movie, {
      where: {
        id: movieId,
      },
      relations: ['detail', 'director', 'genres']
    });
  }

  async update(id: number, updateMovieDto: UpdateMovieDto) {
    const qr = this.dataSource.createQueryRunner();
    await qr.connect();
    await qr.startTransaction();


    try {
      const movie = await qr.manager.findOne(Movie, {
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
        const director = await qr.manager.findOne(Director, {
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
        const genres = await qr.manager.find(Genre, {
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

  async toggleMovieLike(
    movieId: number, userId: number, isLike: boolean
  ) {
    const movie = await this.movieRepository.findOne({
      where: {
        id: movieId,
      }
    });

    if (!movie) {
      throw new BadRequestException('존재하지 않는 영화입니다!')
    }
    const user = await this.userRepository.findOne({
      where: {
        id: userId,
      }
    });

    if (!user) {
      throw new UnauthorizedException('사용자 정보가 없습니다!')
    }

    const likeRecord = await this.movieUserLikeRepository.createQueryBuilder('mul')
      .leftJoinAndSelect('mul.movie', 'movie')
      .leftJoinAndSelect('mul.user', 'user')
      .where('movie.id= :movieId', { movieId })
      .andWhere('user.id=:userId', { userId })
      .getOne();

    if (likeRecord) {
      if (isLike === likeRecord.isLike) {
        await this.movieUserLikeRepository.delete({
          movie,
          user,
        });
      } else {
        await this.movieUserLikeRepository.update({
          movie,
          user,
        }, {
          isLike,
        })
      }
    } else {
      await this.movieUserLikeRepository.save({
        movie,
        user,
        isLike,
      })
    }


    const result = await this.movieUserLikeRepository.createQueryBuilder('mul')
      .leftJoinAndSelect('mul.movie', 'movie')
      .leftJoinAndSelect('mul.user', 'user')
      .where('movie.id= :movieId', { movieId })
      .andWhere('user.id=:userId', { userId })
      .getOne();
    return {
      isLike: result && result.isLike,
    }
  }

}
