import { Type } from 'class-transformer';
import { ArrayNotEmpty, IsArray, IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateMovieDto {
    @IsNotEmpty()
    @IsString()
    title: string;

    @IsNotEmpty()
    @IsString()
    detail: string;

    @IsNotEmpty()
    @IsNumber()
    directorID: number;

    //
    @IsArray()
    @ArrayNotEmpty()
    //Isnumber 첫번째 공란은 isnumber의 고유의 옵션
    //두번째 validation옵션 리스트안의 값들을 각각 검증
    @IsNumber({},{
        each: true,
    })
    @Type(()=>Number)
    genreIds: number[];


    @IsString()
    movieFileName: string; 

}
