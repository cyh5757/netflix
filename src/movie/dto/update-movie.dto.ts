import { Equals, IsAlphanumeric, IsBoolean, IsDefined, IsEmpty, IsEnum, IsIn, IsNotEmpty, IsNumber, IsOptional, IsPositive, IsUUID, registerDecorator, Validate, ValidationArguments, ValidationOptions, ValidatorConstraint, ValidatorConstraintInterface } from "class-validator";

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
    

}