import { Request, Response } from 'express';
import { notificationService } from './notification.service';
import { sendSuccess } from '../../common/utils/responseFormatter';

export class NotificationController {
  async getNotifications(req: Request, res: Response) {
    const result = await notificationService.getUserNotifications(req.user!.id);
    return sendSuccess(res, 'Notifications retrieved successfully', result);
  }

  async markAsRead(req: Request, res: Response) {
    const notification = await notificationService.markAsRead(req.params.id, req.user!.id);
    return sendSuccess(res, 'Notification marked as read', { notification });
  }

  async markAllAsRead(req: Request, res: Response) {
    await notificationService.markAllAsRead(req.user!.id);
    return sendSuccess(res, 'All notifications marked as read');
  }
}

export const notificationController = new NotificationController();
