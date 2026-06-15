import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Cron } from '@nestjs/schedule';
import { User, UserDocument } from '../users/schemas/user.schema';
import { Lead, LeadDocument } from '../leads/schemas/lead.schema';
import { Post, PostDocument } from '../posts/schemas/post.schema';

@Injectable()
export class CleanupService {
  private readonly logger = new Logger(CleanupService.name);
  private readonly RETENTION_DAYS = 30;
  private readonly SOFT_DELETE_DAYS = 90; // Hard delete after 90 days of soft delete

  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Lead.name) private leadModel: Model<LeadDocument>,
    @InjectModel(Post.name) private postModel: Model<PostDocument>,
  ) {}

  /** 
   * Runs daily at 2:00 AM to clean up expired PII data
  
   */
  @Cron('0 2 * * *')
  async handleExpiredDataCleanup() {
    this.logger.log('Starting daily PII data cleanup...');
    const startTime = Date.now();

    try {
      // Soft delete expired data
      await Promise.all([
        this.softDeleteExpiredUsers(),
        this.softDeleteExpiredLeads(),
        this.softDeleteExpiredPosts(),
      ]);

      // Hard delete old soft-deleted data
      await Promise.all([
        this.hardDeleteOldUsers(),
        this.hardDeleteOldLeads(),
        this.hardDeleteOldPosts(),
      ]);

      const duration = Date.now() - startTime;
      this.logger.log(
        `PII data cleanup completed successfully in ${duration}ms`,
      );
    } catch (error) {
      this.logger.error('Error during PII data cleanup:', error);
    }
  }

  /**
   * Soft delete users that have expired (expiresAt < now)
   */
  private async softDeleteExpiredUsers(): Promise<void> {
    const expirationDate = new Date();
    expirationDate.setDate(expirationDate.getDate() - this.RETENTION_DAYS);

    const result = await this.userModel.updateMany(
      {
        expiresAt: { $lt: new Date() },
        deletedAt: { $exists: false },
      },
      {
        $set: {
          deletedAt: new Date(),
          // Anonymize PII data
          firstName: '[Deleted]',
          lastName: '[Deleted]',
          email: `deleted_${Date.now()}@deleted.local`,
          picture: null,
          refreshToken: null,
          resetPasswordToken: null,
          resetPasswordExpires: null,
        },
      },
    );

    if (result.modifiedCount > 0) {
      this.logger.log(`Soft deleted ${result.modifiedCount} expired user(s)`);
    }
  }

  /**
   * Soft delete leads that have expired
   */
  private async softDeleteExpiredLeads(): Promise<void> {
    const result = await this.leadModel.updateMany(
      {
        expiresAt: { $lt: new Date() },
        deletedAt: { $exists: false },
      },
      {
        $set: {
          deletedAt: new Date(),
          // Anonymize PII data
          name: '[Deleted]',
          headline: null,
          profileUrl: null,
          location: null,
          education: [],
          experience: [],
          guessedEmail: null,
        },
      },
    );

    if (result.modifiedCount > 0) {
      this.logger.log(`Soft deleted ${result.modifiedCount} expired lead(s)`);
    }
  }

  /**
   * Soft delete posts that have expired
   */
  private async softDeleteExpiredPosts(): Promise<void> {
    const result = await this.postModel.updateMany(
      {
        expiresAt: { $lt: new Date() },
        deletedAt: { $exists: false },
      },
      {
        $set: {
          deletedAt: new Date(),
          // Anonymize PII data
          'author.name': '[Deleted]',
          'author.profileUrl': null,
          'author.urn': null,
          content: '[Content Deleted]',
        },
      },
    );

    if (result.modifiedCount > 0) {
      this.logger.log(`Soft deleted ${result.modifiedCount} expired post(s)`);
    }
  }

  /**
   * Hard delete users that have been soft deleted for more than SOFT_DELETE_DAYS
   */
  private async hardDeleteOldUsers(): Promise<void> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - this.SOFT_DELETE_DAYS);

    const result = await this.userModel.deleteMany({
      deletedAt: { $lt: cutoffDate },
    });

    if (result.deletedCount > 0) {
      this.logger.log(
        `Hard deleted ${result.deletedCount} old soft-deleted user(s)`,
      );
    }
  }

  /**
   * Hard delete leads that have been soft deleted for more than SOFT_DELETE_DAYS
   */
  private async hardDeleteOldLeads(): Promise<void> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - this.SOFT_DELETE_DAYS);

    const result = await this.leadModel.deleteMany({
      deletedAt: { $lt: cutoffDate },
    });

    if (result.deletedCount > 0) {
      this.logger.log(
        `Hard deleted ${result.deletedCount} old soft-deleted lead(s)`,
      );
    }
  }

  /**
   * Hard delete posts that have been soft deleted for more than SOFT_DELETE_DAYS
   */
  private async hardDeleteOldPosts(): Promise<void> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - this.SOFT_DELETE_DAYS);

    const result = await this.postModel.deleteMany({
      deletedAt: { $lt: cutoffDate },
    });

    if (result.deletedCount > 0) {
      this.logger.log(
        `Hard deleted ${result.deletedCount} old soft-deleted post(s)`,
      );
    }
  }

  /**
   * Cascading delete: Delete all leads and posts when a user is deleted
   */
  async cascadeDeleteUserData(userId: string): Promise<void> {
    try {
      // Delete all leads for this user
      const leadsResult = await this.leadModel.deleteMany({ userId });
      this.logger.log(
        `Cascade deleted ${leadsResult.deletedCount} lead(s) for user ${userId}`,
      );

      // Delete all posts for this user
      const postsResult = await this.postModel.deleteMany({ userId });
      this.logger.log(
        `Cascade deleted ${postsResult.deletedCount} post(s) for user ${userId}`,
      );
    } catch (error) {
      this.logger.error(
        `Error during cascade delete for user ${userId}:`,
        error,
      );
      throw error;
    }
  }
}
