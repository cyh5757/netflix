import { IsInt, IsOptional, IsString } from "class-validator";
import { CursorPaginationDto } from "src/common/dto/cursor-pagination.dto";

export class GetMoivesDto extends CursorPaginationDto{
    
    @IsString()
    @IsOptional()
    title?: string;
    

}