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

    try {
      await this.postModel.findByIdAndUpdate(postId, { status: 'processing' });

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
        (result) => result.status === 'fulfilled',
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

      // Mark as completed
      await this.postModel.findByIdAndUpdate(postId, {
        status: 'completed',
        processedEngagements: processedCount,
        processedAt: new Date(),
      });

      this.logger.log(
        `Successfully processed post ${postId}: ${processedCount}/${engagements.length} leads created`,
      );
    } catch (error) {
      this.logger.error(`Failed to process post ${postId}:`, error.message);
      await this.postModel.findByIdAndUpdate(postId, {
        status: 'failed',
        errorMessage: error.message,
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
    } catch {
      // Create basic lead with available data if profile extraction fails
      profileData = {
        urn: engagement.user.urn,
        name: engagement.user.name,
        headline: engagement.user.headline || '',
        profileUrl: engagement.user.profileUrl,
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
      matchScore,
      guessedEmail,
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

    // Scoring logic based on available data
    if (profile.headline) score += 15;
    if (profile.education && profile.education.length > 0) {
      score += 30;
      // Bonus for degree information
      if (profile.education.some((edu) => edu.degree)) {
        score += 10;
      }
    }
    if (profile.experience && profile.experience.length > 0) score += 25;
    if (profile.location?.country) score += 10;
    if (profile.location?.city) score += 10;

    return Math.min(score, 100);
  }

  private generateEmailGuess(profile: ProfileData): string | undefined {
    if (!profile.name || !profile.education || profile.education.length === 0) {
      return undefined;
    }

    const firstName = profile.name.split(' ')[0]?.toLowerCase();
    const lastName = profile.name.split(' ').slice(-1)[0]?.toLowerCase();

    if (!firstName || !lastName) return undefined;

    // Try to find university domain
    const university = profile.education[0];
    if (university?.institution) {
      const domain = this.getUniversityDomain(university.institution);
      if (domain) {
        return `${firstName}.${lastName}@${domain}`;
      }
    }

    return undefined;
  }

  private getUniversityDomain(institution: string): string | undefined {
    // University domain mapping
    const domains: Record<string, string> = {
      'stanford university': 'stanford.edu',
      'harvard university': 'harvard.edu',
      mit: 'mit.edu',
      'university of california': 'berkeley.edu',
      'carnegie mellon': 'cmu.edu',
      'georgia tech': 'gatech.edu',
      'ubb cluj': 'ubbcluj.ro',
      'technical university of cluj napoca': 'utcluj.ro',
      'holon institute of technology': 'hit.ac.il',
    };

    const institutionLower = institution.toLowerCase();
    for (const [key, domain] of Object.entries(domains)) {
      if (institutionLower.includes(key)) {
        return domain;
      }
    }

    return undefined;
  }
}
