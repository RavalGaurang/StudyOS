import { Request, Response } from 'express';
import { analyticsService } from './analytics.service';
import { sendSuccess } from '../../common/utils/responseFormatter';
import { UnauthorizedError } from '../../common/errors/AppError';

export class AnalyticsController {
  async getStudentDashboard(req: Request, res: Response) {
    const studentId = req.user?.profileId;
    if (!studentId) {
      throw new UnauthorizedError('Student profile not found');
    }
    const data = await analyticsService.getStudentDashboardStats(studentId);
    return sendSuccess(res, 'Student dashboard analytics retrieved', data);
  }

  async getAdminStats(req: Request, res: Response) {
    const stats = await analyticsService.getAdminStats();
    return sendSuccess(res, 'System platform metrics retrieved', stats);
  }
}

export const analyticsController = new AnalyticsController();
