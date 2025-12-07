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
import { EmailService } from '../email/email.service';

export interface LoginResponse {
  access_token: string;
  refresh_token: string;
  user: Partial<User>;
}

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private jwtService: JwtService,
    private emailService: EmailService,
  ) {}

  async register(registerUserDto: RegisterUserDto): Promise<LoginResponse> {
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

    const savedUser = await newUser.save();

   
    const payload = { sub: savedUser._id, email: savedUser.email };
    const access_token = await this.jwtService.signAsync(payload, { expiresIn: '15m' });
    const refresh_token = await this.jwtService.signAsync(payload, { expiresIn: '7d' });

    await this.userModel.findByIdAndUpdate(savedUser._id, { refreshToken: refresh_token });

    const userObj = savedUser.toObject();
    const { password: _, refreshToken: __, ...userWithoutPassword } = userObj;

    return {
      access_token,
      refresh_token,
      user: userWithoutPassword,
    };
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
    const access_token = await this.jwtService.signAsync(payload, { expiresIn: '15m' });
    const refresh_token = await this.jwtService.signAsync(payload, { expiresIn: '7d' });

    // Store refresh token in database
    await this.userModel.findByIdAndUpdate(user._id, { refreshToken: refresh_token });

    const userObj = user.toObject();
    const { password: _, refreshToken: __, ...userWithoutPassword } = userObj;

    return {
      access_token,
      refresh_token,
      user: userWithoutPassword,
    };
  }

  async findById(id: string): Promise<UserDocument | null> {
    return await this.userModel.findById(id);
  }

  async findByEmail(email: string): Promise<User | null> {
    return await this.userModel.findOne({ email: email.toLowerCase() });
  }

  async loginOrRegisterWithGoogle(
    email: string,
    firstName: string,
    lastName: string,
  ): Promise<LoginResponse> {
    const normalizedEmail = email.toLowerCase();
    
    // Check if user exists
    let user = await this.userModel.findOne({ email: normalizedEmail });
    
    if (!user) {
      // Create new user for Google OAuth (no password required)
      user = new this.userModel({
        firstName,
        lastName,
        email: normalizedEmail,
        password: '', // Google OAuth users don't need a password
        provider: 'google',
      });
      await user.save();
    } else {
      // Update user info in case it changed in Google
      user.firstName = firstName;
      user.lastName = lastName;
      user.provider = 'google';
      await user.save();
    }

    // Generate JWT tokens
    const payload = { sub: user._id.toString(), email: user.email };
    const access_token = await this.jwtService.signAsync(payload, { expiresIn: '15m' });
    const refresh_token = await this.jwtService.signAsync(payload, { expiresIn: '7d' });

    // Store refresh token
    await this.userModel.findByIdAndUpdate(user._id, { refreshToken: refresh_token });

    const userObj = user.toObject();
    const { password: _, refreshToken: __, ...userWithoutPassword } = userObj;

    return {
      access_token,
      refresh_token,
      user: userWithoutPassword,
    };
  }

  async refreshAccessToken(refreshToken: string): Promise<{ access_token: string }> {
    try {
      const payload = await this.jwtService.verifyAsync(refreshToken);
      const user = await this.userModel.findById(payload.sub);

      if (!user || user.refreshToken !== refreshToken) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      const newPayload = { sub: user._id, email: user.email };
      const access_token = await this.jwtService.signAsync(newPayload, { expiresIn: '15m' });

      return { access_token };
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
  }

  async forgotPassword(email: string): Promise<{ message: string }> {
    const user = await this.userModel.findOne({ email: email.toLowerCase() });
    if (!user) {
      // Don't reveal if email exists
      return { message: 'If the email exists, a reset link has been sent' };
    }

    // Generate reset token (6 digit code)
    const resetToken = Math.floor(100000 + Math.random() * 900000).toString();
    const hashedToken = await bcrypt.hash(resetToken, 10);

    // Token expires in 1 hour
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1);

    await this.userModel.findByIdAndUpdate(user._id, {
      resetPasswordToken: hashedToken,
      resetPasswordExpires: expiresAt,
    });

    // Send email with resetToken (not hashedToken)
    try {
      await this.emailService.sendPasswordResetCode(user.email, resetToken);
    } catch (error) {
      // Log error but don't reveal to user for security
      console.error('Failed to send password reset email:', error);
      // Still return success message to prevent email enumeration
    }

    return { message: 'If the email exists, a reset link has been sent' };
  }

  async resetPassword(token: string, newPassword: string): Promise<{ message: string }> {
    // Find users with valid reset tokens
    const users = await this.userModel.find({
      resetPasswordExpires: { $gt: new Date() },
      resetPasswordToken: { $exists: true, $ne: null },
    }).select('+resetPasswordToken');

    if (users.length === 0) {
      throw new BadRequestException('Invalid or expired reset token');
    }

    // Find matching user by comparing hashed tokens
    let matchedUser: UserDocument | null = null;
    for (const user of users) {
      if (user.resetPasswordToken) {
        const isValid = await bcrypt.compare(token, user.resetPasswordToken);
        if (isValid) {
          matchedUser = user;
          break;
        }
      }
    }

    if (!matchedUser) {
      throw new BadRequestException('Invalid or expired reset token');
    }

    // Hash new password and update user
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await this.userModel.findByIdAndUpdate(matchedUser._id, {
      password: hashedPassword,
      resetPasswordToken: null,
      resetPasswordExpires: null,
    });

    return { message: 'Password has been reset successfully' };
  }
}
