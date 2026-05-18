import { apiClient } from './index';
import { DashboardStats, Activity } from '@/types';
import { mockService } from '@/services/mock.service';

// TODO: Replace mock calls with actual API endpoints when backend is ready

export interface ProjectAnalytics {
  projectId: string;
  projectName: string;
  totalTasks: number;
  completedTasks: number;
  overdueTasks: number;
  completionRate: number;
  averageTaskDuration: number; // in hours
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
  /**
   * Get dashboard stats
   * GET /analytics/dashboard
   */
  getDashboardStats: async (): Promise<DashboardStats> => {
    // TODO: Replace with actual API call
    // return apiClient.get('/analytics/dashboard').then(res => res.data);
    return mockService.analytics.getDashboardStats();
  },

  /**
   * Get project analytics
   * GET /analytics/projects/:id
   */
  getProjectAnalytics: async (projectId: string): Promise<ProjectAnalytics> => {
    // TODO: Replace with actual API call
    // return apiClient.get(`/analytics/projects/${projectId}`).then(res => res.data);
    return mockService.analytics.getProjectAnalytics(projectId);
  },

  /**
   * Get all projects analytics
   * GET /analytics/projects
   */
  getAllProjectsAnalytics: async (): Promise<ProjectAnalytics[]> => {
    return mockService.analytics.getAllProjectsAnalytics();
  },

  getTeamProductivity: async (dateRange?: { start: string; end: string }): Promise<TeamProductivity[]> => {
    return mockService.analytics.getTeamProductivity(dateRange);
  },

  getTaskTrends: async (period: 'week' | 'month' | 'quarter'): Promise<{ date: string; completed: number; created: number }[]> => {
    // TODO: Replace with actual API call
    // return apiClient.get('/analytics/tasks/trends', { params: { period } }).then(res => res.data);
    return mockService.analytics.getTaskTrends(period);
  },

  /**
   * Get time reports
   * GET /analytics/time-reports
   */
  getTimeReports: async (filters?: {
    userId?: string;
    projectId?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<TimeReport[]> => {
    // TODO: Replace with actual API call
    // return apiClient.get('/analytics/time-reports', { params: filters }).then(res => res.data);
    return mockService.analytics.getTimeReports(filters);
  },

  /**
   * Get timesheets
   * GET /analytics/timesheets
   */
  getTimesheets: async (filters?: {
    userId?: string;
    status?: Timesheet['status'];
    startDate?: string;
    endDate?: string;
  }): Promise<Timesheet[]> => {
    // TODO: Replace with actual API call
    // return apiClient.get('/analytics/timesheets', { params: filters }).then(res => res.data);
    return mockService.analytics.getTimesheets(filters);
  },

  /**
   * Submit timesheet
   * POST /analytics/timesheets/:id/submit
   */
  submitTimesheet: async (id: string): Promise<Timesheet> => {
    // TODO: Replace with actual API call
    // return apiClient.post(`/analytics/timesheets/${id}/submit`).then(res => res.data);
    return mockService.analytics.submitTimesheet(id);
  },

  /**
   * Approve timesheet
   * POST /analytics/timesheets/:id/approve
   */
  approveTimesheet: async (id: string): Promise<Timesheet> => {
    // TODO: Replace with actual API call
    // return apiClient.post(`/analytics/timesheets/${id}/approve`).then(res => res.data);
    return mockService.analytics.approveTimesheet(id);
  },

  /**
   * Reject timesheet
   * POST /analytics/timesheets/:id/reject
   */
  rejectTimesheet: async (id: string, reason: string): Promise<Timesheet> => {
    // TODO: Replace with actual API call
    // return apiClient.post(`/analytics/timesheets/${id}/reject`, { reason }).then(res => res.data);
    return mockService.analytics.rejectTimesheet(id, reason);
  },

  /**
   * Get recent activity
   * GET /analytics/activity
   */
  getRecentActivity: async (limit?: number): Promise<Activity[]> => {
    // TODO: Replace with actual API call
    // return apiClient.get('/analytics/activity', { params: { limit } }).then(res => res.data);
    return mockService.analytics.getRecentActivity(limit);
  },

  /**
   * Export report
   * GET /analytics/export
   */
  exportReport: async (type: 'tasks' | 'time' | 'productivity', format: 'csv' | 'pdf', filters?: Record<string, any>): Promise<Blob> => {
    // TODO: Replace with actual API call
    // return apiClient.get('/analytics/export', { 
    //   params: { type, format, ...filters },
    //   responseType: 'blob'
    // }).then(res => res.data);
    return mockService.analytics.exportReport(type, format, filters);
  },
};
