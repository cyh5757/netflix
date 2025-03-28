import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/user/entities/user.entity';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs'
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { UserModule } from 'src/user/user.module';
@Injectable()
export class AuthService {
    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
        private readonly configService: ConfigService,
        private readonly jwtService: JwtService,
    ){}

    parseBasicToken(
        rawToken: string
    ){
        /// 1) 토큰을 ' '기준으로 스플릿 한 후 토큰 값만 추출하기
        /// split 이후 ["Basic", $token]
        
        const basicSplit = rawToken.split(' ');
        if(basicSplit.length != 2){
            throw new BadRequestException('토큰 포멧이 잘못됐습니다!');
        }
        const [_, token] = basicSplit;
        /// 2) 추출한 토큰을 base64 디코딩해서 이메일과 비밀번호를 나눈다
        const decoded = Buffer.from(token,'base64').toString('utf-8');
        /// email:password
        /// : 값을 기준으로 또 스플릿
        const tokenSplit = decoded.split(':');

        if(tokenSplit.length !=2){
            throw new BadRequestException('토큰 포맷이 잘못됐습니다!')
        }

        const [email,password] = tokenSplit;

        return{
            email,
            password
        }


    }
    /// rawToken -> "Basic $token"
    /// token base64 인코딩되어있음 : 콜론 왼쪽 이메일, 오른쪽 비밀번호
    async register(rawToken: string){
        const {email, password} = this.parseBasicToken(rawToken);
        const user = await this.userRepository.findOne({
            where:{
                email,
            },
        });
        if(user){
            throw new BadRequestException('이미 가입한 이메일 입니다!');
        }

        const hash=await bcrypt.hash(password, this.configService.get<number>('HASH_ROUNDS'))

        await this.userRepository.save({
            email,
            password: hash,
        })
        return this.userRepository.findOne({
            where:{
                email,
            },
        });
    }

    async authenticate(email: string, password: string){
        const user = await this.userRepository.findOne({
            where:{
                email,
            },
        });
        if(!user){
            throw new BadRequestException('잘못된 로그 정보입니다.');
        }

        const passOK = await bcrypt.compare(password, user.password);

        if(!passOK){
            throw new BadRequestException('비밀번호가 틀립니다.');
        }
        return user;
    }

    async login(rawToken: string) {
        const {email, password} = this.parseBasicToken(rawToken);
        
        const user = await this.authenticate(email, password);
        const refreshTokenSecret = this.configService.get<string>('REFRESH_TOKEN_SECRET');
        const accessTokenSecret = this.configService.get<string>('ACCESS_TOKEN_SECRET');


        return {
            refreshToken: await this.jwtService.signAsync({
                sub: user.id,
                role: user.role,
                type: 'refresh',
            },{
                secret: refreshTokenSecret,
                expiresIn: '24h'
            }),

            accessToken: await this.jwtService.signAsync({
                sub: user.id,
                role: user.role,
                type: 'access'
            },{
                secret: accessTokenSecret,
                expiresIn: 300
            }),
        }
    }

    
}
