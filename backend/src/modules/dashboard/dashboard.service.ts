import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Post } from '../posts/schemas/post.schema';
import { Lead } from '../leads/schemas/lead.schema';

@Injectable()
export class DashboardService {
  constructor(
    @InjectModel(Post.name) private postModel: Model<Post>,
    @InjectModel(Lead.name) private leadModel: Model<Lead>,
  ) {}

  async getDashboardStats(userId: string) {
    const [totalScrapes, totalLeads, highQualityLeads] = await Promise.all([
      this.postModel.countDocuments({ userId }),
      this.leadModel.countDocuments({ userId }),
      this.leadModel.countDocuments({ userId, matchScore: { $gte: 80 } }),
    ]);

    const avgProcessingTime = await this.getAverageProcessingTime(userId);

    return {
      totalScrapes,
      totalLeads,
      highQualityLeads,
      avgProcessingTime,
    };
  }

  async getRecentActivity(userId: string) {
    const recentPosts = await this.postModel
      .find({ userId })
      .sort({ createdAt: -1 })
      .limit(5)
      .select('url status createdAt processedAt')
      .lean();

    return recentPosts.map((post: any) => ({
      id: post._id,
      type: 'scrape',
      description: `LinkedIn Post Scrape`,
      url: post.url,
      status: post.status,
      timestamp: post.createdAt || new Date(),
      processedAt: post.processedAt,
    }));
  }

  private async getAverageProcessingTime(userId: string): Promise<string> {
    const completedPosts = await this.postModel
      .find({
        userId,
        status: 'completed',
        processingTime: { $exists: true, $gt: 0 },
      })
      .select('processingTime')
      .lean();

    if (completedPosts.length === 0) return '0s';

    const totalTime = completedPosts.reduce((sum, post: any) => {
      return sum + (post.processingTime || 0);
    }, 0);

    const avgTimeSeconds = Math.round(totalTime / completedPosts.length);

    if (avgTimeSeconds < 60) return `${avgTimeSeconds}s`;
    const minutes = Math.floor(avgTimeSeconds / 60);
    const seconds = avgTimeSeconds % 60;
    return `${minutes}m ${seconds}s`;
  }
}
