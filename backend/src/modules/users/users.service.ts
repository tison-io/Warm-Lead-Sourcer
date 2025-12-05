import {
  Injectable,
  BadRequestException,
  ConflictException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { JwtService } from '@nestjs/jwt';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { User, UserDocument } from './schemas/user.schema';
import { RegisterUserDto } from './dto/register-user.dto';
import { LoginUserDto } from './dto/login-user.dto';

export interface LoginResponse {
  access_token: string;
  user: Partial<User>;
}

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private jwtService: JwtService,
  ) {}

  async register(registerUserDto: RegisterUserDto): Promise<User> {
    const { firstName, lastName, email, password, confirmPassword } =
      registerUserDto;

    if (password !== confirmPassword) {
      throw new BadRequestException('Passwords do not match');
    }

    const existingUser = await this.userModel.findOne({
      email: email.toLowerCase(),
    });
    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const newUser = new this.userModel({
      firstName,
      lastName,
      email: email.toLowerCase(),
      password: hashedPassword,
    });

    return await newUser.save();
  }

  async login(loginUserDto: LoginUserDto): Promise<LoginResponse> {
    const { email, password } = loginUserDto;

    const user = await this.userModel.findOne({ email: email.toLowerCase() });
    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const payload = { sub: user._id, email: user.email };
    const access_token = await this.jwtService.signAsync(payload);

    const userObj = user.toObject();
    const { password: _, ...userWithoutPassword } = userObj;

    return {
      access_token,
      user: userWithoutPassword,
    };
  }

  async findById(id: string): Promise<User | null> {
    return await this.userModel.findById(id);
  }

  async findByEmail(email: string): Promise<User | null> {
    return await this.userModel.findOne({ email: email.toLowerCase() });
  }
}
