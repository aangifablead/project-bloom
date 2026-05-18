import { User, Project, Task, Notification, Activity, DashboardStats, Comment, Subtask, Label, Attachment } from '@/types';
import { ProjectMember, Milestone, ProjectTemplate } from '@/api/project.api';
import { TaskTimeEntry, TaskHistory, TaskFilters } from '@/api/task.api';
import { InviteMemberRequest, TeamInvite, WorkloadData, AuditLog } from '@/api/team.api';
import { NotificationPreferences } from '@/api/notification.api';
import { ProjectAnalytics, TeamProductivity, TimeReport, Timesheet } from '@/api/analytics.api';

// Simulate API delay
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// ============ MOCK DATA ============

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
  { id: '4', name: 'Alice Brown', email: 'alice@example.com', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alice', role: 'member', createdAt: new Date().toISOString() },
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
    members: mockUsers.slice(0, 3),
    createdBy: mockUser,
    tasksCount: 24,
    completedTasksCount: 16,
    color: '#6366f1',
    createdAt: '2024-01-15T00:00:00Z',
    updatedAt: new Date().toISOString(),
  },
  {
    id: '2',
    name: 'Mobile App Development',
    description: 'Native iOS and Android app for customer engagement',
    status: 'active',
    progress: 40,
    startDate: '2024-02-01',
    endDate: '2024-06-30',
    members: mockUsers.slice(1, 4),
    createdBy: mockUsers[1],
    tasksCount: 48,
    completedTasksCount: 19,
    color: '#10b981',
    createdAt: '2024-02-01T00:00:00Z',
    updatedAt: new Date().toISOString(),
  },
  {
    id: '3',
    name: 'API Integration',
    description: 'Third-party API integrations for payments and analytics',
    status: 'on-hold',
    progress: 20,
    startDate: '2024-02-15',
    members: mockUsers.slice(0, 2),
    createdBy: mockUser,
    tasksCount: 12,
    completedTasksCount: 2,
    color: '#f59e0b',
    createdAt: '2024-02-15T00:00:00Z',
    updatedAt: new Date().toISOString(),
  },
  {
    id: '4',
    name: 'Marketing Campaign',
    description: 'Q2 digital marketing campaign planning and execution',
    status: 'completed',
    progress: 100,
    startDate: '2024-01-01',
    endDate: '2024-02-28',
    members: mockUsers,
    createdBy: mockUsers[2],
    tasksCount: 18,
    completedTasksCount: 18,
    color: '#ec4899',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: new Date().toISOString(),
  },
];

const mockLabels: Label[] = [
  { id: '1', name: 'Design', color: '#6366f1' },
  { id: '2', name: 'Backend', color: '#10b981' },
  { id: '3', name: 'DevOps', color: '#f59e0b' },
  { id: '4', name: 'Documentation', color: '#8b5cf6' },
  { id: '5', name: 'Bug', color: '#ef4444' },
  { id: '6', name: 'Feature', color: '#06b6d4' },
];

