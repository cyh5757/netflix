import { createParamDecorator, ExecutionContext, InternalServerErrorException } from "@nestjs/common";

export const QueryRunner = createParamDecorator(
    (data: any, context: ExecutionContext)=>{
        const request = context.switchToHttp().getRequest();

        if(!request || !request.queryRunner){
            /// 쿼리러너가 없을때는 server 문제다
            throw new InternalServerErrorException('Query Runner 객체를 찾을 수 없습니다.')

        }
        return request.queryRunner;
    }

);