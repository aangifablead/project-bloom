import { apiClient } from './index';
import { Task, User, Comment, Attachment, Subtask, Label } from '@/types';

export interface CreateTaskRequest {
  title: string;
  description?: string;
  status?: Task['status'];
  priority?: Task['priority'];
  projectId: string;
  assigneeId?: string;
  dueDate?: string;
  labelIds?: string[];
}

export interface UpdateTaskRequest {
  title?: string;
  description?: string;
  status?: Task['status'];
  priority?: Task['priority'];
  assigneeId?: string;
  dueDate?: string;
  labelIds?: string[];
}

export interface TaskFilters {
  projectId?: string;
  status?: Task['status'];
  priority?: Task['priority'];
  assigneeId?: string;
  search?: string;
  dueBefore?: string;
  dueAfter?: string;
}

export interface TaskTimeEntry {
  id: string;
  taskId: string;
  userId: string;
  startTime: string;
  endTime?: string;
  duration: number; // in minutes
  description?: string;
}

export interface TaskHistory {
  id: string;
  taskId: string;
  userId: string;
  action: 'created' | 'updated' | 'status_changed' | 'assigned' | 'commented' | 'attachment_added';
  field?: string;
  oldValue?: string;
  newValue?: string;
  createdAt: string;
  user: User;
}