const mockTasks: Task[] = [
  {
    id: '1',
    title: 'Design homepage mockup',
    description: 'Create wireframes and high-fidelity mockups for the new homepage',
    status: 'done',
    priority: 'high',
    projectId: '1',
    assignee: mockUsers[0],
    reporter: mockUsers[1],
    dueDate: '2024-02-20',
    labels: [mockLabels[0]],
    subtasks: [
      { id: '1', title: 'Wireframe', completed: true },
      { id: '2', title: 'High-fidelity design', completed: true },
    ],
    comments: [],
    attachments: [],
    createdAt: '2024-01-20T00:00:00Z',
    updatedAt: new Date().toISOString(),
  },
  {
    id: '2',
    title: 'Implement user authentication',
    description: 'Set up JWT-based authentication with login, register, and password reset',
    status: 'in-progress',
    priority: 'urgent',
    projectId: '1',
    assignee: mockUsers[2],
    reporter: mockUsers[0],
    dueDate: '2024-02-25',
    labels: [mockLabels[1]],
    subtasks: [
      { id: '3', title: 'Login API', completed: true },
      { id: '4', title: 'Register API', completed: true },
      { id: '5', title: 'Password reset', completed: false },
    ],
    comments: [],
    attachments: [],
    createdAt: '2024-01-22T00:00:00Z',
    updatedAt: new Date().toISOString(),
  },
  {
    id: '3',
    title: 'Set up CI/CD pipeline',
    description: 'Configure GitHub Actions for automated testing and deployment',
    status: 'todo',
    priority: 'medium',
    projectId: '1',
    assignee: mockUsers[1],
    reporter: mockUsers[0],
    dueDate: '2024-03-01',
    labels: [mockLabels[2]],
    subtasks: [],
    comments: [],
    attachments: [],
    createdAt: '2024-01-25T00:00:00Z',
    updatedAt: new Date().toISOString(),
  },
  {
    id: '4',
    title: 'Write API documentation',
    description: 'Document all API endpoints using OpenAPI/Swagger',
    status: 'review',
    priority: 'low',
    projectId: '1',
    assignee: mockUsers[3],
    reporter: mockUsers[1],
    labels: [mockLabels[3]],
    subtasks: [],
    comments: [],
    attachments: [],
    createdAt: '2024-01-28T00:00:00Z',
    updatedAt: new Date().toISOString(),
  },
  {
    id: '5',
    title: 'Database schema design',
    description: 'Design and implement database schema for user and project data',
    status: 'backlog',
    priority: 'high',
    projectId: '2',
    reporter: mockUsers[0],
    labels: [mockLabels[1]],
    subtasks: [],
    comments: [],
    attachments: [],
    createdAt: '2024-02-01T00:00:00Z',
    updatedAt: new Date().toISOString(),
  },
  {
    id: '6',
    title: 'Mobile app wireframes',
    description: 'Create wireframes for all main app screens',
    status: 'in-progress',
    priority: 'high',
    projectId: '2',
    assignee: mockUsers[1],
    reporter: mockUsers[2],
    dueDate: '2024-02-28',
    labels: [mockLabels[0]],
    subtasks: [],
    comments: [],
    attachments: [],
    createdAt: '2024-02-05T00:00:00Z',
    updatedAt: new Date().toISOString(),
  },
];

const mockNotifications: Notification[] = [
  {
    id: '1',
    type: 'task_assigned',
    title: 'New task assigned',
    message: 'You have been assigned to "Implement user authentication"',
    read: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    link: '/projects/1/tasks/2',
  },
  {
    id: '2',
    type: 'comment_added',
    title: 'New comment',
    message: 'Jane commented on "Design homepage mockup"',
    read: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    link: '/projects/1/tasks/1',
  },
  {
    id: '3',
    type: 'deadline',
    title: 'Deadline approaching',
    message: '"Set up CI/CD pipeline" is due in 2 days',
    read: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    link: '/projects/1/tasks/3',
  },
];

const mockActivities: Activity[] = [
  {
    id: '1',
    type: 'task_completed',
    description: 'completed "Design homepage mockup"',
    user: mockUsers[0],
    projectId: '1',
    taskId: '1',
    createdAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
  },
  {
    id: '2',
    type: 'comment_added',
    description: 'commented on "Implement user authentication"',
    user: mockUsers[1],
    projectId: '1',
    taskId: '2',
    createdAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
  },
  {
    id: '3',
    type: 'task_created',
    description: 'created "Database schema design"',
    user: mockUsers[0],
    projectId: '2',
    taskId: '5',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
  },
  {
    id: '4',
    type: 'member_added',
    description: 'added Alice Brown to "Mobile App Development"',
    user: mockUsers[1],
    projectId: '2',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
  },
];

const mockTemplates: ProjectTemplate[] = [
  { id: '1', name: 'Software Development', description: 'Standard software project with sprints', tasksCount: 15, category: 'Development' },
  { id: '2', name: 'Marketing Campaign', description: 'Campaign planning and execution', tasksCount: 12, category: 'Marketing' },
  { id: '3', name: 'Product Launch', description: 'End-to-end product launch workflow', tasksCount: 20, category: 'Product' },
];

const mockMilestones: Milestone[] = [
  { id: '1', name: 'Design Complete', description: 'All designs approved', dueDate: '2024-02-15', status: 'completed', projectId: '1' },
  { id: '2', name: 'MVP Release', description: 'First version deployed', dueDate: '2024-03-15', status: 'in-progress', projectId: '1' },
  { id: '3', name: 'Beta Launch', description: 'Public beta release', dueDate: '2024-04-30', status: 'pending', projectId: '1' },
];

