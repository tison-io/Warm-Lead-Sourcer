import {
  Controller,
  Get,
  Param,
  Query,
  UseGuards,
  Request,
  Patch,
  Body,
  Post,
  Delete,
  HttpCode,
  HttpStatus,
  Res,
} from '@nestjs/common';
import type { Response } from 'express';
import { LeadsService } from './leads.service';
import { LeadFilterDto } from './dto/lead-filter.dto';
import { CreateFilterPresetDto } from './dto/create-filter-preset.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import type { AuthenticatedRequest } from '../auth/interfaces/authenticated-request.interface';
import { ExportService } from '../export/export.service';

@Controller('leads')
@UseGuards(JwtAuthGuard)
export class LeadsController {
  constructor(
    private readonly leadsService: LeadsService,
    private readonly exportService: ExportService,
  ) {}

  @Get()
  async getLeads(
    @Query() filters: LeadFilterDto,
    @Request() req: AuthenticatedRequest,
  ) {
    if (filters.postId) {
      return this.leadsService.findByPost(
        filters.postId,
        req.user.userId,
        filters,
      );
    }
    return this.leadsService.searchAll(req.user.userId, filters);
  }

  @Get('post/:postId')
  async getLeadsByPost(
    @Param('postId') postId: string,
    @Query() filters: LeadFilterDto,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.leadsService.findByPost(postId, req.user.userId, filters);
  }

  @Get('post/:postId/stats')
  async getPostStats(
    @Param('postId') postId: string,
    @Request() req: AuthenticatedRequest,
  ): Promise<{
    total: number;
    byEngagementType: Record<string, number>;
    averageScore: number;
  }> {
    return this.leadsService.getStats(postId, req.user.userId);
  }

  @Get('search')
  async searchLeads(
    @Query() filters: LeadFilterDto,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.leadsService.searchAll(req.user.userId, filters);
  }

  @Patch(':leadId/tags')
  @HttpCode(HttpStatus.OK)
  async updateLeadTags(
    @Param('leadId') leadId: string,
    @Body('tags') tags: string[],
    @Request() req: AuthenticatedRequest,
  ) {
    return this.leadsService.updateTags(leadId, req.user.userId, tags);
  }

  @Post('filter-presets')
  @HttpCode(HttpStatus.CREATED)
  async saveFilterPreset(
    @Body() dto: CreateFilterPresetDto,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.leadsService.saveFilterPreset(req.user.userId, dto);
  }

  @Get('filter-presets')
  async getFilterPresets(@Request() req: AuthenticatedRequest) {
    return this.leadsService.getFilterPresets(req.user.userId);
  }

  @Delete('filter-presets/:presetId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteFilterPreset(
    @Param('presetId') presetId: string,
    @Request() req: AuthenticatedRequest,
  ): Promise<void> {
    await this.leadsService.deleteFilterPreset(presetId, req.user.userId);
  }

  @Get('export')
  async exportLeads(
    @Query() filters: LeadFilterDto,
    @Request() req: AuthenticatedRequest,
    @Res() res: Response,
  ) {
    const leads = filters.postId
      ? await this.leadsService.findByPost(
          filters.postId,
          req.user.userId,
          filters,
        )
      : await this.leadsService.searchAll(req.user.userId, filters);

    const format = filters.format || 'csv';
    const csvData = this.exportService.exportToCSV(leads);

    const filename = `leads-${new Date().toISOString().split('T')[0]}.${format}`;

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(csvData);
  }
}
