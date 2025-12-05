import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosResponse } from 'axios';
import {
  ScrapingProvider,
  PostData,
  EngagementData,
  ProfileData,
  Platform,
  EngagementType,
} from '../../../common/interfaces/scraping.interface';

@Injectable()
export class LinkedInProvider implements ScrapingProvider {
  private readonly logger = new Logger(LinkedInProvider.name);
  readonly name = 'LinkedIn';
  private readonly rapidApiKey: string;
  private readonly rapidApiHost: string;

  constructor(private configService: ConfigService) {
    this.rapidApiKey = this.configService.get('RAPIDAPI_KEY') || '';
    this.rapidApiHost = this.configService.get('RAPIDAPI_HOST') || '';
  }

  private getHeaders() {
    return {
      'x-rapidapi-host': this.rapidApiHost,
      'x-rapidapi-key': this.rapidApiKey,
    };
  }

  async extractPostData(url: string): Promise<PostData> {
    const postUrn = this.extractUrnFromUrl(url);

    try {
      const response = await axios.get(
        `https://${this.rapidApiHost}/api/v1/posts/info?urn=${postUrn}`,
        { headers: this.getHeaders() },
      );

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
    } catch (error) {
      this.logger.error('Failed to extract post data:', error.message);
      throw new Error(`Failed to extract post data: ${error.message}`);
    }
  }

  async extractEngagements(postId: string): Promise<EngagementData[]> {
    const engagements: EngagementData[] = [];

    try {
      // Get comments
      const commentsResponse = await axios.get(
        `https://${this.rapidApiHost}/api/v1/posts/comments?urn=${postId}`,
        { headers: this.getHeaders() },
      );

      if (
        commentsResponse.data.success &&
        commentsResponse.data.data.comments
      ) {
        commentsResponse.data.data.comments.forEach((comment: any) => {
          engagements.push({
            type: EngagementType.COMMENT,
            user: {
              name: comment.author?.name || '',
              profileUrl: comment.author?.profileUrl || '',
              urn: comment.author?.urn || '',
              headline: comment.author?.headline || '',
            },
          });
        });
      }

      // Get likes (may need different URN format)
      try {
        const likesResponse = await axios.get(
          `https://${this.rapidApiHost}/api/v1/posts/likes?urn=${postId}`,
          { headers: this.getHeaders() },
        );

        if (likesResponse.data.success && likesResponse.data.data) {
          // Process likes data if available
          this.logger.log('Likes data retrieved successfully');
        }
      } catch (likesError) {
        this.logger.warn('Likes extraction failed:', likesError.message);
      }

      return engagements;
    } catch (error) {
      this.logger.error('Failed to extract engagements:', error.message);
      throw new Error(`Failed to extract engagements: ${error.message}`);
    }
  }

  async extractProfile(profileUrn: string): Promise<ProfileData> {
    try {
      // Get education data
      const educationResponse = await axios.get(
        `https://${this.rapidApiHost}/api/v1/profile/education?urn=${profileUrn}`,
        { headers: this.getHeaders() },
      );

      // Get skills data
      let skillsData = [];
      try {
        const skillsResponse = await axios.get(
          `https://${this.rapidApiHost}/api/v1/profile/skills?urn=${profileUrn}`,
          { headers: this.getHeaders() },
        );
        skillsData = skillsResponse.data.data?.skills || [];
      } catch (error) {
        this.logger.warn('Skills extraction failed:', error.message);
      }

      const education = educationResponse.data.data?.education || [];

      // Map education data to our format
      const mappedEducation = education.map((edu: any) => ({
        institution: edu.university || '',
        degree: edu.degree || '',
        fieldOfStudy: '',
        startYear: edu.durationParsed?.start?.year || undefined,
        endYear: edu.durationParsed?.end?.year || undefined,
      }));

      return {
        urn: profileUrn,
        name: '', // Name comes from engagement data
        headline: '', // Headline comes from engagement data
        location: {
          country: '',
          city: '',
        },
        education: mappedEducation,
        experience: [], // Not available in current API
        profileUrl: `https://linkedin.com/in/${profileUrn}`,
      };
    } catch (error) {
      this.logger.error('Failed to extract profile:', error.message);
      throw new Error(`Failed to extract profile: ${error.message}`);
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
