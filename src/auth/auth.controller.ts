import { Controller, Post,Headers } from '@nestjs/common';
import { AuthService } from './auth.service';

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
}
