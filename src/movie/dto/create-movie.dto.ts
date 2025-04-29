import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ArrayNotEmpty, IsArray, IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateMovieDto {
    @IsNotEmpty()
    @IsString()
    @ApiProperty({
        description: '영화 제목',
        example: '겨울왕국',
    })
    title: string;

    @IsNotEmpty()
    @IsString()
    @ApiProperty({
        description: '영화 설명',
        example: '3시간 훅',
    })
    detail: string;

    @IsNotEmpty()
    @IsNumber()
    @ApiProperty({
        description: '감독 객체 ID',
        example: '1',
    })
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
    @ApiProperty({
        description: '장르 IDs',
        example: [1,2,3],
    })
    genreIds: number[];


    @IsString()
    @ApiProperty({
        description: '영화 파일 이름',
        example: 'aaa-bbb-ccc-ddd.jpg',
    })
    movieFileName: string; 

}