export const taskApi = {
  /**
   * Get all tasks with optional filters
   * GET /api/tasks
   */
  getAll: async (filters?: TaskFilters): Promise<Task[]> => {
    return apiClient.get('/tasks', { params: filters }).then(res => res.data);
  },

  /**
   * Get single task by ID
   * GET /api/tasks/:id
   */
  getById: async (id: string): Promise<Task> => {
    return apiClient.get(`/tasks/${id}`).then(res => res.data);
  },

  /**
   * Create new task
   * POST /api/tasks
   */
  create: async (data: CreateTaskRequest): Promise<Task> => {
    // Labels array mapped implicitly to match backend schema configuration
    const payload = { ...data, labels: data.labelIds };
    delete payload.labelIds;
    return apiClient.post('/tasks', payload).then(res => res.data.data);
  },

  /**
   * Update task
   * PATCH /api/tasks/:id
   */
  update: async (id: string, data: UpdateTaskRequest): Promise<Task> => {
    const payload = { ...data, ...(data.labelIds && { labels: data.labelIds }) };
    delete payload.labelIds;
    return apiClient.patch(`/tasks/${id}`, payload).then(res => res.data);
  },

  /**
   * Delete task
   * DELETE /api/tasks/:id
   */
  delete: async (id: string): Promise<void> => {
    return apiClient.delete(`/tasks/${id}`).then(res => res.data);
  },

  /**
   * Update task status
   * PATCH /api/tasks/:id/status
   */
  // updateStatus: async (id: string, status: Task['status']): Promise<Task> => {
  //   return apiClient.patch(`/tasks/${id}/status`, { status }).then(res => res.data);
  // },
// src/api/task.api.ts
updateStatus: async (id: string, status: Task['status']): Promise<Task> => {
    return apiClient.patch(`/tasks/${id}/status`, { status }).then(res => res.data);
},
  /**
   * Assign task to user
   * POST /api/tasks/:id/assign
   */
  assign: async (taskId: string, userId: string): Promise<Task> => {
    return apiClient.post(`/tasks/${taskId}/assign`, { userId }).then(res => res.data);
  },

  /**
   * Unassign task
   * DELETE /api/tasks/:id/assign
   */
  unassign: async (taskId: string): Promise<Task> => {
    return apiClient.delete(`/tasks/${taskId}/assign`).then(res => res.data);
  },

  /**
   * Bulk update tasks
   * PATCH /api/tasks/bulk
   */
  bulkUpdate: async (taskIds: string[], data: UpdateTaskRequest): Promise<Task[]> => {
    const payload = { taskIds, ...data, ...(data.labelIds && { labels: data.labelIds }) };
    delete payload.labelIds;
    return apiClient.patch('/tasks/bulk', payload).then(res => res.data);
  },

  /**
   * Bulk delete tasks
   * DELETE /api/tasks/bulk
   */
  bulkDelete: async (taskIds: string[]): Promise<void> => {
    return apiClient.delete('/tasks/bulk', { data: { taskIds } }).then(res => res.data);
  },

  // --- Subtasks ---

  /**
   * Add subtask
   * POST /api/tasks/:id/subtasks
   */
  addSubtask: async (taskId: string, title: string): Promise<Subtask> => {
    return apiClient.post(`/tasks/${taskId}/subtasks`, { title }).then(res => res.data);
  },

  /**
   * Update subtask
   * PATCH /api/tasks/:id/subtasks/:subtaskId
   */
  updateSubtask: async (taskId: string, subtaskId: string, data: Partial<Subtask>): Promise<Subtask> => {
    return apiClient.patch(`/tasks/${taskId}/subtasks/${subtaskId}`, data).then(res => res.data);
  },

  /**
   * Delete subtask
   * DELETE /api/tasks/:id/subtasks/:subtaskId
   */
  deleteSubtask: async (taskId: string, subtaskId: string): Promise<void> => {
    return apiClient.delete(`/tasks/${taskId}/subtasks/${subtaskId}`).then(res => res.data);
  },

  // --- Comments ---

  /**
   * Get task comments
   * GET /api/tasks/:id/comments
   */
  getComments: async (taskId: string): Promise<Comment[]> => {
    return apiClient.get(`/tasks/${taskId}/comments`).then(res => res.data);
  },

  /**
   * Add comment
   * POST /api/tasks/:id/comments
   */
  addComment: async (taskId: string, content: string, mentions?: string[]): Promise<Comment> => {
    return apiClient.post(`/tasks/${taskId}/comments`, { content, mentions }).then(res => res.data);
  },

  /**
   * Update comment
   * PATCH /api/tasks/:id/comments/:commentId
   */
  updateComment: async (taskId: string, commentId: string, content: string): Promise<Comment> => {
    return apiClient.patch(`/tasks/${taskId}/comments/${commentId}`, { content }).then(res => res.data);
  },

  /**
   * Delete comment
   * DELETE /api/tasks/:id/comments/:commentId
   */
  deleteComment: async (taskId: string, commentId: string): Promise<void> => {
    return apiClient.delete(`/tasks/${taskId}/comments/${commentId}`).then(res => res.data);
  },

  // --- Attachments ---

  /**
   * Get task attachments
   * GET /api/tasks/:id/attachments
   */
  getAttachments: async (taskId: string): Promise<Attachment[]> => {
    return apiClient.get(`/tasks/${taskId}/attachments`).then(res => res.data);
  },

  /**
   * Upload attachment
   * POST /api/tasks/:id/attachments
   */
  uploadAttachment: async (taskId: string, file: File): Promise<Attachment> => {
    const formData = new FormData();
    formData.append('file', file);
    return apiClient.post(`/tasks/${taskId}/attachments`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }).then(res => res.data);
  },

  /**
   * Delete attachment
   * DELETE /api/tasks/:id/attachments/:attachmentId
   */
  deleteAttachment: async (taskId: string, attachmentId: string): Promise<void> => {
    return apiClient.delete(`/tasks/${taskId}/attachments/${attachmentId}`).then(res => res.data);
  },

  // --- Time Tracking ---

  /**
   * Get time entries for task
   * GET /api/tasks/:id/time-entries
   */
  getTimeEntries: async (taskId: string): Promise<TaskTimeEntry[]> => {
    return apiClient.get(`/tasks/${taskId}/time-entries`).then(res => res.data);
  },

  /**
   * Start time tracking
   * POST /api/tasks/:id/time-entries/start
   */
  startTimer: async (taskId: string): Promise<TaskTimeEntry> => {
    return apiClient.post(`/tasks/${taskId}/time-entries/start`).then(res => res.data);
  },

  /**
   * Stop time tracking
   * POST /api/tasks/:id/time-entries/stop
   */
  stopTimer: async (taskId: string): Promise<TaskTimeEntry> => {
    return apiClient.post(`/tasks/${taskId}/time-entries/stop`).then(res => res.data);
  },

  /**
   * Add manual time entry
   * POST /api/tasks/:id/time-entries
   */
  addTimeEntry: async (taskId: string, data: Omit<TaskTimeEntry, 'id' | 'taskId' | 'userId'>): Promise<TaskTimeEntry> => {
    return apiClient.post(`/tasks/${taskId}/time-entries`, data).then(res => res.data);
  },

  // --- History ---

  /**
   * Get task history
   * GET /api/tasks/:id/history
   */
  getHistory: async (taskId: string): Promise<TaskHistory[]> => {
    return apiClient.get(`/tasks/${taskId}/history`).then(res => res.data);
  },

  // --- Labels ---

  /**
   * Get all labels
   * GET /api/labels
   */
  getLabels: async (): Promise<Label[]> => {
    return apiClient.get('/labels').then(res => res.data);
  },

  /**
   * Create label
   * POST /api/labels
   */
  createLabel: async (data: Omit<Label, 'id'>): Promise<Label> => {
    return apiClient.post('/labels', data).then(res => res.data);
  },
};