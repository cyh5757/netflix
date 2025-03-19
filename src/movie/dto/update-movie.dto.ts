import { ArrayNotEmpty, Equals, IsAlphanumeric, IsArray, IsBoolean, IsDefined, IsEmpty, IsEnum, IsIn, IsNotEmpty, IsNumber, IsOptional, IsPositive, IsString, IsUUID, registerDecorator, Validate, ValidationArguments, ValidationOptions, ValidatorConstraint, ValidatorConstraintInterface } from "class-validator";
import { OneToMany } from "typeorm";
import { Movie } from "../entity/movie.entity";

enum MovieGenres {
    Fantasy = "fantasy",
    Action = 'action',
}

export class UpdateMovieDto{

    @IsNotEmpty()
    @IsString()
    @IsOptional()
    title?: string;


    @IsArray()
    @ArrayNotEmpty()
    @IsNumber({},{
        each: true,
    })
    @IsOptional()
    genreIds?: number[];
    
    @IsNotEmpty()
    @IsString()
    @IsOptional()
    detail?: string;

    @IsNotEmpty()
    @IsNumber()
    @IsOptional()
    directorID?: number;
}