export interface ScrapingProvider {
  name: string;
  extractPostData(url: string): Promise<PostData>;
  extractEngagements(postId: string): Promise<EngagementData[]>;
  extractProfile(profileId: string): Promise<ProfileData>;
}

export interface PostData {
  id: string;
  url: string;
  platform: Platform;
  content: string;
  author: {
    name: string;
    profileUrl: string;
    urn: string;
  };
  metrics: {
    likesCount: number;
    commentsCount: number;
    sharesCount: number;
  };
  createdAt: Date;
}

export interface EngagementData {
  type: EngagementType;
  user: {
    name: string;
    profileUrl: string;
    urn: string;
    headline?: string;
  };
  timestamp?: Date;
}

export interface ProfileData {
  urn: string;
  name: string;
  headline: string;
  location?: {
    country: string;
    city: string;
  };
  education?: EducationData[];
  experience?: ExperienceData[];
  profileUrl: string;
}

export interface EducationData {
  institution: string;
  degree?: string;
  fieldOfStudy?: string;
  startYear?: number;
  endYear?: number;
}

export interface ExperienceData {
  company: string;
  title: string;
  startDate?: Date;
  endDate?: Date;
  current: boolean;
}

export enum Platform {
  LINKEDIN = 'linkedin',
  INSTAGRAM = 'instagram',
  TWITTER = 'twitter',
}

export enum EngagementType {
  LIKE = 'like',
  COMMENT = 'comment',
  SHARE = 'share',
  REACTION = 'reaction',
}

export interface LeadData extends ProfileData {
  engagementType: EngagementType;
  matchScore: number;
  guessedEmail?: string;
  tags?: string[];
}
