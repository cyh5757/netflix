import { PartialType } from '@nestjs/mapped-types';
import { CreateDirectorDto } from './create-director.dto';
import { IsDateString, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { OneToMany } from 'typeorm';
import { Movie } from 'src/movie/entity/movie.entity';

export class UpdateDirectorDto extends PartialType(CreateDirectorDto){}
