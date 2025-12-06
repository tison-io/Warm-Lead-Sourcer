import { Controller, Get, Req, UseGuards, Res, Logger } from '@nestjs/common';
import type { Response, Request } from 'express';
import { GoogleAuthGuard } from './guards/google-auth.guard';
import { UserService } from './user.service';

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

  constructor(private readonly userService: UserService) {}

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
  ) {
    try {
      this.logger.log('Google callback received');

      if (!req.user) {
        this.logger.error('No user object in request');
        throw new Error('Authentication failed - no user data');
      }

      this.logger.log(`Processing login for user: ${req.user.email}`);
      const result = await this.userService.googleLogin(req);

      this.logger.log('Login successful, redirecting to frontend');
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
      res.redirect(`${frontendUrl}/auth/success?token=${result.access_token}`);
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
