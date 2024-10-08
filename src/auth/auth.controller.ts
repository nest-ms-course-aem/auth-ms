import { Controller, Get } from '@nestjs/common';
import { AuthService } from './auth.service';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { RegisterUserDto } from './dto/register-user.dto';
import { LoginUserDto } from './dto/login-user.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @MessagePattern('auth.register.user')
  registerUser(@Payload() registerUserDto:  RegisterUserDto){
    // return registerUserDto;
    return this.authService.registerUser(registerUserDto);
  }

  @MessagePattern('auth.login.user')
  loginUser(@Payload() loginUserDto: LoginUserDto){
    // return loginUserDto;
    return this.authService.loginUser(loginUserDto);
  } 

  @MessagePattern('auth.verify.user')
  verifyUser(@Payload() token: string){
    return this.authService.verifyUser(token);
  }

}
