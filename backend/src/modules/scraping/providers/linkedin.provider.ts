import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import {
  ScrapingProvider,
  PostData,
  EngagementData,
  ProfileData,
  Platform,
  EngagementType,
} from '../../../common/interfaces/scraping.interface';

const APIFY_ACTOR_ID = 'harvestapi~linkedin-post-comments';
const APIFY_RUN_SYNC_TIMEOUT_MS = 120_000; // 2 minutes for sync run

@Injectable()
export class LinkedInProvider implements ScrapingProvider {
  private readonly logger = new Logger(LinkedInProvider.name);
  readonly name = 'LinkedIn';
  private readonly rapidApiKey: string;
  private readonly rapidApiHost: string;
  private readonly apifyToken: string;

  constructor(private configService: ConfigService) {
    this.rapidApiKey = this.configService.get('RAPIDAPI_KEY') || '';
    this.rapidApiHost = this.configService.get('RAPIDAPI_HOST') || '';
    this.apifyToken = this.configService.get('APIFY_TOKEN') || '';
  }

  private getHeaders() {
    return {
      'x-rapidapi-host': this.rapidApiHost,
      'x-rapidapi-key': this.rapidApiKey,
    };
  }

  private buildMinimalPostData(url: string, postUrn: string): PostData {
    return {
      id: postUrn,
      url,
      platform: Platform.LINKEDIN,
      content: '',
      author: { name: '', profileUrl: '', urn: '' },
      metrics: { likesCount: 0, commentsCount: 0, sharesCount: 0 },
      createdAt: new Date(),
    };
  }

  async extractPostData(url: string): Promise<PostData> {
    const postUrn = this.extractUrnFromUrl(url);

    try {
      const response = await axios.get(
        `https://${this.rapidApiHost}/api/v1/posts/info?urn=${postUrn}`,
        { headers: this.getHeaders() },
      );

      if (!response.data?.data?.post) {
        throw new Error('Invalid API response: post data not found');
      }

      const data = response.data.data.post;

      return {
        id: postUrn,
        url,
        platform: Platform.LINKEDIN,
        content: data.text || '',
        author: {
          name: data.author?.name || '',
          profileUrl: data.author?.profileUrl || '',
          urn: data.author?.urn || '',
        },
        metrics: {
          likesCount: data.likesCount || 0,
          commentsCount: data.commentsCount || 0,
          sharesCount: data.sharesCount || 0,
        },
        createdAt: new Date(),
      };
    } catch (error: unknown) {
      this.logger.warn(
        'Post data extraction failed, using minimal post data so comments can still be fetched:',
        (error as any).message,
      );
      return this.buildMinimalPostData(url, postUrn);
    }
  }

  async extractEngagements(
    postId: string,
    postUrl?: string,
  ): Promise<EngagementData[]> {
    try {
      return await this.extractEngagementsViaRapidApi(postId);
    } catch (rapidError: unknown) {
      this.logger.warn(
        'RapidAPI engagements failed, trying Apify fallback:',
        (rapidError as any).message,
      );
      if (!this.apifyToken?.trim()) {
        this.logger.error(
          'APIFY_TOKEN is not set. Add APIFY_TOKEN to your .env to use Apify as fallback for comments.',
        );
        throw new Error(
          'RapidAPI rate limit exceeded. Add APIFY_TOKEN to backend .env (from apify.com) to fetch comments via Apify fallback.',
        );
      }
      try {
        return await this.extractEngagementsViaApify(postId, postUrl);
      } catch (apifyError: unknown) {
        this.logger.error(
          'Apify fallback also failed:',
          (apifyError as any).message,
        );
        throw new Error(
          `Both RapidAPI and Apify failed. RapidAPI: ${(rapidError as any).message}. Apify: ${(apifyError as any).message}`,
        );
      }
    }
  }

