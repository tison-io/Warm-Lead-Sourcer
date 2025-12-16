import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Post, PostDocument } from '../posts/schemas/post.schema';
import { Lead, LeadDocument } from '../leads/schemas/lead.schema';
import { LinkedInProvider } from './providers/linkedin.provider';
import {
  Platform,
  EngagementData,
  ProfileData,
} from '../../common/interfaces/scraping.interface';

@Injectable()
export class ScrapingService {
  private readonly logger = new Logger(ScrapingService.name);

  constructor(
    @InjectModel(Post.name) private postModel: Model<PostDocument>,
    @InjectModel(Lead.name) private leadModel: Model<LeadDocument>,
    private linkedInProvider: LinkedInProvider,
  ) {}

  async processPost(postId: string): Promise<void> {
    const post = await this.postModel.findById(postId);
    if (!post) {
      throw new Error('Post not found');
    }

    const startTime = Date.now();
    try {
      await this.postModel.findByIdAndUpdate(postId, {
        status: 'processing',
        startedAt: new Date(),
      });

      // Extract post data and engagements
      const postData = await this.getProvider(
        post.platform as Platform,
      ).extractPostData(post.url);
      const engagements = await this.getProvider(
        post.platform as Platform,
      ).extractEngagements(postData.id);

      // Update post with extracted data
      await this.postModel.findByIdAndUpdate(postId, {
        content: postData.content,
        author: postData.author,
        metrics: postData.metrics,
        totalEngagements: engagements.length,
      });

      // Process each engagement to create leads (parallel processing)
      const results = await Promise.allSettled(
        engagements.map((engagement) =>
          this.processEngagement(postId, post.userId, engagement),
        ),
      );

      const processedCount = results.filter(
        (result) => (result as any).status === 'fulfilled',
      ).length;

      // Log failed engagements
      results.forEach((result, index) => {
        if (result.status === 'rejected') {
          this.logger.warn(
            `Failed to process engagement for ${engagements[index].user.name}:`,
            result.reason,
          );
        }
      });

      const endTime = Date.now();
      const processingTimeMs = endTime - startTime;
      const processingTimeSeconds = Math.round(processingTimeMs / 1000);

      // Mark as completed
      await this.postModel.findByIdAndUpdate(postId, {
        status: 'completed',
        processedEngagements: processedCount,
        processedAt: new Date(),
        processingTime: processingTimeSeconds,
      });

      this.logger.log(
        `Successfully processed post ${postId}: ${processedCount}/${engagements.length} leads created`,
      );
    } catch (error: unknown) {
      this.logger.error(
        `Failed to process post ${postId}:`,
        (error as any).message,
      );
      await this.postModel.findByIdAndUpdate(postId, {
        status: 'failed',
        errorMessage: (error as any).message,
      });
      throw error;
    }
  }

  private async processEngagement(
    postId: string,
    userId: string,
    engagement: EngagementData,
  ): Promise<void> {
    // Check if lead already exists
    const existingLead = await this.leadModel.findOne({
      postId,
      urn: engagement.user.urn,
    });

    if (existingLead) {
      this.logger.debug(`Lead already exists for ${engagement.user.name}`);
      return;
    }

    // Extract full profile data
    let profileData: ProfileData;
    try {
      profileData = await this.getProvider(Platform.LINKEDIN).extractProfile(
        engagement.user.urn,
      );
      // Use name and headline from engagement data since profile endpoints don't provide them
      profileData.name = engagement.user.name;
      profileData.headline = engagement.user.headline || '';
    } catch (error: unknown) {
      this.logger.warn(
        `Profile extraction failed for ${engagement.user.name}: ${(error as any).message}`,
      );
      // Create basic lead with available data if profile extraction fails
      profileData = {
        urn: engagement.user.urn,
        name: engagement.user.name,
        headline: engagement.user.headline || '',
        profileUrl: engagement.user.profileUrl,
        location: { country: '', city: '' },
        education: [],
        experience: [],
      };
    }

    // Calculate match score (basic implementation)
    const matchScore = this.calculateMatchScore(profileData);

    // Generate email guess
    const guessedEmail = this.generateEmailGuess(profileData);

    // Create lead
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30); // 30 days from now

