import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { LinkedInProvider } from './linkedin.provider';
import axios from 'axios';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('LinkedInProvider', () => {
  let provider: LinkedInProvider;
  let mockConfigService: any;

  beforeEach(async () => {
    mockConfigService = {
      get: jest.fn().mockImplementation((key: string) => {
        const config = {
          RAPIDAPI_KEY: 'test-api-key',
          RAPIDAPI_HOST: 'test-host.com',
        };
        return config[key];
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LinkedInProvider,
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    provider = module.get<LinkedInProvider>(LinkedInProvider);
  });

  it('should be defined', () => {
    expect(provider).toBeDefined();
  });

  describe('extractPostData', () => {
    it('should extract post data successfully', async () => {
      const mockResponse = {
        data: {
          success: true,
          data: {
            post: {
              text: 'Test post content',
              likesCount: 10,
              commentsCount: 5,
              author: {
                name: 'Test Author',
                profileUrl: 'profile-url',
                urn: 'author-urn',
              },
            },
          },
        },
      };

      mockedAxios.get.mockResolvedValue(mockResponse);

      const result = await provider.extractPostData(
        'https://www.linkedin.com/feed/update/urn:li:activity:7353638537595932672',
      );

      expect(result).toEqual({
        id: '7353638537595932672',
        url: 'https://www.linkedin.com/feed/update/urn:li:activity:7353638537595932672',
        platform: 'linkedin',
        content: 'Test post content',
        author: {
          name: 'Test Author',
          profileUrl: 'profile-url',
          urn: 'author-urn',
        },
        metrics: {
          likesCount: 10,
          commentsCount: 5,
          sharesCount: 0,
        },
        createdAt: expect.any(Date),
      });
    });

    it('should handle invalid URL', async () => {
      await expect(provider.extractPostData('invalid-url')).rejects.toThrow(
        'Could not extract URN from LinkedIn URL',
      );
    });
  });

  describe('extractEngagements', () => {
    it('should extract comments successfully', async () => {
      const mockResponse = {
        data: {
          success: true,
          data: {
            comments: [
              {
                author: {
                  name: 'Commenter 1',
                  urn: 'commenter-urn-1',
                  profileUrl: 'profile-1',
                  headline: 'Software Engineer',
                },
              },
            ],
          },
        },
      };

      mockedAxios.get.mockResolvedValue(mockResponse);

      const result = await provider.extractEngagements('test-urn');

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        type: 'comment',
        user: {
          name: 'Commenter 1',
          urn: 'commenter-urn-1',
          profileUrl: 'profile-1',
          headline: 'Software Engineer',
        },
      });
    });
  });
});
