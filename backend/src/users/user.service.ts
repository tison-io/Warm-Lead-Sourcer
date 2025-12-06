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
import * as crypto from 'crypto';
import { User, UserDocument } from './user.schema';
import { RegisterUserDto } from './dto/register-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { RequestPasswordResetDto } from './dto/request-password-dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { EmailService } from './email.service';

// Define proper types for authentication
interface AuthenticatedUser {
  email: string;
  firstName: string;
  lastName: string;
  picture?: string;
}

interface AuthRequest {
  user: AuthenticatedUser;
}

interface LoginResponse {
  access_token: string;
  user: Partial<User>;
}

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private jwtService: JwtService,
    private emailService: EmailService,
  ) {}

  async register(registerUserDto: RegisterUserDto): Promise<User> {
    const { firstName, lastName, email, password, confirmPassword } =
      registerUserDto;

    // if passwords match
    if (password !== confirmPassword) {
      throw new BadRequestException('Passwords do not match');
    }

    // if user already exists
    const existingUser = await this.userModel.findOne({
      email: email.toLowerCase(),
    });
    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // Hash the password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create new user
    const newUser = new this.userModel({
      firstName,
      lastName,
      email: email.toLowerCase(),
      password: hashedPassword,
    });

    return await newUser.save();
  }

  async findByEmail(email: string): Promise<User | null> {
    return await this.userModel.findOne({ email: email.toLowerCase() });
  }

  async findById(id: string): Promise<User | null> {
    return await this.userModel.findById(id);
  }

  async login(loginUserDto: LoginUserDto): Promise<LoginResponse> {
    const { email, password } = loginUserDto;

    // Find user by email
    const user = await this.userModel.findOne({ email: email.toLowerCase() });
    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    // Generate JWT token
    const payload = { sub: user._id, email: user.email };
    const access_token = await this.jwtService.signAsync(payload);

    // Return token and user info (without password)
    const userObject = user.toObject() as User & { password?: string };
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: loginPassword, ...userWithoutPassword } = userObject;

    return {
      access_token,
      user: userWithoutPassword,
    };
  }

  async googleLogin(req: AuthRequest): Promise<LoginResponse> {
    if (!req.user) {
      throw new BadRequestException('No user from Google');
    }

    const { email, firstName, lastName, picture } = req.user;

    // Check if user exists
    let user = await this.userModel.findOne({
      email: email?.toLowerCase() || '',
    });

    if (!user) {
      // Create new user from Google profile
      user = new this.userModel({
        email: email?.toLowerCase() || '',
        firstName: firstName || '',
        lastName: lastName || '',
        provider: 'google',
        picture,
      });
      await user.save();
    } else {
      // Update existing user with Google info if needed
      if (!user.picture && picture) {
        user.picture = picture;
        await user.save();
      }
    }

    // Generate JWT token
    const payload = { sub: user._id, email: user.email };
    const access_token = await this.jwtService.signAsync(payload);

    // Return token and user info (without password)
    const userObject = user.toObject() as User & { password?: string };
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: googlePassword, ...userWithoutPassword } = userObject;

    return {
      access_token,
      user: userWithoutPassword,
    };
  }

  async requestPasswordReset(
    requestPasswordResetDto: RequestPasswordResetDto,
  ): Promise<{ message: string }> {
    const { email } = requestPasswordResetDto;

    // Find user by email
    const user = await this.userModel.findOne({ email: email.toLowerCase() });

    if (!user) {
      // Don't reveal if user exists or not (security best practice)
      return {
        message:
          'If a user with that email exists, a password reset link has been sent.',
      };
    }

    // Check if user signed up with OAuth (no password)
    if (user.provider !== 'local') {
      throw new BadRequestException(
        `This account was created using ${user.provider}. Please use ${user.provider} to sign in.`,
      );
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');

    // Set token and expiry (1 hour)
    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpires = new Date(Date.now() + 3600000); // 1 hour
    await user.save();

    // Send email
    await this.emailService.sendPasswordResetEmail(user.email, resetToken);

    return {
      message:
        'If a user with that email exists, a password reset link has been sent.',
    };
  }

  async resetPassword(
    resetPasswordDto: ResetPasswordDto,
  ): Promise<{ message: string }> {
    const { token, newPassword, confirmPassword } = resetPasswordDto;

    // Check if passwords match
    if (newPassword !== confirmPassword) {
      throw new BadRequestException('Passwords do not match');
    }

    // Hash the token to compare with stored hash
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    // Find user with valid token and not expired
    const user = await this.userModel.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: new Date() },
    });

    if (!user) {
      throw new BadRequestException('Invalid or expired reset token');
    }

    // Hash new password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

    // Update password and clear reset token
    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    return {
      message:
        'Password has been reset successfully. You can now log in with your new password.',
    };
  }
}
