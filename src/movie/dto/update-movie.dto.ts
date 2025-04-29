import { ArrayNotEmpty, Equals, IsAlphanumeric, IsArray, IsBoolean, IsDefined, IsEmpty, IsEnum, IsIn, IsNotEmpty, IsNumber, IsOptional, IsPositive, IsString, IsUUID, registerDecorator, Validate, ValidationArguments, ValidationOptions, ValidatorConstraint, ValidatorConstraintInterface } from "class-validator";
import { OneToMany } from "typeorm";
import { Movie } from "../entity/movie.entity";
import { PartialType } from "@nestjs/swagger";
import { CreateMovieDto } from "./create-movie.dto";

export class UpdateMovieDto extends PartialType(CreateMovieDto){}