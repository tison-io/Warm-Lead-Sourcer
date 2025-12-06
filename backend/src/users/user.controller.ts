import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { UserService } from './user.service';
import { RegisterUserDto } from './dto/register-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { RequestPasswordResetDto } from './dto/request-password-dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { User } from './user.schema';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() registerUserDto: RegisterUserDto) {
    const user = await this.userService.register(registerUserDto);

    const userObject = user.toObject() as User & { password?: string };
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: userPassword, ...result } = userObject;

    return {
      message: 'User registered successfully',
      user: result,
    };
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginUserDto: LoginUserDto) {
    const result = await this.userService.login(loginUserDto);

    return {
      message: 'Login successful',
      ...result,
    };
  }

  @Post('request-password-reset')
  @HttpCode(HttpStatus.OK)
  async requestPasswordReset(
    @Body() requestPasswordResetDto: RequestPasswordResetDto,
  ) {
    return await this.userService.requestPasswordReset(requestPasswordResetDto);
  }

  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    return await this.userService.resetPassword(resetPasswordDto);
  }
}
