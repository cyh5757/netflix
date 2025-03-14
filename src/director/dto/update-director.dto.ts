import { PartialType } from '@nestjs/mapped-types';
import { CreateDirectorDto } from './create-director.dto';
import { IsDateString, IsNotEmpty } from 'class-validator';
import { OneToMany } from 'typeorm';
import { Movie } from 'src/movie/entity/movie.entity';

export class UpdateDirectorDto {
    @IsNotEmpty()
    name?: string;
    @IsNotEmpty()
    @IsDateString()
    dob?: Date;
    @IsNotEmpty()
    nationality?: string;

    @OneToMany(
        () => Movie,
        movie => movie.director,
    )
    movies: Movie[];

    
}
