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
} from '@nestjs/common';
import { LeadsService } from './leads.service';
import { LeadFilterDto } from './dto/lead-filter.dto';
import { CreateFilterPresetDto } from './dto/create-filter-preset.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import type { AuthenticatedRequest } from '../auth/interfaces/authenticated-request.interface';

@Controller('leads')
@UseGuards(JwtAuthGuard)
export class LeadsController {
  constructor(private readonly leadsService: LeadsService) {}

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
}
