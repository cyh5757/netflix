import { ApiProperty } from "@nestjs/swagger";
import { IsInt, IsOptional, IsString } from "class-validator";
import { CursorPaginationDto } from "src/common/dto/cursor-pagination.dto";

export class GetMoivesDto extends CursorPaginationDto{
    
    @IsString()
    @IsOptional()
    @ApiProperty({
        description: '영화의 제목',
        example: '프로메테우스',            
    })
    title?: string;
    

}