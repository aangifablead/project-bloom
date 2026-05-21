import { apiClient } from './index';
import { Project, User } from '@/types';

// --- Interfaces ---

export interface CreateProjectRequest {
  name: string;
  description?: string;
  color?: string;
  startDate?: string;
  endDate?: string;
  templateId?: string;
}

export interface UpdateProjectRequest {
  name?: string;
  description?: string;
  status?: Project['status'];
  color?: string;
  startDate?: string;
  endDate?: string;
}

// In your types/api file
export interface ProjectMember {
  userId: string; // Changed from 'user' to 'userId'
  role: 'owner' | 'admin' | 'member' | 'viewer';
}
export interface ProjectTemplate {
  id: string;
  name: string;
  description: string;
  tasksCount: number;
  category: string;
}

export interface Milestone {
  id: string;
  name: string;
  description?: string;
  dueDate: string;
  status: 'pending' | 'in-progress' | 'completed';
  projectId: string;
}

// --- Helper ---

/**
 * Standardizes API responses
 * Assumes common format: { data: T } or just T
 */
const handleResponse = <T>(res: any): T => res.data?.data ?? res.data;

// --- API Service ---

export const projectApi = {
  // --- Projects ---
  getAll: async (filters?: { status?: string; search?: string }): Promise<Project[]> =>
    handleResponse(await apiClient.get('/projects', { params: filters })),

  getById: async (id: string): Promise<Project> =>
    handleResponse(await apiClient.get(`/projects/${id}`)),

  create: async (data: CreateProjectRequest): Promise<Project> =>
    handleResponse(await apiClient.post('/projects', data)),

  update: async (id: string, data: UpdateProjectRequest): Promise<Project> =>
    handleResponse(await apiClient.patch(`/projects/${id}`, data)),

  delete: async (id: string): Promise<void> =>
    await apiClient.delete(`/projects/${id}`),

  archive: async (id: string): Promise<Project> =>
    handleResponse(await apiClient.post(`/projects/${id}/archive`)),

  restore: async (id: string): Promise<Project> =>
    handleResponse(await apiClient.post(`/projects/${id}/restore`)),

  clone: async (id: string, name: string): Promise<Project> =>
    handleResponse(await apiClient.post(`/projects/${id}/clone`, { name })),

  // --- Members ---
  getMembers: async (id: string): Promise<User[]> =>
    handleResponse(await apiClient.get(`/projects/${id}/members`)),

  addMember: async (projectId: string, data: ProjectMember): Promise<User> =>
    handleResponse(await apiClient.post(`/projects/${projectId}/members`, data)),

  removeMember: async (projectId: string, userId: string): Promise<void> =>
    await apiClient.delete(`/projects/${projectId}/members/${userId}`),

  updateMemberRole: async (projectId: string, userId: string, role: ProjectMember['role']): Promise<User> =>
    handleResponse(await apiClient.patch(`/projects/${projectId}/members/${userId}`, { role })),

  // --- Templates ---
  getTemplates: async (): Promise<ProjectTemplate[]> =>
    handleResponse(await apiClient.get('/projects/templates')),

  createFromTemplate: async (templateId: string, name: string): Promise<Project> =>
    handleResponse(await apiClient.post('/projects/from-template', { templateId, name })),

  // --- Milestones ---
  getMilestones: async (projectId: string): Promise<Milestone[]> =>
    handleResponse(await apiClient.get(`/projects/${projectId}/milestones`)),

  createMilestone: async (projectId: string, data: Omit<Milestone, 'id' | 'projectId'>): Promise<Milestone> =>
    handleResponse(await apiClient.post(`/projects/${projectId}/milestones`, data)),

  updateMilestone: async (projectId: string, milestoneId: string, data: Partial<Milestone>): Promise<Milestone> =>
    handleResponse(await apiClient.patch(`/projects/${projectId}/milestones/${milestoneId}`, data)),

  deleteMilestone: async (projectId: string, milestoneId: string): Promise<void> =>
    await apiClient.delete(`/projects/${projectId}/milestones/${milestoneId}`),
};