import { Controller, Post, Body } from '@nestjs/common';
import { UsersService, LoginResponse } from './users.service';
import { RegisterUserDto } from './dto/register-user.dto';
import { LoginUserDto } from './dto/login-user.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('register')
  async register(@Body() registerUserDto: RegisterUserDto) {
    const user = await this.usersService.register(registerUserDto);
    const userObj = (user as any).toObject();
    const { password, ...userWithoutPassword } = userObj;
    return userWithoutPassword;
  }

  @Post('login')
  async login(@Body() loginUserDto: LoginUserDto): Promise<LoginResponse> {
    return this.usersService.login(loginUserDto);
  }
}
