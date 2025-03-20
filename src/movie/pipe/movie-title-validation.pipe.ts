import { ArgumentMetadata, BadRequestException, Injectable, PipeTransform } from "@nestjs/common";

//Pipe는 injectable 에노테이트 해야한다.
@Injectable()
export class MovieTitleValidationPipe implements PipeTransform<string, string>{
    // <x,y> : 제너릭 각 x,y은 input dtype, output dtype이다.
    transform(value: string, metadata: ArgumentMetadata): string {
        /// 만약에 글자 길이가 2보다 작으면 에러 던지기
        if(value.length <= 2){
            throw new BadRequestException("영화의 제목은 3자 이상 작성해주세요");
        }
        return value;
    }
}