  private async extractEngagementsViaRapidApi(
    postId: string,
  ): Promise<EngagementData[]> {
    const engagements: EngagementData[] = [];

    const commentsResponse = await axios.get(
      `https://${this.rapidApiHost}/api/v1/posts/comments?urn=${postId}`,
      { headers: this.getHeaders() },
    );

    if (
      commentsResponse.data?.success &&
      commentsResponse.data?.data?.comments &&
      Array.isArray(commentsResponse.data.data.comments)
    ) {
      commentsResponse.data.data.comments.forEach((comment: any) => {
        if (comment?.author?.urn) {
          const commentContent =
            comment.text || comment.content || comment.message || '';
          this.logger.debug(
            `Comment content for ${comment.author.name}: ${commentContent}`,
          );
          engagements.push({
            type: EngagementType.COMMENT,
            user: {
              name: comment.author?.name || '',
              profileUrl: comment.author?.profileUrl || '',
              urn: comment.author.urn,
              headline: comment.author?.headline || '',
            },
            content: commentContent,
          });
        }
      });
    }

    try {
      const likesResponse = await axios.get(
        `https://${this.rapidApiHost}/api/v1/posts/likes?urn=${postId}`,
        { headers: this.getHeaders() },
      );
      if (likesResponse.data.success && likesResponse.data.data) {
        this.logger.log('Likes data retrieved successfully');
      }
    } catch (likesError: unknown) {
      this.logger.warn(
        'Likes extraction failed:',
        (likesError as any).message,
      );
    }

    return engagements;
  }

  private buildLinkedInPostUrl(postId: string): string {
    if (postId.startsWith('http')) return postId;
    if (postId.startsWith('urn:')) {
      return `https://www.linkedin.com/feed/update/${postId}/`;
    }
    return `https://www.linkedin.com/feed/update/urn:li:activity:${postId}/`;
  }

  private async extractEngagementsViaApify(
    postId: string,
    fullPostUrl?: string,
  ): Promise<EngagementData[]> {
    const postUrl =
      fullPostUrl?.trim() || this.buildLinkedInPostUrl(postId);
    if (fullPostUrl?.trim()) {
      this.logger.debug(`Apify using full post URL: ${fullPostUrl.slice(0, 80)}...`);
    }
    const url = `https://api.apify.com/v2/acts/${APIFY_ACTOR_ID}/run-sync-get-dataset-items?token=${this.apifyToken}`;
    const response = await axios.post(
      url,
      {
        posts: [postUrl],
        maxItems: 500,
        scrapeReplies: false,
      },
      {
        headers: { 'Content-Type': 'application/json' },
        timeout: APIFY_RUN_SYNC_TIMEOUT_MS,
      },
    );

    // Apify run-sync-get-dataset-items can return array directly or wrapped
    const rawData = response.data;
    const items = Array.isArray(rawData)
      ? rawData
      : Array.isArray((rawData as any)?.items)
        ? (rawData as any).items
        : Array.isArray((rawData as any)?.data)
          ? (rawData as any).data
          : [];

    if (items.length === 0 && rawData != null && typeof rawData === 'object') {
      this.logger.debug(
        'Apify returned 0 items. Response keys: ' +
          Object.keys(rawData as object).join(', '),
      );
    }

    const engagements: EngagementData[] = [];

    for (const item of items) {
      // HarvestAPI actor uses "actor" and "commentary" (see their README)
      const author = item.actor || item.author || item.commenter || item.user || {};
      const urn =
        author.urn ||
        author.id ||
        author.publicIdentifier ||
        author.profileUrn ||
        '';
      const name =
        author.name ||
        [author.firstName, author.lastName].filter(Boolean).join(' ') ||
        'Unknown';
      const profileUrl =
        author.linkedinUrl ||
        author.profileUrl ||
        author.url ||
        (author.publicIdentifier
          ? `https://www.linkedin.com/in/${author.publicIdentifier}`
          : '');
      const headline = author.position || author.headline || author.title || '';
      const content =
        item.commentary ||
        item.text ||
        item.content ||
        item.comment ||
        item.message ||
        item.body ||
        '';

      if (urn || name !== 'Unknown') {
        engagements.push({
          type: EngagementType.COMMENT,
          user: {
            name,
            profileUrl: profileUrl || '',
            urn: urn || `apify-${name.replace(/\s/g, '-')}-${Date.now()}`,
            headline,
          },
          content: typeof content === 'string' ? content : '',
        });
      }
    }

    this.logger.log(
      `Apify fallback returned ${engagements.length} comment(s) for post ${postId}`,
    );
    return engagements;
  }

