import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as SibApiV3Sdk from 'sib-api-v3-sdk';

/**
 * Email service using Brevo (formerly Sendinblue) for transactional emails
 * Handles email verification and password reset emails
 */
@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private apiInstance: any;

  constructor(private configService: ConfigService) {
    this.initializeBrevo();
  }

  /**
   * Initialize Brevo API client with API key from environment
   */
  private initializeBrevo() {
    const apiKey = this.configService.get<string>('BREVO_API_KEY');

    if (!apiKey) {
      this.logger.warn(
        'Brevo API key not configured. Email functionality will be disabled.',
      );
      return;
    }

    const defaultClient = SibApiV3Sdk.ApiClient.instance;
    const apiKeyAuth = defaultClient.authentications['api-key'];
    apiKeyAuth.apiKey = apiKey;
    this.apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();

    this.logger.log('Brevo email service initialized successfully');
  }

  /**
   * Send email verification code to user
   * @param email - User's email address
   * @param code - 6-digit verification code
   */
  async sendEmailVerification(email: string, code: string): Promise<void> {
    if (!this.apiInstance) {
      this.logger.error('Brevo API not initialized.');
      throw new Error('Email service is not configured.');
    }

    const fromEmail = this.configService.get<string>('BREVO_FROM_EMAIL');
    const fromName =
      this.configService.get<string>('BREVO_FROM_NAME') || 'Warm Lead Sourcer';

    const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();
    sendSmtpEmail.sender = { name: fromName, email: fromEmail };
    sendSmtpEmail.to = [{ email }];
    sendSmtpEmail.subject = 'Verify Your Email';
    sendSmtpEmail.htmlContent = `
      <!DOCTYPE html>
      <html>
        <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background-color: #f8f9fa; padding: 30px; border-radius: 8px;">
            <h2 style="color: #7c3aed;">Welcome to ${fromName}!</h2>
            <p>Please verify your email address with this code:</p>
            <div style="background-color: #fff; border: 2px solid #7c3aed; border-radius: 6px; padding: 20px; text-align: center; margin: 20px 0;">
              <h1 style="color: #7c3aed; font-size: 32px; letter-spacing: 8px; margin: 0;">${code}</h1>
            </div>
            <p style="color: #666; font-size: 14px;">This code will expire in 1 hour.</p>
          </div>
        </body>
      </html>
    `;

    try {
      await this.apiInstance.sendTransacEmail(sendSmtpEmail);
      this.logger.log(`Verification email sent to ${email}`);
    } catch (error: unknown) {
      this.logger.error(
        `Failed to send verification email to ${email}:`,
        (error as any)?.response?.body || (error as Error)?.message || error,
      );
      throw new Error('Failed to send verification email.');
    }
  }

  /**
   * Send password reset code to user
   * @param email - User's email address
   * @param code - 6-digit reset code
   */
  async sendPasswordResetCode(email: string, code: string): Promise<void> {
    if (!this.apiInstance) {
      this.logger.error(
        'Brevo API not initialized. Cannot send password reset code.',
      );
      throw new Error(
        'Email service is not configured. Please contact support.',
      );
    }

    const fromEmail = this.configService.get<string>('BREVO_FROM_EMAIL');
    const fromName =
      this.configService.get<string>('BREVO_FROM_NAME') || 'Warm Lead Sourcer';

    const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();
    sendSmtpEmail.sender = { name: fromName, email: fromEmail };
    sendSmtpEmail.to = [{ email }];
    sendSmtpEmail.subject = 'Password Reset Code';
    sendSmtpEmail.htmlContent = `
      <!DOCTYPE html>
      <html>
        <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background-color: #f8f9fa; padding: 30px; border-radius: 8px;">
            <h2 style="color: #7c3aed;">Password Reset Request</h2>
            <p>You have requested to reset your password for your ${fromName} account.</p>
            <p>Your password reset code is:</p>
            <div style="background-color: #fff; border: 2px solid #7c3aed; border-radius: 6px; padding: 20px; text-align: center; margin: 20px 0;">
              <h1 style="color: #7c3aed; font-size: 32px; letter-spacing: 8px; margin: 0;">${code}</h1>
            </div>
            <p style="color: #666; font-size: 14px;">This code will expire in 1 hour.</p>
            <p style="color: #666; font-size: 14px;">If you didn't request this password reset, please ignore this email.</p>
          </div>
        </body>
      </html>
    `;

    try {
      await this.apiInstance.sendTransacEmail(sendSmtpEmail);
      this.logger.log(`Password reset code sent to ${email}`);
    } catch (error: unknown) {
      this.logger.error(
        `Failed to send password reset code to ${email}:`,
        (error as any)?.response?.body || (error as Error)?.message || error,
      );
      throw new Error(
        'Failed to send password reset email. Please try again later.',
      );
    }
  }
}
