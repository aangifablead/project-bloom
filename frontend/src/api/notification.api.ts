import { apiClient } from './index';
import { Notification } from '@/types';
import { mockService } from '@/services/mock.service';

// TODO: Replace mock calls with actual API endpoints when backend is ready

export interface NotificationPreferences {
  email: {
    taskAssigned: boolean;
    taskCompleted: boolean;
    commentAdded: boolean;
    mention: boolean;
    projectUpdates: boolean;
    deadlineReminders: boolean;
  };
  push: {
    taskAssigned: boolean;
    taskCompleted: boolean;
    commentAdded: boolean;
    mention: boolean;
    projectUpdates: boolean;
    deadlineReminders: boolean;
  };
  inApp: {
    taskAssigned: boolean;
    taskCompleted: boolean;
    commentAdded: boolean;
    mention: boolean;
    projectUpdates: boolean;
    deadlineReminders: boolean;
  };
}

export const notificationApi = {
  /**
   * Get all notifications
   * GET /notifications
   */
  getAll: async (filters?: { unreadOnly?: boolean; limit?: number }): Promise<Notification[]> => {
    // TODO: Replace with actual API call
    // return apiClient.get('/notifications', { params: filters }).then(res => res.data);
    return mockService.notifications.getAll(filters);
  },

  /**
   * Get unread count
   * GET /notifications/unread-count
   */
  getUnreadCount: async (): Promise<number> => {
    // TODO: Replace with actual API call
    // return apiClient.get('/notifications/unread-count').then(res => res.data.count);
    return mockService.notifications.getUnreadCount();
  },

  /**
   * Mark notification as read
   * PATCH /notifications/:id/read
   */
  markAsRead: async (id: string): Promise<void> => {
    // TODO: Replace with actual API call
    // return apiClient.patch(`/notifications/${id}/read`);
    return mockService.notifications.markAsRead(id);
  },

  /**
   * Mark all notifications as read
   * POST /notifications/mark-all-read
   */
  markAllAsRead: async (): Promise<void> => {
    // TODO: Replace with actual API call
    // return apiClient.post('/notifications/mark-all-read');
    return mockService.notifications.markAllAsRead();
  },

  /**
   * Delete notification
   * DELETE /notifications/:id
   */
  delete: async (id: string): Promise<void> => {
    // TODO: Replace with actual API call
    // return apiClient.delete(`/notifications/${id}`);
    return mockService.notifications.delete(id);
  },

  /**
   * Clear all notifications
   * DELETE /notifications
   */
  clearAll: async (): Promise<void> => {
    // TODO: Replace with actual API call
    // return apiClient.delete('/notifications');
    return mockService.notifications.clearAll();
  },

  /**
   * Get notification preferences
   * GET /notifications/preferences
   */
  getPreferences: async (): Promise<NotificationPreferences> => {
    // TODO: Replace with actual API call
    // return apiClient.get('/notifications/preferences').then(res => res.data);
    return mockService.notifications.getPreferences();
  },

  /**
   * Update notification preferences
   * PATCH /notifications/preferences
   */
  updatePreferences: async (preferences: Partial<NotificationPreferences>): Promise<NotificationPreferences> => {
    // TODO: Replace with actual API call
    // return apiClient.patch('/notifications/preferences', preferences).then(res => res.data);
    return mockService.notifications.updatePreferences(preferences);
  },

  /**
   * Subscribe to push notifications
   * POST /notifications/push/subscribe
   */
  subscribeToPush: async (subscription: PushSubscription): Promise<void> => {
    // TODO: Replace with actual API call
    // return apiClient.post('/notifications/push/subscribe', subscription);
    return mockService.notifications.subscribeToPush(subscription);
  },

  /**
   * Unsubscribe from push notifications
   * POST /notifications/push/unsubscribe
   */
  unsubscribeFromPush: async (): Promise<void> => {
    // TODO: Replace with actual API call
    // return apiClient.post('/notifications/push/unsubscribe');
    return mockService.notifications.unsubscribeFromPush();
  },
};
