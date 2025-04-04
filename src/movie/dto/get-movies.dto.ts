import { IsInt, IsOptional, IsString } from "class-validator";
import { PagePaginationDto } from "src/common/dto/page-pagination.dto";

export class GetMoivesDto extends PagePaginationDto{
    
    @IsString()
    @IsOptional()
    title?: string;
    

}