// ============ MOCK SERVICE ============

export const mockService = {
  // Auth
  auth: {
    login: async (email: string, password: string) => {
      await delay(800);
      if (email && password) {
        return { user: mockUser, token: 'mock-jwt-token-12345' };
      }
      throw new Error('Invalid credentials');
    },
    register: async (name: string, email: string, password: string) => {
      await delay(800);
      if (name && email && password) {
        const newUser = { ...mockUser, name, email };
        return { user: newUser, token: 'mock-jwt-token-12345' };
      }
      throw new Error('Registration failed');
    },
    logout: async () => {
      await delay(300);
    },
    getCurrentUser: async () => {
      await delay(500);
      return mockUser;
    },
    forgotPassword: async (email: string) => {
      await delay(800);
      if (!email) throw new Error('Email is required');
      return { message: 'Password reset email sent' };
    },
    resetPassword: async (token: string, password: string) => {
      await delay(800);
      if (!token || !password) throw new Error('Invalid reset request');
      return { message: 'Password reset successful' };
    },
    changePassword: async (currentPassword: string, newPassword: string) => {
      await delay(600);
      if (!currentPassword || !newPassword) throw new Error('Passwords required');
      return { message: 'Password changed successfully' };
    },
    verify2FA: async (code: string, userId: string) => {
      await delay(500);
      if (code === '123456') {
        return { user: mockUser, token: 'mock-jwt-token-12345' };
      }
      throw new Error('Invalid 2FA code');
    },
    enable2FA: async () => {
      await delay(600);
      return { 
        qrCode: 'data:image/png;base64,mock-qr-code', 
        secret: 'JBSWY3DPEHPK3PXP' 
      };
    },
    disable2FA: async (code: string) => {
      await delay(500);
      return { message: '2FA disabled' };
    },
    refreshToken: async (refreshToken: string) => {
      await delay(300);
      return { token: 'new-mock-token', refreshToken: 'new-refresh-token' };
    },
  },

  // Projects
  projects: {
    getAll: async (filters?: { status?: string; search?: string }) => {
      await delay(600);
      let projects = [...mockProjects];
      if (filters?.status) {
        projects = projects.filter(p => p.status === filters.status);
      }
      if (filters?.search) {
        projects = projects.filter(p => 
          p.name.toLowerCase().includes(filters.search!.toLowerCase())
        );
      }
      return projects;
    },
    getById: async (id: string) => {
      await delay(400);
      const project = mockProjects.find(p => p.id === id);
      if (!project) throw new Error('Project not found');
      return project;
    },
    create: async (data: Partial<Project>) => {
      await delay(500);
      const newProject: Project = {
        id: String(mockProjects.length + 1),
        name: data.name || 'New Project',
        description: data.description || '',
        status: 'active',
        progress: 0,
        startDate: new Date().toISOString(),
        members: [mockUser],
        createdBy: mockUser,
        tasksCount: 0,
        completedTasksCount: 0,
        color: data.color || '#6366f1',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      mockProjects.push(newProject);
      return newProject;
    },
    update: async (id: string, updates: Partial<Project>) => {
      await delay(400);
      const index = mockProjects.findIndex(p => p.id === id);
      if (index === -1) throw new Error('Project not found');
      mockProjects[index] = { ...mockProjects[index], ...updates, updatedAt: new Date().toISOString() };
      return mockProjects[index];
    },
    delete: async (id: string) => {
      await delay(400);
      const index = mockProjects.findIndex(p => p.id === id);
      if (index !== -1) mockProjects.splice(index, 1);
    },
    archive: async (id: string) => {
      await delay(400);
      const index = mockProjects.findIndex(p => p.id === id);
      if (index === -1) throw new Error('Project not found');
      mockProjects[index] = { ...mockProjects[index], status: 'archived', updatedAt: new Date().toISOString() };
      return mockProjects[index];
    },
    restore: async (id: string) => {
      await delay(400);
      const index = mockProjects.findIndex(p => p.id === id);
      if (index === -1) throw new Error('Project not found');
      mockProjects[index] = { ...mockProjects[index], status: 'active', updatedAt: new Date().toISOString() };
      return mockProjects[index];
    },
    clone: async (id: string, name: string) => {
      await delay(600);
      const project = mockProjects.find(p => p.id === id);
      if (!project) throw new Error('Project not found');
      const cloned: Project = {
        ...project,
        id: String(mockProjects.length + 1),
        name,
        progress: 0,
        completedTasksCount: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      mockProjects.push(cloned);
      return cloned;
    },
    getMembers: async (id: string) => {
      await delay(300);
      const project = mockProjects.find(p => p.id === id);
      return project?.members || [];
    },
    addMember: async (projectId: string, data: ProjectMember) => {
      await delay(400);
      const user = mockUsers.find(u => u.id === data.userId);
      if (!user) throw new Error('User not found');
      return user;
    },
    removeMember: async (projectId: string, userId: string) => {
      await delay(300);
    },
    updateMemberRole: async (projectId: string, userId: string, role: string) => {
      await delay(300);
      const user = mockUsers.find(u => u.id === userId);
      if (!user) throw new Error('User not found');
      return user;
    },
    getTemplates: async () => {
      await delay(400);
      return mockTemplates;
    },
    createFromTemplate: async (templateId: string, name: string) => {
      await delay(600);
      const template = mockTemplates.find(t => t.id === templateId);
      if (!template) throw new Error('Template not found');
      const newProject: Project = {
        id: String(mockProjects.length + 1),
        name,
        description: template.description,
        status: 'active',
        progress: 0,
        startDate: new Date().toISOString(),
        members: [mockUser],
        createdBy: mockUser,
        tasksCount: template.tasksCount,
        completedTasksCount: 0,
        color: '#6366f1',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      mockProjects.push(newProject);
      return newProject;
    },
    getMilestones: async (projectId: string) => {
      await delay(400);
      return mockMilestones.filter(m => m.projectId === projectId);
    },
    createMilestone: async (projectId: string, data: Omit<Milestone, 'id' | 'projectId'>) => {
      await delay(400);
      const milestone: Milestone = {
        ...data,
        id: String(mockMilestones.length + 1),
        projectId,
      };
      mockMilestones.push(milestone);
      return milestone;
    },
    updateMilestone: async (projectId: string, milestoneId: string, data: Partial<Milestone>) => {
      await delay(300);
      const index = mockMilestones.findIndex(m => m.id === milestoneId);
      if (index === -1) throw new Error('Milestone not found');
      mockMilestones[index] = { ...mockMilestones[index], ...data };
      return mockMilestones[index];
    },
    deleteMilestone: async (projectId: string, milestoneId: string) => {
      await delay(300);
      const index = mockMilestones.findIndex(m => m.id === milestoneId);
      if (index !== -1) mockMilestones.splice(index, 1);
    },
  },

  // Tasks
  tasks: {
    getAll: async (filters?: TaskFilters) => {
      await delay(500);
      let tasks = [...mockTasks];
      if (filters?.projectId) {
        tasks = tasks.filter(t => t.projectId === filters.projectId);
      }
      if (filters?.status) {
        tasks = tasks.filter(t => t.status === filters.status);
      }
      if (filters?.priority) {
        tasks = tasks.filter(t => t.priority === filters.priority);
      }
      if (filters?.search) {
        tasks = tasks.filter(t => 
          t.title.toLowerCase().includes(filters.search!.toLowerCase())
        );
      }
      return tasks;
    },
    getById: async (id: string) => {
      await delay(300);
      const task = mockTasks.find(t => t.id === id);
      if (!task) throw new Error('Task not found');
      return task;
    },
    create: async (data: Partial<Task>) => {
      await delay(400);
      const newTask: Task = {
        id: String(mockTasks.length + 1),
        title: data.title || 'New Task',
        description: data.description,
        status: data.status || 'backlog',
        priority: data.priority || 'medium',
        projectId: data.projectId || '1',
        reporter: mockUser,
        assignee: data.assignee,
        dueDate: data.dueDate,
        labels: data.labels || [],
        subtasks: data.subtasks || [],
        comments: [],
        attachments: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      mockTasks.push(newTask);
      return newTask;
    },
    update: async (id: string, updates: Partial<Task>) => {
      await delay(300);
      const index = mockTasks.findIndex(t => t.id === id);
      if (index === -1) throw new Error('Task not found');
      mockTasks[index] = { ...mockTasks[index], ...updates, updatedAt: new Date().toISOString() };
      return mockTasks[index];
    },
    delete: async (id: string) => {
      await delay(300);
      const index = mockTasks.findIndex(t => t.id === id);
      if (index !== -1) mockTasks.splice(index, 1);
    },
    updateStatus: async (id: string, status: Task['status']) => {
      await delay(300);
      const index = mockTasks.findIndex(t => t.id === id);
      if (index === -1) throw new Error('Task not found');
      mockTasks[index] = { ...mockTasks[index], status, updatedAt: new Date().toISOString() };
      return mockTasks[index];
    },
    assign: async (taskId: string, userId: string) => {
      await delay(300);
      const taskIndex = mockTasks.findIndex(t => t.id === taskId);
      const user = mockUsers.find(u => u.id === userId);
      if (taskIndex === -1) throw new Error('Task not found');
      if (!user) throw new Error('User not found');
      mockTasks[taskIndex] = { ...mockTasks[taskIndex], assignee: user };
      return mockTasks[taskIndex];
    },
    unassign: async (taskId: string) => {
      await delay(300);
      const taskIndex = mockTasks.findIndex(t => t.id === taskId);
      if (taskIndex === -1) throw new Error('Task not found');
      mockTasks[taskIndex] = { ...mockTasks[taskIndex], assignee: undefined };
      return mockTasks[taskIndex];
    },
    bulkUpdate: async (taskIds: string[], data: Partial<Task>) => {
      await delay(500);
      return taskIds.map(id => {
        const index = mockTasks.findIndex(t => t.id === id);
        if (index !== -1) {
          mockTasks[index] = { ...mockTasks[index], ...data, updatedAt: new Date().toISOString() };
          return mockTasks[index];
        }
        return null;
      }).filter(Boolean) as Task[];
    },
    bulkDelete: async (taskIds: string[]) => {
      await delay(400);
      taskIds.forEach(id => {
        const index = mockTasks.findIndex(t => t.id === id);
        if (index !== -1) mockTasks.splice(index, 1);
      });
    },
    addSubtask: async (taskId: string, title: string) => {
      await delay(200);
      const subtask: Subtask = { id: String(Date.now()), title, completed: false };
      const taskIndex = mockTasks.findIndex(t => t.id === taskId);
      if (taskIndex !== -1) {
        mockTasks[taskIndex].subtasks.push(subtask);
      }
      return subtask;
    },
    updateSubtask: async (taskId: string, subtaskId: string, data: Partial<Subtask>) => {
      await delay(200);
      const taskIndex = mockTasks.findIndex(t => t.id === taskId);
      if (taskIndex !== -1) {
        const subtaskIndex = mockTasks[taskIndex].subtasks.findIndex(s => s.id === subtaskId);
        if (subtaskIndex !== -1) {
          mockTasks[taskIndex].subtasks[subtaskIndex] = { 
            ...mockTasks[taskIndex].subtasks[subtaskIndex], 
            ...data 
          };
          return mockTasks[taskIndex].subtasks[subtaskIndex];
        }
      }
      throw new Error('Subtask not found');
    },
    deleteSubtask: async (taskId: string, subtaskId: string) => {
      await delay(200);
      const taskIndex = mockTasks.findIndex(t => t.id === taskId);
      if (taskIndex !== -1) {
        mockTasks[taskIndex].subtasks = mockTasks[taskIndex].subtasks.filter(s => s.id !== subtaskId);
      }
    },
    getComments: async (taskId: string) => {
      await delay(300);
      const task = mockTasks.find(t => t.id === taskId);
      return task?.comments || [];
    },
    addComment: async (taskId: string, content: string, mentions?: string[]) => {
      await delay(300);
      const comment: Comment = {
        id: String(Date.now()),
        content,
        author: mockUser,
        createdAt: new Date().toISOString(),
        mentions: mentions || [],
      };
      const taskIndex = mockTasks.findIndex(t => t.id === taskId);
      if (taskIndex !== -1) {
        mockTasks[taskIndex].comments.push(comment);
      }
      return comment;
    },
    updateComment: async (taskId: string, commentId: string, content: string) => {
      await delay(200);
      const taskIndex = mockTasks.findIndex(t => t.id === taskId);
      if (taskIndex !== -1) {
        const commentIndex = mockTasks[taskIndex].comments.findIndex(c => c.id === commentId);
        if (commentIndex !== -1) {
          mockTasks[taskIndex].comments[commentIndex].content = content;
          return mockTasks[taskIndex].comments[commentIndex];
        }
      }
      throw new Error('Comment not found');
    },
    deleteComment: async (taskId: string, commentId: string) => {
      await delay(200);
      const taskIndex = mockTasks.findIndex(t => t.id === taskId);
      if (taskIndex !== -1) {
        mockTasks[taskIndex].comments = mockTasks[taskIndex].comments.filter(c => c.id !== commentId);
      }
    },
    getAttachments: async (taskId: string) => {
      await delay(300);
      const task = mockTasks.find(t => t.id === taskId);
      return task?.attachments || [];
    },
    uploadAttachment: async (taskId: string, file: File) => {
      await delay(500);
      const attachment: Attachment = {
        id: String(Date.now()),
        name: file.name,
        url: URL.createObjectURL(file),
        type: file.type,
        size: file.size,
        uploadedBy: mockUser,
        uploadedAt: new Date().toISOString(),
      };
      const taskIndex = mockTasks.findIndex(t => t.id === taskId);
      if (taskIndex !== -1) {
        mockTasks[taskIndex].attachments.push(attachment);
      }
      return attachment;
    },
    deleteAttachment: async (taskId: string, attachmentId: string) => {
      await delay(200);
      const taskIndex = mockTasks.findIndex(t => t.id === taskId);
      if (taskIndex !== -1) {
        mockTasks[taskIndex].attachments = mockTasks[taskIndex].attachments.filter(a => a.id !== attachmentId);
      }
    },
    getTimeEntries: async (taskId: string) => {
      await delay(300);
      return [] as TaskTimeEntry[];
    },
    startTimer: async (taskId: string) => {
      await delay(200);
      return {
        id: String(Date.now()),
        taskId,
        userId: mockUser.id,
        startTime: new Date().toISOString(),
        duration: 0,
      } as TaskTimeEntry;
    },
    stopTimer: async (taskId: string) => {
      await delay(200);
      return {
        id: String(Date.now()),
        taskId,
        userId: mockUser.id,
        startTime: new Date(Date.now() - 3600000).toISOString(),
        endTime: new Date().toISOString(),
        duration: 60,
      } as TaskTimeEntry;
    },
    addTimeEntry: async (taskId: string, data: any) => {
      await delay(300);
      return { id: String(Date.now()), taskId, userId: mockUser.id, ...data } as TaskTimeEntry;
    },
    getHistory: async (taskId: string) => {
      await delay(300);
      return [
        {
          id: '1',
          taskId,
          userId: mockUser.id,
          action: 'created' as const,
          createdAt: new Date(Date.now() - 86400000).toISOString(),
          user: mockUser,
        },
        {
          id: '2',
          taskId,
          userId: mockUser.id,
          action: 'status_changed' as const,
          field: 'status',
          oldValue: 'backlog',
          newValue: 'in-progress',
          createdAt: new Date(Date.now() - 3600000).toISOString(),
          user: mockUser,
        },
      ] as TaskHistory[];
    },
    getLabels: async () => {
      await delay(300);
      return mockLabels;
    },
    createLabel: async (data: Omit<Label, 'id'>) => {
      await delay(300);
      const label: Label = { ...data, id: String(mockLabels.length + 1) };
      mockLabels.push(label);
      return label;
    },
  },

  // Team
  team: {
    getAll: async () => {
      await delay(400);
      return mockUsers;
    },
    getById: async (id: string) => {
      await delay(300);
      const user = mockUsers.find(u => u.id === id);
      if (!user) throw new Error('User not found');
      return user;
    },
    invite: async (data: InviteMemberRequest) => {
      await delay(500);
      return {
        id: String(Date.now()),
        email: data.email,
        role: data.role,
        status: 'pending' as const,
        invitedBy: mockUser,
        createdAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      } as TeamInvite;
    },
    getInvites: async () => {
      await delay(400);
      return [] as TeamInvite[];
    },
    resendInvite: async (inviteId: string) => {
      await delay(300);
      return {} as TeamInvite;
    },
    cancelInvite: async (inviteId: string) => {
      await delay(300);
    },
    update: async (id: string, data: any) => {
      await delay(300);
      const index = mockUsers.findIndex(u => u.id === id);
      if (index === -1) throw new Error('User not found');
      mockUsers[index] = { ...mockUsers[index], ...data };
      return mockUsers[index];
    },
    remove: async (id: string) => {
      await delay(300);
    },
    getActivity: async (filters?: any) => {
      await delay(400);
      return mockActivities;
    },
    getWorkload: async () => {
      await delay(500);
      return mockUsers.map(user => ({
        userId: user.id,
        user,
        tasksAssigned: Math.floor(Math.random() * 10) + 1,
        tasksCompleted: Math.floor(Math.random() * 8),
        hoursLogged: Math.floor(Math.random() * 40) + 10,
        workloadPercentage: Math.floor(Math.random() * 100),
      })) as WorkloadData[];
    },
    getAuditLogs: async (filters?: any) => {
      await delay(600);
      return {
        logs: [
          {
            id: '1',
            action: 'project.created',
            userId: mockUser.id,
            user: mockUser,
            resource: 'project',
            resourceId: '1',
            details: { name: 'Website Redesign' },
            createdAt: new Date(Date.now() - 86400000).toISOString(),
          },
          {
            id: '2',
            action: 'task.updated',
            userId: mockUser.id,
            user: mockUser,
            resource: 'task',
            resourceId: '1',
            details: { field: 'status', from: 'todo', to: 'done' },
            createdAt: new Date(Date.now() - 3600000).toISOString(),
          },
        ] as AuditLog[],
        total: 2,
      };
    },
  },

  // Notifications
  notifications: {
    getAll: async (filters?: any) => {
      await delay(400);
      let notifications = [...mockNotifications];
      if (filters?.unreadOnly) {
        notifications = notifications.filter(n => !n.read);
      }
      return notifications;
    },
    getUnreadCount: async () => {
      await delay(200);
      return mockNotifications.filter(n => !n.read).length;
    },
    markAsRead: async (id: string) => {
      await delay(200);
      const notification = mockNotifications.find(n => n.id === id);
      if (notification) notification.read = true;
    },
    markAllAsRead: async () => {
      await delay(300);
      mockNotifications.forEach(n => n.read = true);
    },
    delete: async (id: string) => {
      await delay(200);
    },
    clearAll: async () => {
      await delay(300);
    },
    getPreferences: async () => {
      await delay(300);
      return {
        email: {
          taskAssigned: true,
          taskCompleted: true,
          commentAdded: true,
          mention: true,
          projectUpdates: true,
          deadlineReminders: true,
        },
        push: {
          taskAssigned: true,
          taskCompleted: false,
          commentAdded: true,
          mention: true,
          projectUpdates: false,
          deadlineReminders: true,
        },
        inApp: {
          taskAssigned: true,
          taskCompleted: true,
          commentAdded: true,
          mention: true,
          projectUpdates: true,
          deadlineReminders: true,
        },
      } as NotificationPreferences;
    },
    updatePreferences: async (preferences: Partial<NotificationPreferences>) => {
      await delay(300);
      return preferences as NotificationPreferences;
    },
    subscribeToPush: async (subscription: PushSubscription) => {
      await delay(300);
    },
    unsubscribeFromPush: async () => {
      await delay(300);
    },
  },

  // Analytics
  analytics: {
    getDashboardStats: async () => {
      await delay(700);
      return {
        totalProjects: mockProjects.length,
        totalTasks: mockTasks.length,
        completedTasks: mockTasks.filter(t => t.status === 'done').length,
        overdueTasks: mockTasks.filter(t => t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'done').length,
        tasksByStatus: [
          { status: 'Backlog', count: mockTasks.filter(t => t.status === 'backlog').length },
          { status: 'To Do', count: mockTasks.filter(t => t.status === 'todo').length },
          { status: 'In Progress', count: mockTasks.filter(t => t.status === 'in-progress').length },
          { status: 'Review', count: mockTasks.filter(t => t.status === 'review').length },
          { status: 'Done', count: mockTasks.filter(t => t.status === 'done').length },
        ],
        tasksByPriority: [
          { priority: 'Low', count: mockTasks.filter(t => t.priority === 'low').length },
          { priority: 'Medium', count: mockTasks.filter(t => t.priority === 'medium').length },
          { priority: 'High', count: mockTasks.filter(t => t.priority === 'high').length },
          { priority: 'Urgent', count: mockTasks.filter(t => t.priority === 'urgent').length },
        ],
        recentActivity: mockActivities,
      } as DashboardStats;
    },
    getProjectAnalytics: async (projectId: string) => {
      await delay(500);
      return {
        projectId,
        projectName: 'Website Redesign',
        totalTasks: 24,
        completedTasks: 16,
        overdueTasks: 2,
        completionRate: 66.7,
        averageTaskDuration: 4.5,
        burndownData: [
          { date: '2024-01-15', remaining: 24, ideal: 24 },
          { date: '2024-02-01', remaining: 18, ideal: 16 },
          { date: '2024-02-15', remaining: 12, ideal: 8 },
          { date: '2024-03-01', remaining: 8, ideal: 0 },
        ],
        velocityData: [
          { week: 'Week 1', completed: 4 },
          { week: 'Week 2', completed: 6 },
          { week: 'Week 3', completed: 4 },
          { week: 'Week 4', completed: 2 },
        ],
      } as ProjectAnalytics;
    },
    getAllProjectsAnalytics: async () => {
      await delay(600);
      return mockProjects.map(p => ({
        projectId: p.id,
        projectName: p.name,
        totalTasks: p.tasksCount,
        completedTasks: p.completedTasksCount,
        overdueTasks: 0,
        completionRate: (p.completedTasksCount / p.tasksCount) * 100,
        averageTaskDuration: 4,
        burndownData: [],
        velocityData: [],
      })) as ProjectAnalytics[];
    },
    getTeamProductivity: async (dateRange?: any) => {
      await delay(500);
      return mockUsers.map(user => ({
        userId: user.id,
        userName: user.name,
        tasksCompleted: Math.floor(Math.random() * 15) + 5,
        hoursLogged: Math.floor(Math.random() * 40) + 20,
        averageCompletionTime: Math.floor(Math.random() * 5) + 2,
        onTimeDeliveryRate: Math.floor(Math.random() * 30) + 70,
      })) as TeamProductivity[];
    },
    getTaskTrends: async (period: string) => {
      await delay(400);
      const data = [];
      for (let i = 7; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        data.push({
          date: date.toISOString().split('T')[0],
          completed: Math.floor(Math.random() * 5) + 1,
          created: Math.floor(Math.random() * 4) + 1,
        });
      }
      return data;
    },
    getTimeReports: async (filters?: any) => {
      await delay(500);
      return [] as TimeReport[];
    },
    getTimesheets: async (filters?: any) => {
      await delay(500);
      return [] as Timesheet[];
    },
    submitTimesheet: async (id: string) => {
      await delay(400);
      return { id, status: 'submitted' } as Timesheet;
    },
    approveTimesheet: async (id: string) => {
      await delay(400);
      return { id, status: 'approved' } as Timesheet;
    },
    rejectTimesheet: async (id: string, reason: string) => {
      await delay(400);
      return { id, status: 'rejected' } as Timesheet;
    },
    getRecentActivity: async (limit?: number) => {
      await delay(400);
      return mockActivities.slice(0, limit || 10);
    },
    exportReport: async (type: string, format: string, filters?: any) => {
      await delay(1000);
      return new Blob(['mock report data'], { type: 'text/csv' });
    },
  },
};

// Legacy exports for backward compatibility with existing code
export const authService = mockService.auth;
export const projectsService = mockService.projects;
export const tasksService = mockService.tasks;
export const dashboardService = mockService.analytics;
export const notificationsService = mockService.notifications;
export const usersService = mockService.team;
