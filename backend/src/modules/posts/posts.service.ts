import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Post, PostDocument } from './schemas/post.schema';
import { CreatePostDto } from './dto/create-post.dto';
import { Platform } from '../../common/interfaces/scraping.interface';
import { ScrapingService } from '../scraping/scraping.service';

@Injectable()
export class PostsService {
  constructor(
    @InjectModel(Post.name) private postModel: Model<PostDocument>,
    private scrapingService: ScrapingService,
  ) {}

  async create(createPostDto: CreatePostDto, userId: string): Promise<Post> {
    const platform = this.detectPlatform(createPostDto.url);
    const postId = this.extractPostId(createPostDto.url, platform);

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30); // 30 days from now

    const post = new this.postModel({
      ...createPostDto,
      platform,
      postId,
      userId,
      status: 'pending',
      expiresAt,
    });

    const savedPost = await post.save();

    // Trigger scraping asynchronously
    void this.scrapingService
      .processPost(savedPost._id.toString())
      .catch((error) => {
        console.error('Scraping failed:', error);
        void this.updateStatus(
          savedPost._id.toString(),
          'failed',
          error.message as string,
        );
      });

    return savedPost;
  }

  async findAll(userId: string): Promise<Post[]> {
    return this.postModel
      .find({ userId, deletedAt: { $exists: false } })
      .sort({ createdAt: -1 })
      .exec();
  }

  async findOne(id: string, userId: string): Promise<Post> {
    const post = await this.postModel
      .findOne({ _id: id, userId, deletedAt: { $exists: false } })
      .exec();
    if (!post) {
      throw new NotFoundException('Post not found');
    }
    return post;
  }

  async process(
    id: string,
    userId: string,
  ): Promise<{ message: string; postId: string }> {
    const post = await this.findOne(id, userId);

    if (post.status === 'processing') {
      return { message: 'Post is already being processed', postId: id };
    }

    if (post.status === 'completed') {
      return { message: 'Post has already been processed', postId: id };
    }

    // Update status to processing
    await this.updateStatus(id, 'processing');

    // Trigger scraping asynchronously
    void this.scrapingService.processPost(id).catch((error) => {
      console.error('Scraping failed:', error);
      void this.updateStatus(id, 'failed', error.message as string);
    });

    return { message: 'Post processing started', postId: id };
  }

  async updateStatus(
    id: string,
    status: string,
    errorMessage?: string,
  ): Promise<Post | null> {
    const updateData: Record<string, any> = { status };

    if (status === 'completed') {
      updateData.processedAt = new Date();
    }

    if (errorMessage) {
      updateData.errorMessage = errorMessage;
    }

    return this.postModel
      .findByIdAndUpdate(id, updateData, { new: true })
      .exec();
  }

  async updateMetrics(
    id: string,
    totalEngagements: number,
    processedEngagements: number,
  ): Promise<Post | null> {
    return this.postModel
      .findByIdAndUpdate(
        id,
        { totalEngagements, processedEngagements },
        { new: true },
      )
      .exec();
  }

  private detectPlatform(url: string): Platform {
    if (url.includes('linkedin.com')) {
      return Platform.LINKEDIN;
    }
    if (url.includes('instagram.com')) {
      return Platform.INSTAGRAM;
    }
    if (url.includes('twitter.com') || url.includes('x.com')) {
      return Platform.TWITTER;
    }

    throw new Error('Unsupported platform');
  }

  private extractPostId(url: string, platform: Platform): string {
    switch (platform) {
      case Platform.LINKEDIN: {
        const patterns = [
          /activity-(\d+)/,
          /posts\/([^?]+)/,
          /urn:li:activity:(\d+)/,
        ];

        for (const pattern of patterns) {
          const match = url.match(pattern);
          if (match) return match[1];
        }
        break;
      }

      default:
        throw new Error(`Post ID extraction not implemented for ${platform}`);
    }

    throw new Error('Could not extract post ID from URL');
  }
}
