import { PartialType } from '@nestjs/mapped-types';
import { CreateDirectorDto } from './create-director.dto';
import { IsDateString, IsNotEmpty, IsOptional } from 'class-validator';
import { OneToMany } from 'typeorm';
import { Movie } from 'src/movie/entity/movie.entity';

export class UpdateDirectorDto {
    @IsNotEmpty()
    @IsOptional()
    name?: string;
    @IsNotEmpty()
    @IsDateString()
    @IsOptional()
    dob?: Date;
    @IsNotEmpty()
    @IsOptional()
    nationality?: string;

    
}
