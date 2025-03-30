import { Controller, Post, Headers, Request, UseGuards, Get } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthGuard } from '@nestjs/passport';
import { LocalAuthGuard } from './strategy/local.strategy';
import { JwtAuthGuard } from './strategy/jwt.strategy';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  /// authorization : Basic $token 들어옴
  registerUser(@Headers('authorization') token: string){
    return this.authService.register(token)
  }
  @Post('login')
  loginUser(@Headers('authorization') token: string){
    return this.authService.login(token)
  }
  @Post('token/access')
  async rotateAccessToken(@Headers('authorization') token: string){
    const payload = await this.authService.parseBearerToken(token, true);
 
    return{
      accessToken: await this.authService.issueToken(payload,false)
    }
  }
  //AuthGuard 안의 이름은 strategy 이름 선언
  //AuthGuard 안의 이름이 잘못 오타 낼수 있으니 이렇게 사용
  @UseGuards(LocalAuthGuard)
  @Post('login/passport')
  async loginUserPassport(@Request() req){
    return {
      refreshToken: await this.authService.issueToken(req.user,true),
      accessToken: await this.authService.issueToken(req.user,false),
    };
  }
  @UseGuards(JwtAuthGuard)
  @Get('private')
  async private(@Request() req){
    return req.user;
  }

}
