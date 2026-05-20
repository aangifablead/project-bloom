import axios from 'axios';
import { apiClient } from './index';
import { Activity, User } from '@/types';

export interface InviteMemberRequest {
  name: string;
  email: string;
  role: User['role'];
}

export interface CreateMemberRequest {
  name: string;
  email: string;
  role: User['role'];
  avatar?: string;
}

export interface UpdateMemberRequest {
  name?: string;
  email?: string;
  role?: User['role'];
  avatar?: string;
}

export interface TeamInvite {
  _id?: string;
  id?: string;
  name: string;
  email: string;
  role: User['role'];
  status: 'pending' | 'accepted' | 'expired';
  createdAt: string;
}

const api = axios.create({
  baseURL: 'http://localhost:5000'
});
export const teamApi = {

  getAll: async (): Promise<User[]> => {
    const response = await apiClient.get('/team');
    return response?.data?.data || [];
  },

  getById: async (id: string): Promise<User> => {
    const response = await apiClient.get(`/team/${id}`);
    return response?.data?.data;
  },

  create: async (data: CreateMemberRequest): Promise<User> => {
    const response = await apiClient.post('/team', data);
    return response?.data?.data;
  },

  update: async (id: string, data: UpdateMemberRequest): Promise<User> => {
    const response = await apiClient.patch(`/team/${id}`, data);
    return response?.data?.data;
  },

  remove: async (id: string): Promise<void> => {
    await apiClient.delete(`/team/${id}`);
  },

  invite: async (data: InviteMemberRequest): Promise<TeamInvite> => {
    const response = await apiClient.post('/team/invite', data);
    return response?.data?.data;
  },

  getInvites: async (): Promise<TeamInvite[]> => {
    const response = await apiClient.get('/team/invites');
    return response?.data?.data || [];
  },

  resendInvite: async (inviteId: string) => {
    const response = await apiClient.post(`/team/invites/${inviteId}/resend`);
    return response?.data;
  },

  cancelInvite: async (inviteId: string) => {
    await apiClient.delete(`/team/invites/${inviteId}`);
  },
  confirmInvite: async (token: string) => {
    return await api.post(`/api/team/accept-invite/${token}`);
  },

  getActivity: async (filters?: { userId?: string; limit?: number }): Promise<Activity[]> => {
    const response = await apiClient.get('/team/activity', {
      params: filters,
    });
    return response?.data?.data || [];
  },

  getWorkload: async () => {
    const response = await apiClient.get('/team/workload');
    return response?.data?.data || [];
  },

  getAuditLogs: async (filters?: {
      userId?: string;
      action?: string;
      resource?: string;
      startDate?: string;
      endDate?: string;
    }
  ) => {
    const response =
      await apiClient.get('/team/audit-logs',{params: filters,});
    return (response?.data || {logs: [], total: 0,}
    );
  },
};