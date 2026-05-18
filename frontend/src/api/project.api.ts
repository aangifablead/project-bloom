import { apiClient } from './index'; // Targets your http://localhost:5000/api configuration
import { Project, User } from '@/types';

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
export interface ProjectMember {
  userId: string;
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

export const projectApi = {
  /**
   * Get all projects
   * GET /projects
  */
 getAll: async (filters?: { status?: string; search?: string }): Promise<Project[]> => {
    return apiClient.get('/projects', { params: filters }).then(res => res.data?.data ?? res.data);
  },

  /**
   * Get single project by ID
   * GET /projects/:id
   */
  getById: async (id: string): Promise<Project> => {
    return apiClient.get(`/projects/${id}`).then(res => res.data?.data ?? res.data);
  },

  /**
   * Create new project
   * POST /projects
   */
  create: async (data: CreateProjectRequest): Promise<Project> => {
    return apiClient.post('/projects', data).then(res => res.data?.data ?? res.data);
  },
  
  /**
   * Update project
   * PATCH /projects/:id
   */
  update: async (id: string, data: UpdateProjectRequest): Promise<Project> => {
    return apiClient.patch(`/projects/${id}`, data).then(res => res.data?.data ?? res.data);
  },

  /**
   * Delete project
   * DELETE /projects/:id
   */
  delete: async (id: string): Promise<void> => {
    return apiClient.delete(`/projects/${id}`).then(res => res.data);
  },

  /**
   * Archive project
   * POST /projects/:id/archive
   */
  archive: async (id: string): Promise<Project> => {
    return apiClient.post(`/projects/${id}/archive`).then(res => res.data?.data ?? res.data);
  },

  /**
   * Restore archived project
   * POST /projects/:id/restore
   */
  restore: async (id: string): Promise<Project> => {
    return apiClient.post(`/projects/${id}/restore`).then(res => res.data?.data ?? res.data);
  },

  /**
   * Clone project
   * POST /projects/:id/clone
   */
  clone: async (id: string, name: string): Promise<Project> => {
    return apiClient.post(`/projects/${id}/clone`, { name }).then(res => res.data?.data ?? res.data);
  },

  /**
   * Get project members
   * GET /projects/:id/members
   */
  getMembers: async (id: string): Promise<User[]> => {
    return apiClient.get(`/projects/${id}/members`).then(res => res.data?.data ?? res.data);
  },

  /**
   * Add member to project
   * POST /projects/:id/members
   */
  addMember: async (projectId: string, data: ProjectMember): Promise<User> => {
    return apiClient.post(`/projects/${projectId}/members`, data).then(res => res.data?.data ?? res.data);
  },

  /**
   * Remove member from project
   * DELETE /projects/:id/members/:userId
   */
  removeMember: async (projectId: string, userId: string): Promise<void> => {
    return apiClient.delete(`/projects/${projectId}/members/${userId}`).then(res => res.data);
  },

  /**
   * Update member role
   * PATCH /projects/:id/members/:userId
   */
  updateMemberRole: async (projectId: string, userId: string, role: ProjectMember['role']): Promise<User> => {
    return apiClient.patch(`/projects/${projectId}/members/${userId}`, { role }).then(res => res.data?.data ?? res.data);
  },

  /**
   * Get project templates
   * GET /projects/templates
   */
  getTemplates: async (): Promise<ProjectTemplate[]> => {
    return apiClient.get('/projects/templates').then(res => res.data?.data ?? res.data);
  },

  /**
   * Create project from template
   * POST /projects/from-template
   */
  createFromTemplate: async (templateId: string, name: string): Promise<Project> => {
    return apiClient.post('/projects/from-template', { templateId, name }).then(res => res.data?.data ?? res.data);
  },

  /**
   * Get project milestones
   * GET /projects/:id/milestones
   */
  getMilestones: async (projectId: string): Promise<Milestone[]> => {
    return apiClient.get(`/projects/${projectId}/milestones`).then(res => res.data?.data ?? res.data);
  },

  /**
   * Create milestone
   * POST /projects/:id/milestones
   */
  createMilestone: async (projectId: string, data: Omit<Milestone, 'id' | 'projectId'>): Promise<Milestone> => {
    return apiClient.post(`/projects/${projectId}/milestones`, data).then(res => res.data?.data ?? res.data);
  },

  /**
   * Update milestone
   * PATCH /projects/:id/milestones/:milestoneId
   */
  updateMilestone: async (projectId: string, milestoneId: string, data: Partial<Milestone>): Promise<Milestone> => {
    return apiClient.patch(`/projects/${projectId}/milestones/${milestoneId}`, data).then(res => res.data?.data ?? res.data);
  },

  /**
   * Delete milestone
   * DELETE /projects/:id/milestones/:milestoneId
   */
  deleteMilestone: async (projectId: string, milestoneId: string): Promise<void> => {
    return apiClient.delete(`/projects/${projectId}/milestones/${milestoneId}`).then(res => res.data);
  },
};