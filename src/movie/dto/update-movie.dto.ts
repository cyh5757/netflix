import { Equals, IsAlphanumeric, IsBoolean, IsDefined, IsEmpty, IsEnum, IsIn, IsNotEmpty, IsNumber, IsOptional, IsPositive, IsUUID, registerDecorator, Validate, ValidationArguments, ValidationOptions, ValidatorConstraint, ValidatorConstraintInterface } from "class-validator";

enum MovieGenres {
    Fantasy = "fantasy",
    Action = 'action',
}

@ValidatorConstraint({
    async: true, //비동기, 동기 가능함.
})
class PasswordValidator implements ValidatorConstraintInterface{
    validate(value: any, validationArguments?: ValidationArguments): Promise<boolean> | boolean {
        /// 비밀번호 길이는 4-8
        return value.length >4 && value.length < 8;
    }
    defaultMessage?(validationArguments?: ValidationArguments): string {
        return '비밀번호의 길이는 4~8자 이여야합니다. 입력된 비밀번호 : ($value)'
    }



}

function IsPasswordValid(validtionOptions?: ValidationOptions){
    return function(object: Object, propertyName: string){
        registerDecorator({
            target: object.constructor,
            propertyName,
            options: validtionOptions,
            validator: PasswordValidator, //선언한 validator
            
        });
    }
}



export class UpdateMovieDto{

    @IsNotEmpty()
    @IsOptional()
    title?: string;

    @IsNotEmpty()
    @IsOptional()
    genre?: string;
    // 둘 중에 어떤 값이 있을지 모르니까
    
    // /// null || undefined check
    // @IsDefined()

    // /// 특정값과 같아야함
    // @Equals('code factory')

    // // null || undefined check || '' : null이거나 undefined 이거나 '' 빈string 거나
    // @IsEmpty()

    // // 이 리스트 안의 값 중 하나여야 한다. 통제 조건
    // @IsIn(['action', 'fantasy'])

    // // True, False 만 가능. string 값은 안됨. 'true' 불가
    // @IsBoolean()

    // @IsString() : '' 인지
    // @IsNumber() : 숫자인지
    // @IsInt() : 정수인지
    // @IsArray() : 리스트인지
    // @IsEnum() : enum 타입 예시) @IsEnum(MovieGenre) 일발성으로 IsIn과 비슷하지만, 얘는 아님.
    // @IsDateString() : '2024-07-07T12:00:00.000Z' 이런식으로 사용 Z는 UTC 시간, Z 없으면 현재 시간. 날짜와 시간 사이는 T로 파싱
////////////////////////////////////////////////////////////////숫자
    // @IsDivisibleBy(5) : 괄호 안의 수로 나눠질수 있는가?
    // @IsPositive() : 양수인가
    // @IsNegative() : 음수인가
    // @Min(10) : 최소 10이상이여야함
    // @MAX(10) : 최대 10이하여야함 
    //////////////////////////////////////////////////////////////// 문자
    // @Contains('apple') : 담고 있는 string이 있는지
    // @IsAlphanumeric() : '알파벳과 숫자'로만 이뤄져있는냐 대신 공간이 있으면 안됨.
    // @IsCreditCard() : 크래딧카드 처럼 '1234-1234-1234-1234' 같이 4자리인지 확인하고, 맨 앞자리를 확인해서 실제 존재하는 카드인지 확인
    // @IsHexColor() : "FEFEFE" 이런식으로 되어있나?
    // @MaxLength(16) : 최대 길이 제한
    // @MinLength(5) : 최소 길이 제한
    // @IsUUID() : UUID 타입인지
    // @IsLatLong() : 위도 경도 ex) "위도, 경도"
    //////////////////////////////////////////////////////////////// 

    // @Validate(PasswordValidator,{
    //     message: '다른 에러 메세지', //메세지 오버라이드 가능
    // })
    @IsPasswordValid({
        message: '다른 메세지로',
    })
    test: string;

}