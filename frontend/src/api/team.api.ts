import { apiClient } from './index';
import { User, Activity } from '@/types';
import { mockService } from '@/services/mock.service';

// TODO: Replace mock calls with actual API endpoints when backend is ready

export interface InviteMemberRequest {
  email: string;
  role: 'admin' | 'manager' | 'member';
  message?: string;
}

export interface UpdateMemberRequest {
  role?: User['role'];
  name?: string;
}

export interface TeamInvite {
  id: string;
  email: string;
  role: User['role'];
  status: 'pending' | 'accepted' | 'expired';
  invitedBy: User;
  createdAt: string;
  expiresAt: string;
}

export interface WorkloadData {
  userId: string;
  user: User;
  tasksAssigned: number;
  tasksCompleted: number;
  hoursLogged: number;
  workloadPercentage: number;
}

export interface AuditLog {
  id: string;
  action: string;
  userId: string;
  user: User;
  resource: string;
  resourceId: string;
  details: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  createdAt: string;
}

export const teamApi = {
  /**
   * Get all team members
   * GET /team
   */
  getAll: async (): Promise<User[]> => {
    // TODO: Replace with actual API call
    // return apiClient.get('/team').then(res => res.data);
    return mockService.team.getAll();
  },

  /**
   * Get team member by ID
   * GET /team/:id
   */
  getById: async (id: string): Promise<User> => {
    // TODO: Replace with actual API call
    // return apiClient.get(`/team/${id}`).then(res => res.data);
    return mockService.team.getById(id);
  },

  /**
   * Invite new member
   * POST /team/invite
   */
  invite: async (data: InviteMemberRequest): Promise<TeamInvite> => {
    // TODO: Replace with actual API call
    // return apiClient.post('/team/invite', data).then(res => res.data);
    return mockService.team.invite(data);
  },

  /**
   * Get pending invites
   * GET /team/invites
   */
  getInvites: async (): Promise<TeamInvite[]> => {
    // TODO: Replace with actual API call
    // return apiClient.get('/team/invites').then(res => res.data);
    return mockService.team.getInvites();
  },

  /**
   * Resend invite
   * POST /team/invites/:id/resend
   */
  resendInvite: async (inviteId: string): Promise<TeamInvite> => {
    // TODO: Replace with actual API call
    // return apiClient.post(`/team/invites/${inviteId}/resend`).then(res => res.data);
    return mockService.team.resendInvite(inviteId);
  },

  /**
   * Cancel invite
   * DELETE /team/invites/:id
   */
  cancelInvite: async (inviteId: string): Promise<void> => {
    // TODO: Replace with actual API call
    // return apiClient.delete(`/team/invites/${inviteId}`);
    return mockService.team.cancelInvite(inviteId);
  },

  /**
   * Update team member
   * PATCH /team/:id
   */
  update: async (id: string, data: UpdateMemberRequest): Promise<User> => {
    // TODO: Replace with actual API call
    // return apiClient.patch(`/team/${id}`, data).then(res => res.data);
    return mockService.team.update(id, data);
  },

  /**
   * Remove team member
   * DELETE /team/:id
   */
  remove: async (id: string): Promise<void> => {
    // TODO: Replace with actual API call
    // return apiClient.delete(`/team/${id}`);
    return mockService.team.remove(id);
  },

  /**
   * Get team activity logs
   * GET /team/activity
   */
  getActivity: async (filters?: { userId?: string; limit?: number }): Promise<Activity[]> => {
    // TODO: Replace with actual API call
    // return apiClient.get('/team/activity', { params: filters }).then(res => res.data);
    return mockService.team.getActivity(filters);
  },

  /**
   * Get workload data for team
   * GET /team/workload
   */
  getWorkload: async (): Promise<WorkloadData[]> => {
    // TODO: Replace with actual API call
    // return apiClient.get('/team/workload').then(res => res.data);
    return mockService.team.getWorkload();
  },

  /**
   * Get audit logs
   * GET /team/audit-logs
   */
  getAuditLogs: async (filters?: { 
    userId?: string; 
    action?: string; 
    resource?: string;
    startDate?: string;
    endDate?: string;
    limit?: number;
    offset?: number;
  }): Promise<{ logs: AuditLog[]; total: number }> => {
    // TODO: Replace with actual API call
    // return apiClient.get('/team/audit-logs', { params: filters }).then(res => res.data);
    return mockService.team.getAuditLogs(filters);
  },
};
