import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { ScrapingService } from './scraping.service';
import { Post } from '../posts/schemas/post.schema';
import { Lead } from '../leads/schemas/lead.schema';
import { LinkedInProvider } from './providers/linkedin.provider';

describe('ScrapingService', () => {
  let service: ScrapingService;
  let mockPostModel: any;
  let mockLeadModel: any;
  let mockLinkedInProvider: any;

  beforeEach(async () => {
    mockPostModel = {
      findById: jest.fn(),
      findByIdAndUpdate: jest.fn(),
    };

    mockLeadModel = {
      findOne: jest.fn(),
      constructor: jest.fn().mockImplementation(() => ({
        save: jest.fn().mockResolvedValue({ _id: 'lead-id' }),
      })),
    };

    mockLinkedInProvider = {
      extractPostData: jest.fn(),
      extractEngagements: jest.fn(),
      extractProfile: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ScrapingService,
        {
          provide: getModelToken(Post.name),
          useValue: mockPostModel,
        },
        {
          provide: getModelToken(Lead.name),
          useValue: mockLeadModel,
        },
        {
          provide: LinkedInProvider,
          useValue: mockLinkedInProvider,
        },
      ],
    }).compile();

    service = module.get<ScrapingService>(ScrapingService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('processPost', () => {
    it('should process a post successfully', async () => {
      const mockPost = {
        _id: 'post-id',
        url: 'https://linkedin.com/posts/test',
        platform: 'linkedin',
        userId: 'user-id',
      };

      const mockPostData = {
        id: 'post-urn',
        content: 'Test post',
        author: { name: 'Test Author' },
        metrics: { likesCount: 10, commentsCount: 5 },
      };

      const mockEngagements = [
        {
          type: 'comment',
          user: {
            name: 'Test User',
            urn: 'user-urn',
            profileUrl: 'profile-url',
            headline: 'Test Headline',
          },
        },
      ];

      mockPostModel.findById.mockResolvedValue(mockPost);
      mockLinkedInProvider.extractPostData.mockResolvedValue(mockPostData);
      mockLinkedInProvider.extractEngagements.mockResolvedValue(
        mockEngagements,
      );
      mockLinkedInProvider.extractProfile.mockResolvedValue({
        urn: 'user-urn',
        name: 'Test User',
        education: [],
      });
      mockLeadModel.findOne.mockResolvedValue(null);

      await service.processPost('post-id');

      expect(mockPostModel.findByIdAndUpdate).toHaveBeenCalledWith('post-id', {
        status: 'processing',
      });
      expect(mockLinkedInProvider.extractPostData).toHaveBeenCalled();
      expect(mockLinkedInProvider.extractEngagements).toHaveBeenCalled();
    });

    it('should handle post not found', async () => {
      mockPostModel.findById.mockResolvedValue(null);

      await expect(service.processPost('invalid-id')).rejects.toThrow(
        'Post not found',
      );
    });
  });
});
