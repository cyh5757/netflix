import { Controller, Post, Headers, Request, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthGuard } from '@nestjs/passport';
import { LocalAuthGuard } from './strategy/local.strategy';

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

  //AuthGuard 안의 이름은 strategy 이름 선언
  //AuthGuard 안의 이름이 잘못 오타 낼수 있으니 이렇게 사용
  @UseGuards(LocalAuthGuard)
  @Post('login/passport')
  loginUserPassport(@Request() req){
    return req.user;
  }
}