  async extractProfile(profileUrn: string): Promise<ProfileData> {
    try {
      // Get education data
      const educationResponse = await axios.get(
        `https://${this.rapidApiHost}/api/v1/profile/education?urn=${profileUrn}`,
        { headers: this.getHeaders() },
      );

      // Get full profile data for location and other details
      let fullProfile: any = {};
      try {
        const fullResponse = await axios.get(
          `https://${this.rapidApiHost}/api/v1/profile/full?urn=${profileUrn}`,
          { headers: this.getHeaders() },
        );
        fullProfile = fullResponse.data?.data || {};
      } catch (error: unknown) {
        this.logger.warn(
          'Full profile extraction failed:',
          (error as any).message,
        );
      }

      // Get contact info if location is not available
      let contactInfo: any = {};
      if (!fullProfile.location?.country && !fullProfile.location?.city) {
        try {
          const contactResponse = await axios.get(
            `https://${this.rapidApiHost}/api/v1/profile/contact-info?username=${profileUrn}`,
            { headers: this.getHeaders() },
          );
          contactInfo = contactResponse.data?.data || {};
        } catch (error: unknown) {
          this.logger.warn(
            'Contact info extraction failed:',
            (error as any).message,
          );
        }
      }

      const education = educationResponse.data?.data?.education || [];

      // Map education data to our format
      const mappedEducation = Array.isArray(education)
        ? education.map((edu: any) => ({
            institution: edu?.university || '',
            degree: edu?.degree || '',
            fieldOfStudy: edu?.fieldOfStudy || '',
            startYear: edu?.durationParsed?.start?.year || undefined,
            endYear: edu?.durationParsed?.end?.year || undefined,
          }))
        : [];

      // Extract experience from full profile
      const experience = Array.isArray(fullProfile.experience)
        ? fullProfile.experience.map((exp: any) => ({
            title: exp?.title || '',
            company: exp?.companyName || '',
            startYear: exp?.durationParsed?.start?.year || undefined,
            endYear: exp?.durationParsed?.end?.year || undefined,
          }))
        : [];

      return {
        urn: profileUrn,
        name: '', // Name comes from engagement data
        headline: '', // Headline comes from engagement data
        location: {
          country:
            fullProfile.location?.country ||
            contactInfo.location?.country ||
            '',
          city: fullProfile.location?.city || contactInfo.location?.city || '',
        },
        education: mappedEducation,
        experience: experience,
        profileUrl: `https://linkedin.com/in/${profileUrn}`,
        contactInfo: {
          email: contactInfo.email || '',
          phone: contactInfo.phone || '',
          website: contactInfo.website || '',
        },
      };
    } catch (error: unknown) {
      if ((error as any).response?.status === 429) {
        this.logger.error('Rate limit exceeded for profile extraction');
        throw new Error(
          'Rate limit exceeded. Please wait before trying again or upgrade your RapidAPI plan.',
        );
      }
      if ((error as any).response?.status === 403) {
        this.logger.error('API access forbidden for profile extraction');
        throw new Error(
          'API access denied. Please check your RapidAPI key and subscription status.',
        );
      }
      this.logger.error('Failed to extract profile:', (error as any).message);
      throw new Error(`Failed to extract profile: ${(error as any).message}`);
    }
  }

  private extractUrnFromUrl(url: string): string {
    // Extract URN from LinkedIn URL
    const patterns = [
      /activity-(\d+)/,
      /posts\/([^?]+)/,
      /urn:li:activity:(\d+)/,
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) {
        return match[1];
      }
    }

    throw new Error('Could not extract URN from LinkedIn URL');
  }
}
