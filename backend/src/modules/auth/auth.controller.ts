import { Controller, Get, Req, UseGuards, Res, Logger, Inject, forwardRef } from '@nestjs/common';
import type { Response, Request } from 'express';
import { GoogleAuthGuard } from './guards/google-auth.guard';
import { UsersService } from '../users/users.service';

// Define proper types for authenticated request
interface AuthenticatedRequest extends Request {
  user: {
    email: string;
    firstName: string;
    lastName: string;
    picture?: string;
  };
}

@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(
    @Inject(forwardRef(() => UsersService))
    private readonly usersService: UsersService,
  ) {}

  @Get('google')
  @UseGuards(GoogleAuthGuard)
  googleAuth(): void {
    // Initiates the Google OAuth2 login flow
    this.logger.log('Google OAuth flow initiated');
  }

  @Get('google/callback')
  @UseGuards(GoogleAuthGuard)
  async googleAuthRedirect(
    @Req() req: AuthenticatedRequest,
    @Res() res: Response,
  ): Promise<void> {
    try {
      this.logger.log('Google callback received');

      if (!req.user) {
        this.logger.error('No user object in request');
        throw new Error('Authentication failed - no user data');
      }

      this.logger.log(`Processing login for user: ${req.user.email}`);

      // Login or register user with Google OAuth
      const result = await this.usersService.loginOrRegisterWithGoogle(
        req.user.email,
        req.user.firstName,
        req.user.lastName,
      );

      // Set JWT cookies
      res.cookie('access_token', result.access_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 15 * 60 * 1000, // 15 minutes
      });
      
      res.cookie('refresh_token', result.refresh_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      // Redirect to frontend dashboard
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
      res.redirect(`${frontendUrl}/input-url`);
    } catch (error) {
      this.logger.error('Google OAuth error:', error);
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
      const errorMessage = encodeURIComponent(
        (error as Error).message || 'Authentication failed',
      );
      res.redirect(`${frontendUrl}/auth/error?message=${errorMessage}`);
    }
  }
}
