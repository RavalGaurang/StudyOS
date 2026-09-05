import { apiClient } from '../lib/api/axios';
import { ApiResponse } from '../types/api.types';

export interface NotificationItem {
  id: string;
  userId: string;
  type: string;
  title: string;
  message: string;
  linkUrl?: string | null;
  isRead: boolean;
  readAt?: string | null;
  createdAt: string;
}

export const notificationService = {
  async getNotifications(): Promise<{ notifications: NotificationItem[]; unreadCount: number }> {
    const res = await apiClient.get<ApiResponse<{ notifications: NotificationItem[]; unreadCount: number }>>(
      '/notifications'
    );
    return res.data.data!;
  },

  async getNotificationById(id: string): Promise<NotificationItem> {
    const res = await apiClient.get<ApiResponse<{ notification: NotificationItem }>>(`/notifications/${id}`);
    return res.data.data!.notification;
  },

  async markAsRead(id: string): Promise<void> {
    await apiClient.patch(`/notifications/${id}/read`);
  },

  async markAllAsRead(): Promise<void> {
    await apiClient.post('/notifications/read-all');
  },
};
