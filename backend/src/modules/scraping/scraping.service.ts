import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import axios from 'axios';
import { Post, PostDocument } from '../posts/schemas/post.schema';
import { Lead, LeadDocument } from '../leads/schemas/lead.schema';
import { LinkedInProvider } from './providers/linkedin.provider';
import {
  Platform,
  EngagementData,
  ProfileData,
  PostData,
} from '../../common/interfaces/scraping.interface';

@Injectable()
export class ScrapingService {
  private readonly logger = new Logger(ScrapingService.name);

  constructor(
    @InjectModel(Post.name) private postModel: Model<PostDocument>,
    @InjectModel(Lead.name) private leadModel: Model<LeadDocument>,
    private linkedInProvider: LinkedInProvider,
    private configService: ConfigService,
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
      ).extractEngagements(postData.id, post.url);

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

      // Send scraped data to genai service /api/enrich
      await this.sendToEnrichApi(postId, post.url, post.platform, postData, engagements);

      // Log sample engagement content for debugging
      if (engagements.length > 0) {
        this.logger.log(
          `Sample engagement: User=${engagements[0].user.name}, Content="${engagements[0].content}"`,
        );
      }
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

  /**
   * Sends LinkedIn profile URLs from scraped engagements to the GenAI enrich API.
   * GenAI expects: POST body { links: string[] } (array of LinkedIn profile URLs).
   * Enriched response can be used to update leads with missing fields (email, education, etc.).
   */
  private async sendToEnrichApi(
    postId: string,
    _postUrl: string,
    _platform: string,
    _postData: PostData,
    engagements: EngagementData[],
  ): Promise<void> {
    const baseUrl = this.configService.get<string>('GENAI_SERVICE_URL');
    if (!baseUrl) {
      this.logger.warn(
        'GENAI_SERVICE_URL not set; enrichment skipped. Set GENAI_SERVICE_URL to enable lead enrichment (e.g. https://warm-lead-sourcer-ix9n.onrender.com)',
      );
      return;
    }

    const links = this.collectLinkedInProfileUrls(engagements);
    if (links.length === 0) {
      this.logger.warn(
        'No LinkedIn profile URLs in engagements; enrichment skipped for post ' +
          postId,
      );
      return;
    }

    const enrichUrl = `${baseUrl.replace(/\/$/, '')}/api/enrich`;
    const timeoutMs =
      this.configService.get<number>('GENAI_ENRICH_TIMEOUT_MS') ?? 300000;
    this.logger.log(
      `Calling Enrich API for post ${postId} (${links.length} links, timeout ${timeoutMs / 1000}s)`,
    );
    try {
      const response = await axios.post<{
        count?: number;
        data?: Array<{
          name?: string;
          linkedin_url?: string;
          current_role?: string;
          education?: string;
          country?: string;
          email?: string;
          score?: number;
        }>;
      }>(
        enrichUrl,
        { links },
        {
          timeout: timeoutMs,
          headers: { 'Content-Type': 'application/json' },
        },
      );
      this.logger.log(
        `Enrich API responded for post ${postId}: ${response.data?.data?.length ?? 0} profile(s) returned`,
      );
      if (response.data?.data?.length) {
        await this.applyEnrichmentToLeads(postId, response.data.data);
      } else if (response.data && 'error' in response.data) {
        this.logger.warn(
          `Enrich API returned error for post ${postId}: ${(response.data as { error?: string }).error}`,
        );
      }
    } catch (error: unknown) {
      const err = error as { message?: string; response?: { status?: number; data?: unknown } };
      this.logger.error(
        `Enrich API failed for post ${postId}: ${err?.message ?? error}. ` +
          (err?.response
            ? `Status ${err.response.status}; body: ${JSON.stringify(err.response.data)}`
            : ''),
      );
    }
  }

  /**
   * Collects unique LinkedIn profile URLs from engagements (format expected by GenAI).
   */
  private collectLinkedInProfileUrls(
    engagements: EngagementData[],
  ): string[] {
    const seen = new Set<string>();
    const urls: string[] = [];
    for (const e of engagements) {
      const raw = e.user?.profileUrl?.trim();
      if (!raw) continue;
      const normalized = this.normalizeLinkedInProfileUrl(raw);
      if (normalized && !seen.has(normalized)) {
        seen.add(normalized);
        urls.push(normalized);
      }
    }
    return urls;
  }

