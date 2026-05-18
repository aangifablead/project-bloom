import { apiClient } from './index';
import { Task, User, Comment, Attachment, Subtask, Label } from '@/types';
import { mockService } from '@/services/mock.service';

// TODO: Replace mock calls with actual API endpoints when backend is ready

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
   * GET /tasks
   */
  getAll: async (filters?: TaskFilters): Promise<Task[]> => {
    // TODO: Replace with actual API call
    // return apiClient.get('/tasks', { params: filters }).then(res => res.data);
    return mockService.tasks.getAll(filters);
  },

  /**
   * Get single task by ID
   * GET /tasks/:id
   */
  getById: async (id: string): Promise<Task> => {
    // TODO: Replace with actual API call
    // return apiClient.get(`/tasks/${id}`).then(res => res.data);
    return mockService.tasks.getById(id);
  },

  /**
   * Create new task
   * POST /tasks
   */
  create: async (data: CreateTaskRequest): Promise<Task> => {
    // TODO: Replace with actual API call
    // return apiClient.post('/tasks', data).then(res => res.data);
    const { labelIds, ...rest } = data;
    return mockService.tasks.create(rest);
  },

  /**
   * Update task
   * PATCH /tasks/:id
   */
  update: async (id: string, data: UpdateTaskRequest): Promise<Task> => {
    // TODO: Replace with actual API call
    // return apiClient.patch(`/tasks/${id}`, data).then(res => res.data);
    const { labelIds, ...rest } = data;
    return mockService.tasks.update(id, rest);
  },

  /**
   * Delete task
   * DELETE /tasks/:id
   */
  delete: async (id: string): Promise<void> => {
    // TODO: Replace with actual API call
    // return apiClient.delete(`/tasks/${id}`);
    return mockService.tasks.delete(id);
  },

  /**
   * Update task status
   * PATCH /tasks/:id/status
   */
  updateStatus: async (id: string, status: Task['status']): Promise<Task> => {
    // TODO: Replace with actual API call
    // return apiClient.patch(`/tasks/${id}/status`, { status }).then(res => res.data);
    return mockService.tasks.updateStatus(id, status);
  },

  /**
   * Assign task to user
   * POST /tasks/:id/assign
   */
  assign: async (taskId: string, userId: string): Promise<Task> => {
    // TODO: Replace with actual API call
    // return apiClient.post(`/tasks/${taskId}/assign`, { userId }).then(res => res.data);
    return mockService.tasks.assign(taskId, userId);
  },

  /**
   * Unassign task
   * DELETE /tasks/:id/assign
   */
  unassign: async (taskId: string): Promise<Task> => {
    // TODO: Replace with actual API call
    // return apiClient.delete(`/tasks/${taskId}/assign`).then(res => res.data);
    return mockService.tasks.unassign(taskId);
  },

  /**
   * Bulk update tasks
   * PATCH /tasks/bulk
   */
  bulkUpdate: async (taskIds: string[], data: UpdateTaskRequest): Promise<Task[]> => {
    // TODO: Replace with actual API call
    // return apiClient.patch('/tasks/bulk', { taskIds, ...data }).then(res => res.data);
    const { labelIds, ...rest } = data;
    return mockService.tasks.bulkUpdate(taskIds, rest);
  },

  /**
   * Bulk delete tasks
   * DELETE /tasks/bulk
   */
  bulkDelete: async (taskIds: string[]): Promise<void> => {
    // TODO: Replace with actual API call
    // return apiClient.delete('/tasks/bulk', { data: { taskIds } });
    return mockService.tasks.bulkDelete(taskIds);
  },

  // --- Subtasks ---

  /**
   * Add subtask
   * POST /tasks/:id/subtasks
   */
  addSubtask: async (taskId: string, title: string): Promise<Subtask> => {
    // TODO: Replace with actual API call
    // return apiClient.post(`/tasks/${taskId}/subtasks`, { title }).then(res => res.data);
    return mockService.tasks.addSubtask(taskId, title);
  },

  /**
   * Update subtask
   * PATCH /tasks/:id/subtasks/:subtaskId
   */
  updateSubtask: async (taskId: string, subtaskId: string, data: Partial<Subtask>): Promise<Subtask> => {
    // TODO: Replace with actual API call
    // return apiClient.patch(`/tasks/${taskId}/subtasks/${subtaskId}`, data).then(res => res.data);
    return mockService.tasks.updateSubtask(taskId, subtaskId, data);
  },

  /**
   * Delete subtask
   * DELETE /tasks/:id/subtasks/:subtaskId
   */
  deleteSubtask: async (taskId: string, subtaskId: string): Promise<void> => {
    // TODO: Replace with actual API call
    // return apiClient.delete(`/tasks/${taskId}/subtasks/${subtaskId}`);
    return mockService.tasks.deleteSubtask(taskId, subtaskId);
  },

  // --- Comments ---

  /**
   * Get task comments
   * GET /tasks/:id/comments
   */
  getComments: async (taskId: string): Promise<Comment[]> => {
    // TODO: Replace with actual API call
    // return apiClient.get(`/tasks/${taskId}/comments`).then(res => res.data);
    return mockService.tasks.getComments(taskId);
  },

  /**
   * Add comment
   * POST /tasks/:id/comments
   */
  addComment: async (taskId: string, content: string, mentions?: string[]): Promise<Comment> => {
    // TODO: Replace with actual API call
    // return apiClient.post(`/tasks/${taskId}/comments`, { content, mentions }).then(res => res.data);
    return mockService.tasks.addComment(taskId, content, mentions);
  },

  /**
   * Update comment
   * PATCH /tasks/:id/comments/:commentId
   */
  updateComment: async (taskId: string, commentId: string, content: string): Promise<Comment> => {
    // TODO: Replace with actual API call
    // return apiClient.patch(`/tasks/${taskId}/comments/${commentId}`, { content }).then(res => res.data);
    return mockService.tasks.updateComment(taskId, commentId, content);
  },

  /**
   * Delete comment
   * DELETE /tasks/:id/comments/:commentId
   */
  deleteComment: async (taskId: string, commentId: string): Promise<void> => {
    // TODO: Replace with actual API call
    // return apiClient.delete(`/tasks/${taskId}/comments/${commentId}`);
    return mockService.tasks.deleteComment(taskId, commentId);
  },

  // --- Attachments ---

  /**
   * Get task attachments
   * GET /tasks/:id/attachments
   */
  getAttachments: async (taskId: string): Promise<Attachment[]> => {
    // TODO: Replace with actual API call
    // return apiClient.get(`/tasks/${taskId}/attachments`).then(res => res.data);
    return mockService.tasks.getAttachments(taskId);
  },

  /**
   * Upload attachment
   * POST /tasks/:id/attachments
   */
  uploadAttachment: async (taskId: string, file: File): Promise<Attachment> => {
    // TODO: Replace with actual API call
    // const formData = new FormData();
    // formData.append('file', file);
    // return apiClient.post(`/tasks/${taskId}/attachments`, formData, {
    //   headers: { 'Content-Type': 'multipart/form-data' }
    // }).then(res => res.data);
    return mockService.tasks.uploadAttachment(taskId, file);
  },

  /**
   * Delete attachment
   * DELETE /tasks/:id/attachments/:attachmentId
   */
  deleteAttachment: async (taskId: string, attachmentId: string): Promise<void> => {
    // TODO: Replace with actual API call
    // return apiClient.delete(`/tasks/${taskId}/attachments/${attachmentId}`);
    return mockService.tasks.deleteAttachment(taskId, attachmentId);
  },

  // --- Time Tracking ---

  /**
   * Get time entries for task
   * GET /tasks/:id/time-entries
   */
  getTimeEntries: async (taskId: string): Promise<TaskTimeEntry[]> => {
    // TODO: Replace with actual API call
    // return apiClient.get(`/tasks/${taskId}/time-entries`).then(res => res.data);
    return mockService.tasks.getTimeEntries(taskId);
  },

  /**
   * Start time tracking
   * POST /tasks/:id/time-entries/start
   */
  startTimer: async (taskId: string): Promise<TaskTimeEntry> => {
    // TODO: Replace with actual API call
    // return apiClient.post(`/tasks/${taskId}/time-entries/start`).then(res => res.data);
    return mockService.tasks.startTimer(taskId);
  },

  /**
   * Stop time tracking
   * POST /tasks/:id/time-entries/stop
   */
  stopTimer: async (taskId: string): Promise<TaskTimeEntry> => {
    // TODO: Replace with actual API call
    // return apiClient.post(`/tasks/${taskId}/time-entries/stop`).then(res => res.data);
    return mockService.tasks.stopTimer(taskId);
  },

  /**
   * Add manual time entry
   * POST /tasks/:id/time-entries
   */
  addTimeEntry: async (taskId: string, data: Omit<TaskTimeEntry, 'id' | 'taskId' | 'userId'>): Promise<TaskTimeEntry> => {
    // TODO: Replace with actual API call
    // return apiClient.post(`/tasks/${taskId}/time-entries`, data).then(res => res.data);
    return mockService.tasks.addTimeEntry(taskId, data);
  },

  // --- History ---

  /**
   * Get task history
   * GET /tasks/:id/history
   */
  getHistory: async (taskId: string): Promise<TaskHistory[]> => {
    // TODO: Replace with actual API call
    // return apiClient.get(`/tasks/${taskId}/history`).then(res => res.data);
    return mockService.tasks.getHistory(taskId);
  },

  // --- Labels ---

  /**
   * Get all labels
   * GET /labels
   */
  getLabels: async (): Promise<Label[]> => {
    // TODO: Replace with actual API call
    // return apiClient.get('/labels').then(res => res.data);
    return mockService.tasks.getLabels();
  },

  /**
   * Create label
   * POST /labels
   */
  createLabel: async (data: Omit<Label, 'id'>): Promise<Label> => {
    // TODO: Replace with actual API call
    // return apiClient.post('/labels', data).then(res => res.data);
    return mockService.tasks.createLabel(data);
  },
};
