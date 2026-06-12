import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { DashboardService } from './dashboard.service';
import type { AuthenticatedRequest } from '../auth/interfaces/authenticated-request.interface';

@Controller('dashboard')
@UseGuards(JwtAuthGuard)
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('stats')
  async getDashboardStats(@Request() req: AuthenticatedRequest) {
    return this.dashboardService.getDashboardStats(req.user.userId);
  }

  @Get('recent-activity')
  async getRecentActivity(@Request() req: AuthenticatedRequest) {
    return this.dashboardService.getRecentActivity(req.user.userId);
  }
}
