import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { LeadsService } from './leads.service';
import { Lead } from './schemas/lead.schema';

describe('LeadsService', () => {
  let service: LeadsService;
  let mockLeadModel: {
    find: jest.Mock;
    updateMany: jest.Mock;
  };

  beforeEach(async () => {
    mockLeadModel = {
      find: jest.fn(),
      updateMany: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LeadsService,
        {
          provide: getModelToken(Lead.name),
          useValue: mockLeadModel,
        },
      ],
    }).compile();

    service = module.get<LeadsService>(LeadsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findByPost', () => {
    it('should return leads for a post', async () => {
      const mockLeads = [
        { _id: 'lead-1', name: 'Test User', matchScore: 85 },
        { _id: 'lead-2', name: 'Another User', matchScore: 70 },
      ];

      mockLeadModel.find.mockReturnValue({
        sort: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(mockLeads),
        }),
      });

      const result = await service.findByPost('post-id', 'user-id');

      expect(result).toEqual(mockLeads);
      expect(mockLeadModel.find).toHaveBeenCalledWith({
        postId: 'post-id',
        userId: 'user-id',
      });
    });

    it('should apply filters correctly', async () => {
      const filters = {
        country: 'United States',
        university: 'Stanford',
        role: 'Engineer',
      };

      mockLeadModel.find.mockReturnValue({
        sort: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue([]),
        }),
      });

      await service.findByPost('post-id', 'user-id', filters);

      expect(mockLeadModel.find).toHaveBeenCalledWith({
        postId: 'post-id',
        userId: 'user-id',
        'location.country': expect.any(RegExp),
        'education.institution': expect.any(RegExp),
        $or: expect.any(Array),
      });
    });
  });

  describe('getStats', () => {
    it('should calculate statistics correctly', async () => {
      const mockLeads = [
        { engagementType: 'comment', matchScore: 80 },
        { engagementType: 'like', matchScore: 60 },
        { engagementType: 'comment', matchScore: 90 },
      ];

      mockLeadModel.find.mockResolvedValue(mockLeads);

      const result = await service.getStats('post-id', 'user-id');

      expect(result).toEqual({
        total: 3,
        byEngagementType: {
          comment: 2,
          like: 1,
        },
        averageScore: 76.66666666666667, // (80 + 60 + 90) / 3
      });
    });
  });
});
