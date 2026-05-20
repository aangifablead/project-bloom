import { apiClient } from './index';
import { DashboardStats, Activity } from '@/types';

export interface ProjectAnalytics {
  projectId: string;
  projectName: string;
  totalTasks: number;
  completedTasks: number;
  overdueTasks: number;
  completionRate: number;
  averageTaskDuration: number;
  burndownData: { date: string; remaining: number; ideal: number }[];
  velocityData: { week: string; completed: number }[];
}

export interface TeamProductivity {
  userId: string;
  userName: string;
  tasksCompleted: number;
  hoursLogged: number;
  averageCompletionTime: number;
  onTimeDeliveryRate: number;
}

export interface TimeReport {
  userId: string;
  userName: string;
  projectId?: string;
  projectName?: string;
  date: string;
  hoursLogged: number;
  tasks: { taskId: string; taskTitle: string; hours: number }[];
}

export interface Timesheet {
  id: string;
  userId: string;
  weekStartDate: string;
  weekEndDate: string;
  status: 'draft' | 'submitted' | 'approved' | 'rejected';
  totalHours: number;
  entries: TimeReport[];
  submittedAt?: string;
  approvedBy?: string;
  approvedAt?: string;
}

export const analyticsApi = {
  getDashboardStats: async (): Promise<DashboardStats> => {
    const res = await apiClient.get('/analytics/dashboard');
    return res.data;
  },

  getProjectAnalytics: async (projectId: string): Promise<ProjectAnalytics> => {
    const res = await apiClient.get(`/analytics/projects/${projectId}`);
    return res.data;
  },

  getAllProjectsAnalytics: async (): Promise<ProjectAnalytics[]> => {
    const res = await apiClient.get('/analytics/projects');
    return res.data;
  },

  getTeamProductivity: async (dateRange?: { start: string; end: string }) => {
    const res = await apiClient.get('/analytics/team/productivity', {
      params: dateRange,
    });
    return res.data;
  },

  getTaskTrends: async (period: 'week' | 'month' | 'quarter') => {
    const res = await apiClient.get('/analytics/tasks/trends', {
      params: { period },
    });
    return res.data;
  },

  getTimeReports: async (filters?: {
    userId?: string;
    projectId?: string;
    startDate?: string;
    endDate?: string;
  }) => {
    const res = await apiClient.get('/analytics/time-reports', {
      params: filters,
    });
    return res.data;
  },

  getTimesheets: async (filters?: {
    userId?: string;
    status?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<Timesheet[]> => {
    const res = await apiClient.get('/analytics/timesheets', {
      params: filters,
    });
    return res.data;
  },

  submitTimesheet: async (id: string) => {
    const res = await apiClient.post(`/analytics/timesheets/${id}/submit`);
    return res.data;
  },

  approveTimesheet: async (id: string) => {
    const res = await apiClient.post(`/analytics/timesheets/${id}/approve`);
    return res.data;
  },

  rejectTimesheet: async (id: string, reason: string) => {
    const res = await apiClient.post(
      `/analytics/timesheets/${id}/reject`,
      { reason }
    );
    return res.data;
  },

  getRecentActivity: async (limit = 20): Promise<Activity[]> => {
    const res = await apiClient.get('/analytics/activity', {
      params: { limit },
    });
    return res.data;
  },

  exportReport: async (
    type: 'tasks' | 'time' | 'productivity',
    format: 'csv' | 'pdf',
    filters?: Record<string, any>
  ): Promise<Blob> => {
    const res = await apiClient.get('/analytics/export', {
      params: { type, format, ...filters },
      responseType: 'blob',
    });

    return res.data;
  },
};