import { Equals, IsAlphanumeric, IsBoolean, IsDefined, IsEmpty, IsEnum, IsIn, IsNotEmpty, IsNumber, IsOptional, IsPositive, IsUUID, registerDecorator, Validate, ValidationArguments, ValidationOptions, ValidatorConstraint, ValidatorConstraintInterface } from "class-validator";
import { OneToMany } from "typeorm";
import { Movie } from "../entity/movie.entity";

enum MovieGenres {
    Fantasy = "fantasy",
    Action = 'action',
}

export class UpdateMovieDto{

    @IsNotEmpty()
    @IsOptional()
    title?: string;

    @IsNotEmpty()
    @IsOptional()
    genre?: string;
    
    @IsNotEmpty()
    @IsOptional()
    detail?: string;

    @OneToMany(
        () => Movie,
        movie => movie.director,
    )
    movies: Movie[];
}