    const lead = new this.leadModel({
      postId,
      userId,
      urn: profileData.urn,
      name: profileData.name,
      headline: profileData.headline,
      profileUrl: profileData.profileUrl,
      location: profileData.location,
      education: profileData.education,
      experience: profileData.experience,
      engagementType: engagement.type,
      engagementContent: engagement.content,
      matchScore,
      guessedEmail,
      contactInfo: profileData.contactInfo,
      tags: [],
      expiresAt,
    });

    await lead.save();
  }

  private getProvider(platform: Platform) {
    switch (platform) {
      case Platform.LINKEDIN:
        return this.linkedInProvider;
      default:
        throw new Error(`Provider not implemented for platform: ${platform}`);
    }
  }

  private calculateMatchScore(profile: ProfileData): number {
    let score = 10; // Base score for having engagement

    // Profile completeness scoring
    if (profile.headline && profile.headline.trim()) score += 15;

    // Education scoring
    if (profile.education && profile.education.length > 0) {
      score += 25;
      // Bonus for degree information
      if (profile.education.some((edu) => edu.degree && edu.degree.trim())) {
        score += 10;
      }
      // Bonus for field of study
      if (
        profile.education.some(
          (edu) => edu.fieldOfStudy && edu.fieldOfStudy.trim(),
        )
      ) {
        score += 5;
      }
    }

    // Experience scoring
    if (profile.experience && profile.experience.length > 0) {
      score += 20;
      // Bonus for multiple experiences
      if (profile.experience.length > 1) score += 5;
    }

    // Location scoring
    if (profile.location?.country && profile.location.country.trim())
      score += 8;
    if (profile.location?.city && profile.location.city.trim()) score += 7;

    // Contact info scoring
    if (profile.contactInfo?.email && profile.contactInfo.email.trim())
      score += 10;
    if (profile.contactInfo?.phone && profile.contactInfo.phone.trim())
      score += 5;
    if (profile.contactInfo?.website && profile.contactInfo.website.trim())
      score += 3;

    return Math.min(score, 100);
  }

  private generateEmailGuess(profile: ProfileData): string | undefined {
    if (!profile.name || !profile.education || profile.education.length === 0) {
      return undefined;
    }

    const firstName = profile.name.split(' ')[0]?.toLowerCase();
    const lastName = profile.name.split(' ').slice(-1)[0]?.toLowerCase();

    if (!firstName || !lastName) return undefined;

    const university = profile.education[0];
    if (university?.institution) {
      // First try predefined domains
      const predefinedDomain = this.getUniversityDomain(university.institution);
      if (predefinedDomain) {
        return `${firstName}.${lastName}@${predefinedDomain}`;
      }

      // Generate email based on university name
      const universityEmail = this.generateUniversityEmail(
        university.institution,
      );
      if (universityEmail) {
        return `${firstName}.${lastName}@${universityEmail}`;
      }
    }

    return undefined;
  }

  private getUniversityDomain(institution: string): string | undefined {
    // Known university domain mapping
    const domains: Record<string, string> = {
      'stanford university': 'stanford.edu',
      'harvard university': 'harvard.edu',
      mit: 'mit.edu',
      'university of california': 'berkeley.edu',
      'carnegie mellon': 'cmu.edu',
      'georgia tech': 'gatech.edu',
    };

    const institutionLower = institution.toLowerCase();
    for (const [key, domain] of Object.entries(domains)) {
      if (institutionLower.includes(key)) {
        return domain;
      }
    }

    return undefined;
  }

  private generateUniversityEmail(institution: string): string | undefined {
    if (!institution) return undefined;

    // Clean and format university name for email
    const cleanName = institution
      .toLowerCase()
      .replace(/university|college|institute|school/g, '')
      .replace(/[^a-z\s]/g, '')
      .trim()
      .split(' ')
      .filter((word) => word.length > 2)
      .slice(0, 2)
      .join('');

    if (cleanName.length < 3) return undefined;

    return `${cleanName}gmail.com`;
  }
}
