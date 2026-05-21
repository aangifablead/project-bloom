// Core types for the Project Management System
export interface User {
  id: string;          // 🟢 Changed from _id to id to match your API JSON
  _id?: string;        // Optional fallback just in case other endpoints use it
  name: string;
  email: string;
  avatar?: string;
  role: 'admin' | 'manager' | 'member';
  isTwoFactorEnabled?: boolean;
  createdAt: string;
  status?: 'active' | 'pending';
}
export interface Project {
  id: string;
  _id?: string;
  name: string;
  description: string;
  status: 'active' | 'completed' | 'on-hold' | 'archived';
  progress: number;
  startDate: string;
  endDate?: string;
  members: User[];
  createdBy: User;
  tasksCount: number;
  completedTasksCount: number;
  color: string;
  createdAt: string;
  updatedAt: string;
}

export interface Task {
  id: string; // Keep this for frontend convenience
  _id: string; // The database primary key
  title: string;
  description?: string;
  status: 'backlog' | 'todo' | 'in-progress' | 'review' | 'done';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  projectId: string;
  assigneeId?: User | null;
  reporter?: User;
  dueDate?: string;
  labels: Label[];
  subtasks: Subtask[];
  comments: Comment[];
  attachments: Attachment[];
  createdAt: string;
  updatedAt: string;
}
export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
}

export interface Label {
  id: string;
  name: string;
  color: string;
}

export interface Comment {
  id: string;
  content: string;
  author: User;
  createdAt: string;
  mentions: string[];
}

export interface Attachment {
  id: string;
  name: string;
  url: string;
  type: string;
  size: number;
  uploadedBy: User;
  uploadedAt: string;
}

export interface Notification {
  id: string;
  type: 'task_assigned' | 'comment_added' | 'mention' | 'deadline' | 'project_update';
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  link?: string;
}

export interface Activity {
  _id?: string;
  id?: string;

  action: string;
  message?: string;

  field?: string;
  oldValue?: string;
  newValue?: string;

  createdAt: string;

  taskId: {
    _id: string;
    title: string;
  };

  userId?: {
    _id: string;
    name: string;
    avatar?: string;
  };
}
export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface DashboardStats {
  totalTasks: number;
  completedTasks: number;
  overdueTasks: number;
  totalProjects: number;
  completionRate: number;
  tasksByStatus: { status: string; count: number }[];
  tasksByPriority: { priority: string; count: number }[];
  recentActivity: Activity[]; // Now both are perfectly synchronized
}
