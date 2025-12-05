import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from './users.service';
import { User } from './schemas/user.schema';
import * as bcrypt from 'bcrypt';

jest.mock('bcrypt', () => ({
  compare: jest.fn(),
}));

describe('UsersService', () => {
  let service: UsersService;
  let mockUserModel: any;
  let mockJwtService: any;

  beforeEach(async () => {
    mockUserModel = {
      findOne: jest.fn(),
      findById: jest.fn(),
      constructor: jest.fn().mockImplementation(() => ({
        save: jest.fn().mockResolvedValue({
          _id: 'user-id',
          email: 'test@example.com',
          firstName: 'Test',
          lastName: 'User',
        }),
      })),
    };

    mockJwtService = {
      signAsync: jest.fn().mockResolvedValue('jwt-token'),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getModelToken(User.name),
          useValue: mockUserModel,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('login', () => {
    it('should return access token for valid credentials', async () => {
      const mockUser = {
        _id: 'user-id',
        email: 'test@example.com',
        password: 'hashedPassword',
        toObject: () => ({ email: 'test@example.com', firstName: 'Test' }),
      };

      mockUserModel.findOne.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await service.login({
        email: 'test@example.com',
        password: 'password123',
      });

      expect(result).toHaveProperty('access_token');
      expect(result).toHaveProperty('user');
      expect(mockJwtService.signAsync).toHaveBeenCalled();
    });

    it('should throw error for invalid credentials', async () => {
      mockUserModel.findOne.mockResolvedValue(null);

      await expect(
        service.login({
          email: 'test@example.com',
          password: 'wrongpassword',
        }),
      ).rejects.toThrow('Invalid email or password');
    });
  });
});
