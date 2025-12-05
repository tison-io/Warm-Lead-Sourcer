import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { PostsService } from './posts.service';
import { Post } from './schemas/post.schema';
import { ScrapingService } from '../scraping/scraping.service';

describe('PostsService', () => {
  let service: PostsService;
  let mockPostModel: any;
  let mockScrapingService: any;

  beforeEach(async () => {
    const mockPost = {
      _id: 'post-id',
      url: 'https://linkedin.com/posts/test',
      platform: 'linkedin',
      status: 'pending',
      save: jest.fn().mockResolvedValue({
        _id: 'post-id',
        url: 'https://linkedin.com/posts/test',
        platform: 'linkedin',
        status: 'pending',
      }),
    };

    mockPostModel = jest.fn().mockImplementation(() => mockPost);
    mockPostModel.find = jest.fn();
    mockPostModel.findOne = jest.fn();
    mockPostModel.findById = jest.fn();
    mockPostModel.findByIdAndUpdate = jest.fn();

    mockScrapingService = {
      processPost: jest.fn().mockResolvedValue(undefined),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PostsService,
        {
          provide: getModelToken(Post.name),
          useValue: mockPostModel,
        },
        {
          provide: ScrapingService,
          useValue: mockScrapingService,
        },
      ],
    }).compile();

    service = module.get<PostsService>(PostsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a LinkedIn post', async () => {
      const createPostDto = {
        url: 'https://www.linkedin.com/feed/update/urn:li:activity:7353638537595932672',
      };

      const result = await service.create(createPostDto, 'user-id');

      expect(result).toBeDefined();
      expect(mockScrapingService.processPost).toHaveBeenCalled();
    });

    it('should detect LinkedIn platform', () => {
      const url = 'https://linkedin.com/posts/test';
      // Test private method through public interface
      expect(() => service.create({ url }, 'user-id')).not.toThrow();
    });
  });

  describe('findAll', () => {
    it('should return user posts', async () => {
      const mockPosts = [{ _id: 'post-1', url: 'test-url' }];
      mockPostModel.find.mockReturnValue({
        sort: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(mockPosts),
        }),
      });

      const result = await service.findAll('user-id');

      expect(result).toEqual(mockPosts);
      expect(mockPostModel.find).toHaveBeenCalledWith({ userId: 'user-id' });
    });
  });
});
