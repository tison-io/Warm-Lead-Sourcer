import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: nodemailer.Transporter;

  constructor(private configService: ConfigService) {
    this.initializeTransporter();
  }

  private initializeTransporter() {
    const emailHost = this.configService.get<string>('SMTP_HOST') || 'smtp.gmail.com';
    const emailPort = this.configService.get<number>('SMTP_PORT') || 587;
    const emailUser = this.configService.get<string>('SMTP_USER');
    const emailPassword = this.configService.get<string>('SMTP_PASSWORD');
    const emailFrom = this.configService.get<string>('SMTP_FROM') || emailUser;

    if (!emailUser || !emailPassword) {
      this.logger.warn(
        'Email credentials not configured. Email functionality will be disabled. ' +
        'Please set EMAIL_USER, EMAIL_PASSWORD, and optionally EMAIL_FROM in your .env file.',
      );
      return;
    }

    this.transporter = nodemailer.createTransport({
      host: emailHost,
      port: emailPort,
      secure: emailPort === 465, // true for 465, false for other ports
      auth: {
        user: emailUser,
        pass: emailPassword,
      },
    });

  
    this.transporter.verify((error) => {
      if (error) {
        this.logger.error('Email transporter verification failed:', error);
      } else {
        this.logger.log('Email transporter configured successfully');
      }
    });
  }

  async sendPasswordResetCode(email: string, code: string): Promise<void> {
    if (!this.transporter) {
      this.logger.error('Email transporter not initialized. Cannot send password reset code.');
      throw new Error('Email service is not configured. Please contact support.');
    }

    const emailFrom = this.configService.get<string>('EMAIL_FROM') || this.configService.get<string>('EMAIL_USER');
    const appName = this.configService.get<string>('APP_NAME') || 'WarmLead';

    const mailOptions = {
      from: `"${appName}" <${emailFrom}>`,
      to: email,
      subject: 'Password Reset Code',
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background-color: #f8f9fa; padding: 30px; border-radius: 8px;">
              <h2 style="color: #7c3aed; margin-top: 0;">Password Reset Request</h2>
              <p>You have requested to reset your password for your ${appName} account.</p>
              <p>Your password reset code is:</p>
              <div style="background-color: #ffffff; border: 2px solid #7c3aed; border-radius: 6px; padding: 20px; text-align: center; margin: 20px 0;">
                <h1 style="color: #7c3aed; font-size: 32px; letter-spacing: 8px; margin: 0; font-family: 'Courier New', monospace;">${code}</h1>
              </div>
              <p style="color: #666; font-size: 14px;">This code will expire in 1 hour.</p>
              <p style="color: #666; font-size: 14px;">If you didn't request this password reset, please ignore this email.</p>
              <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
              <p style="color: #999; font-size: 12px; text-align: center;">This is an automated message, please do not reply.</p>
            </div>
          </body>
        </html>
      `,
      text: `
        Password Reset Request
        
        You have requested to reset your password for your ${appName} account.
        
        Your password reset code is: ${code}
        
        This code will expire in 1 hour.
        
        If you didn't request this password reset, please ignore this email.
      `,
    };

    try {
      const info = await this.transporter.sendMail(mailOptions);
      this.logger.log(`Password reset code sent to ${email}. MessageId: ${info.messageId}`);
    } catch (error) {
      this.logger.error(`Failed to send password reset code to ${email}:`, error);
      throw new Error('Failed to send password reset email. Please try again later.');
    }
  }
}
