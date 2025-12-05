import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Lead, LeadDocument } from './schemas/lead.schema';
import { LeadFilterDto } from './dto/lead-filter.dto';

@Injectable()
export class LeadsService {
  constructor(@InjectModel(Lead.name) private leadModel: Model<LeadDocument>) {}

  async findByPost(
    postId: string,
    userId: string,
    filters?: LeadFilterDto,
  ): Promise<Lead[]> {
    const query: Record<string, any> = { postId, userId };

    // Apply filters
    if (filters?.country) {
      query['location.country'] = new RegExp(filters.country, 'i');
    }

    if (filters?.university) {
      query['education.institution'] = new RegExp(filters.university, 'i');
    }

    if (filters?.role) {
      query.$or = [
        { headline: new RegExp(filters.role, 'i') },
        { 'experience.title': new RegExp(filters.role, 'i') },
      ];
    }

    return this.leadModel.find(query).sort({ matchScore: -1 }).exec();
  }

  async getStats(
    postId: string,
    userId: string,
  ): Promise<{
    total: number;
    byEngagementType: Record<string, number>;
    averageScore: number;
  }> {
    const leads = await this.leadModel.find({ postId, userId });

    const stats = {
      total: leads.length,
      byEngagementType: {} as Record<string, number>,
      averageScore: 0,
    };

    if (leads.length === 0) return stats;

    // Count by engagement type
    leads.forEach((lead) => {
      stats.byEngagementType[lead.engagementType] =
        (stats.byEngagementType[lead.engagementType] || 0) + 1;
    });

    // Calculate average score
    stats.averageScore =
      leads.reduce((sum, lead) => sum + lead.matchScore, 0) / leads.length;

    return stats;
  }

  async markAsExported(leadIds: string[]): Promise<void> {
    await this.leadModel.updateMany(
      { _id: { $in: leadIds } },
      { exported: true },
    );
  }
}
