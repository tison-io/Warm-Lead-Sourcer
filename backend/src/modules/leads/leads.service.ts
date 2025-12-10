import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, FilterQuery } from 'mongoose';
import { Lead, LeadDocument } from './schemas/lead.schema';
import {
  FilterPreset,
  FilterPresetDocument,
} from './schemas/filter-preset.schema';
import { LeadFilterDto } from './dto/lead-filter.dto';
import { CreateFilterPresetDto } from './dto/create-filter-preset.dto';

interface LeadStats {
  total: number;
  byEngagementType: Record<string, number>;
  averageScore: number;
}

@Injectable()
export class LeadsService {
  private readonly DEFAULT_LIMIT = 100;
  private readonly DEFAULT_SORT_BY = 'matchScore';
  private readonly DEFAULT_SORT_ORDER = -1;

  constructor(
    @InjectModel(Lead.name) private readonly leadModel: Model<LeadDocument>,
    @InjectModel(FilterPreset.name)
    private readonly filterPresetModel: Model<FilterPresetDocument>,
  ) {}

  async findByPost(
    postId: string,
    userId: string,
    filters?: LeadFilterDto,
  ): Promise<Lead[]> {
    const query = this.buildQuery(
      { postId, userId, deletedAt: { $exists: false } },
      filters,
    );
    const { sort, limit, skip } = this.buildPaginationOptions(filters);

    return this.leadModel.find(query).sort(sort).limit(limit).skip(skip).exec();
  }

  private buildQuery(
    baseQuery: FilterQuery<Lead>,
    filters?: LeadFilterDto,
  ): FilterQuery<Lead> {
    const query: FilterQuery<Lead> = { ...baseQuery };

    if (!filters) return query;

    this.applyLocationFilter(query, filters);
    this.applyUniversityFilter(query, filters);
    this.applyRoleFilter(query, filters);
    this.applySearchFilter(query, filters);
    this.applyScoreRangeFilter(query, filters);
    this.applyEngagementTypeFilter(query, filters);
    this.applyTagsFilter(query, filters);

    return query;
  }

  private applyLocationFilter(
    query: FilterQuery<Lead>,
    filters: LeadFilterDto,
  ): void {
    if (filters.country) {
      query['location.country'] = new RegExp(
        this.escapeRegex(filters.country),
        'i',
      );
    }
  }

  private applyUniversityFilter(
    query: FilterQuery<Lead>,
    filters: LeadFilterDto,
  ): void {
    if (filters.university) {
      query['education.institution'] = new RegExp(
        this.escapeRegex(filters.university),
        'i',
      );
    }
  }

  private applyRoleFilter(
    query: FilterQuery<Lead>,
    filters: LeadFilterDto,
  ): void {
    if (filters.role) {
      const roleRegex = new RegExp(this.escapeRegex(filters.role), 'i');
      query.$or = [{ headline: roleRegex }, { 'experience.title': roleRegex }];
    }
  }

  private applySearchFilter(
    query: FilterQuery<Lead>,
    filters: LeadFilterDto,
  ): void {
    if (filters.search) {
      const searchRegex = new RegExp(this.escapeRegex(filters.search), 'i');
      query.$and = query.$and || [];
      (query.$and as any[]).push({
        $or: [
          { name: searchRegex },
          { headline: searchRegex },
          { 'location.country': searchRegex },
          { 'location.city': searchRegex },
          { 'education.institution': searchRegex },
          { 'education.fieldOfStudy': searchRegex },
          { 'experience.company': searchRegex },
          { 'experience.title': searchRegex },
        ],
      });
    }
  }

  private applyScoreRangeFilter(
    query: FilterQuery<Lead>,
    filters: LeadFilterDto,
  ): void {
    if (filters.minScore !== undefined || filters.maxScore !== undefined) {
      const scoreQuery: { $gte?: number; $lte?: number } = {};
      if (filters.minScore !== undefined) {
        scoreQuery.$gte = filters.minScore;
      }
      if (filters.maxScore !== undefined) {
        scoreQuery.$lte = filters.maxScore;
      }
      query.matchScore = scoreQuery;
    }
  }

  private applyEngagementTypeFilter(
    query: FilterQuery<Lead>,
    filters: LeadFilterDto,
  ): void {
    if (filters.engagementType) {
      query.engagementType = filters.engagementType;
    }
  }

  private applyTagsFilter(
    query: FilterQuery<Lead>,
    filters: LeadFilterDto,
  ): void {
    if (filters.tags) {
      const tagArray = filters.tags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean);
      if (tagArray.length > 0) {
        query.tags = { $in: tagArray };
      }
    }
  }

  private buildPaginationOptions(filters?: LeadFilterDto) {
    const sortBy = filters?.sortBy || this.DEFAULT_SORT_BY;
    const sortOrder =
      (filters?.sortOrder as string) === 'asc' ? 1 : this.DEFAULT_SORT_ORDER;
    const sort: Record<string, 1 | -1> = { [sortBy]: sortOrder };
    const limit = filters?.limit || this.DEFAULT_LIMIT;
    const skip = filters?.skip || 0;

    return { sort, limit, skip };
  }

  private escapeRegex(str: string): string {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  async getStats(postId: string, userId: string): Promise<LeadStats> {
    const leads = await this.leadModel
      .find({ postId, userId, deletedAt: { $exists: false } })
      .exec();

    if (leads.length === 0) {
      return {
        total: 0,
        byEngagementType: {},
        averageScore: 0,
      };
    }

    const byEngagementType = leads.reduce(
      (acc, lead) => {
        acc[lead.engagementType] = (acc[lead.engagementType] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );

    const totalScore = leads.reduce((sum, lead) => sum + lead.matchScore, 0);
    const averageScore = Math.round((totalScore / leads.length) * 100) / 100;

    return {
      total: leads.length,
      byEngagementType,
      averageScore,
    };
  }

  async markAsExported(leadIds: string[]): Promise<void> {
    await this.leadModel.updateMany(
      { _id: { $in: leadIds } },
      { exported: true },
    );
  }

  async updateTags(
    leadId: string,
    userId: string,
    tags: string[],
  ): Promise<Lead> {
    const lead = await this.leadModel
      .findOneAndUpdate({ _id: leadId, userId }, { tags }, { new: true })
      .exec();

    if (!lead) {
      throw new NotFoundException(`Lead with ID ${leadId} not found`);
    }

    return lead;
  }

  async searchAll(userId: string, filters: LeadFilterDto): Promise<Lead[]> {
    const query = this.buildQuery(
      { userId, deletedAt: { $exists: false } },
      filters,
    );
    const { sort, limit, skip } = this.buildPaginationOptions(filters);

    return this.leadModel.find(query).sort(sort).limit(limit).skip(skip).exec();
  }

  async saveFilterPreset(
    userId: string,
    dto: CreateFilterPresetDto,
  ): Promise<FilterPreset> {
    return this.filterPresetModel.create({ userId, ...dto });
  }

  async getFilterPresets(userId: string): Promise<FilterPreset[]> {
    return this.filterPresetModel.find({ userId }).exec();
  }

  async deleteFilterPreset(presetId: string, userId: string): Promise<void> {
    const result = await this.filterPresetModel
      .deleteOne({ _id: presetId, userId })
      .exec();

    if (result.deletedCount === 0) {
      throw new NotFoundException(
        `Filter preset with ID ${presetId} not found`,
      );
    }
  }
}
