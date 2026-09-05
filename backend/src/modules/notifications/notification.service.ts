import { prisma } from '../../config/database';
import { NotFoundError } from '../../common/errors/AppError';
import { NotificationType } from '@prisma/client';

export class NotificationService {
  async getUserNotifications(userId: string) {
    const [notifications, unreadCount] = await Promise.all([
      prisma.notification.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: 30,
      }),
      prisma.notification.count({
        where: { userId, isRead: false },
      }),
    ]);

    return {
      notifications,
      unreadCount,
    };
  }

  async markAsRead(notificationId: string, userId: string) {
    const notif = await prisma.notification.findFirst({
      where: { id: notificationId, userId },
    });

    if (!notif) {
      throw new NotFoundError('Notification not found');
    }

    return prisma.notification.update({
      where: { id: notificationId },
      data: { isRead: true, readAt: new Date() },
    });
  }

  async markAllAsRead(userId: string) {
    await prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true, readAt: new Date() },
    });
    return { success: true };
  }

  async createNotification(
    userId: string,
    type: NotificationType,
    title: string,
    message: string,
    linkUrl?: string
  ) {
    return prisma.notification.create({
      data: {
        userId,
        type,
        title,
        message,
        linkUrl,
      },
    });
  }

  async getNotificationById(notificationId: string, userId: string) {
    const notif = await prisma.notification.findFirst({
      where: { id: notificationId, userId },
    });

    if (!notif) {
      throw new NotFoundError('Notification not found');
    }

    return notif;
  }
}

export const notificationService = new NotificationService();
