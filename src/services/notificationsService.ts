// =============================================================================
// SplitBliz — Notifications service
// Bounded context: Notification
// Endpoints: /notifications
// =============================================================================

import apiClient from './apiClient';
import { Notification, PaginationResponse } from '../types';

export const notificationsService = {

  async getNotifications(
    params?: { cursor?: string; limit?: number }
  ): Promise<{ notifications: Notification[]; pagination: PaginationResponse }> {
    const res = await apiClient.get('/notifications', { params });
    const data = res.data ?? {};
    const notifications = data.notifications ?? data.items ?? [];
    return { notifications, pagination: data.pagination };
  },

  async markAsRead(notificationId: string): Promise<void> {
    await apiClient.patch(`/notifications/${notificationId}/read`);
  },

  async markAllAsRead(): Promise<void> {
    await apiClient.post('/notifications/read-all');
  },

  async registerFcmToken(token: string): Promise<void> {
    await apiClient.post('/notifications/fcm-token', { token });
  },
};