  private normalizeLinkedInProfileUrl(url: string): string {
    try {
      const u = url.startsWith('http') ? url : `https://${url}`;
      const parsed = new URL(u);
      if (
        parsed.hostname?.replace(/^www\./, '') === 'linkedin.com' &&
        parsed.pathname?.startsWith('/in/')
      ) {
        return `https://www.linkedin.com${parsed.pathname.replace(/\/$/, '')}`;
      }
      return u;
    } catch {
      return url;
    }
  }

  /** Extract /in/username for robust matching (GenAI may return different URL variants). */
  private getLinkedInPathname(url: string): string | null {
    try {
      const u = url.startsWith('http') ? url : `https://${url}`;
      const parsed = new URL(u);
      if (
        parsed.hostname?.replace(/^www\./, '') === 'linkedin.com' &&
        parsed.pathname?.startsWith('/in/')
      ) {
        return parsed.pathname.replace(/\/$/, '').toLowerCase();
      }
      return null;
    } catch {
      return null;
    }
  }

  private isPlaceholderValue(value: string | null | undefined): boolean {
    if (value == null || typeof value !== 'string') return true;
    const v = value.trim().toLowerCase();
    return (
      !v ||
      v === 'n/a' ||
      v === 'na' ||
      v === 'not available' ||
      v === 'unavailable' ||
      v === 'email unavailable' ||
      v === 'linkedin url unavailable' ||
      v === 'country unavailable'
    );
  }

  /**
   * Updates leads for this post with enriched data (email, education, score, etc.) by matching profile URL.
   */
  private async applyEnrichmentToLeads(
    postId: string,
    enrichedProfiles: Array<{
      name?: string;
      linkedin_url?: string;
      current_role?: string;
      education?: string;
      country?: string;
      email?: string;
      score?: number;
    }>,
  ): Promise<void> {
    const leads = await this.leadModel.find({ postId }).lean();
    const leadByNormalizedUrl = new Map<string, (typeof leads)[0]>();
    const leadByPathname = new Map<string, (typeof leads)[0]>();
    for (const lead of leads) {
      if (lead.profileUrl) {
        const normalized = this.normalizeLinkedInProfileUrl(lead.profileUrl);
        leadByNormalizedUrl.set(normalized, lead);
        const pathname = this.getLinkedInPathname(lead.profileUrl);
        if (pathname) leadByPathname.set(pathname, lead);
      }
    }
    let updatedCount = 0;
    for (const profile of enrichedProfiles) {
      const profileUrl = profile.linkedin_url;
      if (!profileUrl) continue;
      const normalized = this.normalizeLinkedInProfileUrl(profileUrl);
      const pathname = this.getLinkedInPathname(profileUrl);
      const lead =
        leadByNormalizedUrl.get(normalized) ??
        (pathname ? leadByPathname.get(pathname) : null);
      if (!lead) continue;
      const updates: Record<string, unknown> = {};
      if (
        !this.isPlaceholderValue(profile.email) &&
        profile.email != null &&
        profile.email !== ''
      ) {
        updates['contactInfo.email'] = profile.email;
        updates['guessedEmail'] = profile.email;
      }
      const hasNoEducation =
        !lead.education || !Array.isArray(lead.education) || lead.education.length === 0;
      if (
        !this.isPlaceholderValue(profile.education) &&
        profile.education != null &&
        profile.education !== '' &&
        hasNoEducation
      ) {
        updates['education'] = [
          {
            institution: profile.education,
            degree: '',
            fieldOfStudy: '',
            startYear: undefined,
            endYear: undefined,
          },
        ];
      }
      if (
        !this.isPlaceholderValue(profile.country) &&
        profile.country != null &&
        !lead.location?.country
      ) {
        updates['location'] = {
          country: profile.country,
          city: lead.location?.city ?? '',
        };
      }
      if (typeof profile.score === 'number' && profile.score >= 0) {
        updates['matchScore'] = Math.min(100, Math.max(0, profile.score));
      }
      if (Object.keys(updates).length > 0) {
        await this.leadModel.findByIdAndUpdate(lead._id, { $set: updates });
        updatedCount++;
      }
    }
    if (updatedCount > 0) {
      this.logger.log(
        `Enrichment applied: updated ${updatedCount} lead(s) for post ${postId}`,
      );
    }
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
