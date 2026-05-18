import axios from 'axios';
import { User, Project, Task, DashboardStats, Notification, Activity } from '@/types';

// Fallback safely to localhost if environment flags aren't fully resolved by Vite proxy
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create axios instance with interceptors
const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      // Only redirect if we aren't already sitting on the landing authentication routes
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);


// --- LIVE API SERVICES ---

// Auth Service
export const authService = {
  login: async (email: string, password: string): Promise<{ user: User; token: string }> => {
    const response = await api.post('/auth/login', { email, password });
    return response.data; // Expects backend to return { user, token } directly
  },

  register: async (name: string, email: string, password: string): Promise<{ user: User; token: string }> => {
    const response = await api.post('/auth/register', { name, email, password });
    return response.data;
  },

  logout: async (): Promise<void> => {
    localStorage.removeItem('token');
  },

  getCurrentUser: async (): Promise<User> => {
    const response = await api.get('/auth/me');
    // Extracts from your backend wrapper structure: { success: true, data: user }
    return response.data.data || response.data; 
  },

  forgotPassword: async (email: string): Promise<void> => {
    await api.post('/auth/forgot-password', { email });
  },

  resetPassword: async (token: string, password: string): Promise<void> => {
    await api.post(`/auth/reset-password/${token}`, { password });
  },
};

// Users Service
export const usersService = {
  getAll: async (): Promise<User[]> => {
    const response = await api.get('/users');
    return response.data.data || response.data;
  },

  getById: async (id: string): Promise<User> => {
    const response = await api.get(`/users/${id}`);
    return response.data.data || response.data;
  },

  updateProfile: async (id: string, updates: Partial<User>): Promise<User> => {
    // If id is generic or mock-leftover, clean it up to use implicit token identification route
    const isOwnProfile = id === '1' || !id || id.length < 10;
    const endpoint = isOwnProfile ? '/users/profile' : `/users/profile/${id}`;
    
    const response = await api.put(endpoint, updates);
    return response.data.data || response.data;
  },
};


// --- MOCK FALLBACK SERVICES (Kept intact so missing pages/dashboards don't crash) ---

const mockUser: User = {
  id: '1',
  name: 'John Doe',
  email: 'john@example.com',
  avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=John',
  role: 'admin',
  createdAt: new Date().toISOString(),
};

const mockUsers: User[] = [
  mockUser,
  { id: '2', name: 'Jane Smith', email: 'jane@example.com', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jane', role: 'manager', createdAt: new Date().toISOString() },
  { id: '3', name: 'Bob Wilson', email: 'bob@example.com', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Bob', role: 'member', createdAt: new Date().toISOString() },
];

const mockProjects: Project[] = [
  {
    id: '1',
    name: 'Website Redesign',
    description: 'Complete overhaul of company website with modern design',
    status: 'active',
    progress: 65,
    startDate: '2024-01-15',
    endDate: '2024-03-30',
    members: mockUsers,
    createdBy: mockUser,
    tasksCount: 24,
    completedTasksCount: 16,
    color: '#6366f1',
    createdAt: '2024-01-15T00:00:00Z',
    updatedAt: new Date().toISOString(),
  },
];

const mockTasks: Task[] = [];
const mockNotifications: Notification[] = [];
const mockActivities: Activity[] = [];
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const projectsService = {
  getAll: async (): Promise<Project[]> => { await delay(600); return mockProjects; },
  getById: async (id: string): Promise<Project | undefined> => { await delay(400); return mockProjects.find((p) => p.id === id); },
  create: async (project: Partial<Project>): Promise<Project> => { await delay(500); return mockProjects[0]; },
  update: async (id: string, updates: Partial<Project>): Promise<Project> => { await delay(400); return mockProjects[0]; },
  delete: async (id: string): Promise<void> => { await delay(400); },
};

export const tasksService = {
  getAll: async (projectId?: string): Promise<Task[]> => { await delay(500); return mockTasks; },
  getById: async (id: string): Promise<Task | undefined> => { await delay(300); return mockTasks.find((t) => t.id === id); },
  create: async (task: Partial<Task>): Promise<Task> => { await delay(400); return mockTasks[0]; },
  update: async (id: string, updates: Partial<Task>): Promise<Task> => { await delay(300); return mockTasks[0]; },
  delete: async (id: string): Promise<void> => { await delay(300); },
  updateStatus: async (id: string, status: Task['status']): Promise<Task> => { return tasksService.update(id, { status }); },
};

export const dashboardService = {
  getStats: async (): Promise<DashboardStats> => {
    await delay(700);
    return {
      totalProjects: mockProjects.length,
      totalTasks: mockTasks.length,
      completedTasks: 0,
      overdueTasks: 0,
      tasksByStatus: [],
      tasksByPriority: [],
      recentActivity: mockActivities,
    };
  },
};

export const notificationsService = {
  getAll: async (): Promise<Notification[]> => { await delay(400); return mockNotifications; },
  markAsRead: async (id: string): Promise<void> => { await delay(200); },
  markAllAsRead: async (): Promise<void> => { await delay(300); },
};

export default api;