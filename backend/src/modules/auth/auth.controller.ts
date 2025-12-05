import { Controller, Get, Req, UseGuards, Res, Logger } from '@nestjs/common';
import type { Response, Request } from 'express';
import { GoogleAuthGuard } from './guards/google-auth.guard';

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

  @Get('google')
  @UseGuards(GoogleAuthGuard)
  googleAuth(): void {
    // Initiates the Google OAuth2 login flow
    this.logger.log('Google OAuth flow initiated');
  }

  @Get('google/callback')
  @UseGuards(GoogleAuthGuard)
  googleAuthRedirect(
    @Req() req: AuthenticatedRequest,
    @Res() res: Response,
  ): void {
    try {
      this.logger.log('Google callback received');

      if (!req.user) {
        this.logger.error('No user object in request');
        throw new Error('Authentication failed - no user data');
      }

      this.logger.log(`Processing login for user: ${req.user.email}`);

      // TODO: Inject UserService properly
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
      res.redirect(
        `${frontendUrl}/auth/success?user=${encodeURIComponent(JSON.stringify(req.user))}`,
      );
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
