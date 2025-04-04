import { BadRequestException, Injectable, NestMiddleware, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import { NextFunction, Request, Response } from "express";
import { envVariableKeys } from "src/common/const/env.const";

@Injectable()
export class BearerTokenMiddleware implements NestMiddleware {
    constructor(
        private readonly jwtService: JwtService,
        private readonly configService: ConfigService    
    ){

    }
    async use(req: Request, res: Response, next: NextFunction) {

        /// Basic $token
        /// Bearer $token
        const authHeader = req.headers['authorization'];

        if (!authHeader) {
            /// 다음으로 가라 라는 뜻
            next();
            return
        }

        //decode는 검증은 안하고, payload만 가져옴
        //verifyAsync 는 검증도 함
        



        try {

            const token = this.validateBearerToken(authHeader);
            const decodedPayload = this.jwtService.decode(token);

            if(decodedPayload.type !=='refresh' && decodedPayload.type !== 'access'){
                throw new UnauthorizedException('잘못된 토큰입니다!')
            }
            const secretKey = decodedPayload.type === 'refresh' ? 
            envVariableKeys.refreshTokenSecret :
            envVariableKeys.accessTokenSecret;

            const payload = await this.jwtService.verifyAsync(token, {
                secret: this.configService.get<string>(
                    secretKey,
                ),
            });
            const isRefreshToken = payload.type ==='refresh';
            if (isRefreshToken) {
                if (payload.type !== 'refresh') {
                    throw new BadRequestException('Refresh 토큰을 입력 해주세요!');
                }
            } else {
                if (payload.type !== 'access') {
                    throw new BadRequestException('Access 토큰을 입력 해주세요!')
                }
            }

            req.user = payload;
            next();

        } catch (e) {
            ///token 만료시 프론트에도 알려줘야함
            if(e.name === 'TokenExpiredError'){
                throw new UnauthorizedException('토큰이 만료됐습니다.')
            }
                        
            //login, register에서 decorator를 기준으로 public 뚫었지만,
            //token이 필요없는데도, token 만료와 상관없이 지나가야해서 next()
            next();

        }



    }
    validateBearerToken(rawToken: string){
        const basicSplit = rawToken.split(' ');
        if (basicSplit.length != 2) {
            throw new BadRequestException('토큰 포멧이 잘못됐습니다!');
        }
        const [bearer, token] = basicSplit;
        if (bearer.toLowerCase() != 'bearer') {
            throw new BadRequestException('토큰 포멧이 잘못됐습니다!');
        }
        return token;
    }

}