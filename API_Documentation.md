# Project Bloom - API Documentation

This document outlines all the APIs needed for the frontend application based on the design and requirements.

## Table of Contents
1. [Authentication APIs](#authentication-apis)
2. [User Management APIs](#user-management-apis)
3. [Project Management APIs](#project-management-apis)
4. [Task Management APIs](#task-management-apis)
5. [Team Management APIs](#team-management-apis)
6. [Notification APIs](#notification-apis)
7. [Analytics & Reporting APIs](#analytics--reporting-apis)
8. [Labels & Categories APIs](#labels--categories-apis)

## Authentication APIs

### Auth Controller Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/auth/register` | Register a new user | No |
| POST | `/api/auth/login` | Login user | No |
| POST | `/api/auth/logout` | Logout current user | Yes |
| GET | `/api/auth/me` | Get current authenticated user | Yes |
| POST | `/api/auth/forgot-password` | Request password reset email | No |
| POST | `/api/auth/reset-password` | Reset password with token | No |
| POST | `/api/auth/change-password` | Change password for authenticated user | Yes |
| POST | `/api/auth/2fa/verify` | Verify 2FA code | No |
| POST | `/api/auth/2fa/enable` | Enable 2FA for user | Yes |
| POST | `/api/auth/2fa/disable` | Disable 2FA for user | Yes |
| POST | `/api/auth/refresh` | Refresh access token | No |
| GET | `/api/auth/oauth/:provider` | OAuth login initiation | No |

## User Management APIs

### User Controller Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/users` | Get all users (with pagination/filtering) | Yes |
| GET | `/api/users/:id` | Get user by ID | Yes |
| PATCH | `/api/users/:id` | Update user profile | Yes (own profile) |
| DELETE | `/api/users/:id` | Delete user | Yes (admin only) |
| GET | `/api/users/profile` | Get current user profile | Yes |
| PATCH | `/api/users/profile` | Update current user profile | Yes |
| GET | `/api/users/search` | Search users by name/email | Yes |

## Project Management APIs

### Project Controller Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/projects` | Get all projects (with filters) | Yes |
| GET | `/api/projects/:id` | Get single project by ID | Yes |
| POST | `/api/projects` | Create new project | Yes |
| PATCH | `/api/projects/:id` | Update project | Yes |
| DELETE | `/api/projects/:id` | Delete project | Yes |
| POST | `/api/projects/:id/archive` | Archive project | Yes |
| POST | `/api/projects/:id/restore` | Restore archived project | Yes |
| POST | `/api/projects/:id/clone` | Clone project | Yes |
| GET | `/api/projects/:id/members` | Get project members | Yes |
| POST | `/api/projects/:id/members` | Add member to project | Yes |
| DELETE | `/api/projects/:id/members/:userId` | Remove member from project | Yes |
| PATCH | `/api/projects/:id/members/:userId` | Update member role | Yes |
| GET | `/api/projects/templates` | Get project templates | Yes |
| POST | `/api/projects/from-template` | Create project from template | Yes |
| GET | `/api/projects/:id/milestones` | Get project milestones | Yes |
| POST | `/api/projects/:id/milestones` | Create milestone | Yes |
| PATCH | `/api/projects/:id/milestones/:milestoneId` | Update milestone | Yes |
| DELETE | `/api/projects/:id/milestones/:milestoneId` | Delete milestone | Yes |

## Task Management APIs

### Task Controller Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/tasks` | Get all tasks with optional filters | Yes |
| GET | `/api/tasks/:id` | Get single task by ID | Yes |
| POST | `/api/tasks` | Create new task | Yes |
| PATCH | `/api/tasks/:id` | Update task | Yes |
| DELETE | `/api/tasks/:id` | Delete task | Yes |
| PATCH | `/api/tasks/:id/status` | Update task status | Yes |
| POST | `/api/tasks/:id/assign` | Assign task to user | Yes |
| DELETE | `/api/tasks/:id/assign` | Unassign task | Yes |
| PATCH | `/api/tasks/bulk` | Bulk update tasks | Yes |
| DELETE | `/api/tasks/bulk` | Bulk delete tasks | Yes |

### Subtasks Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/tasks/:id/subtasks` | Add subtask | Yes |
| PATCH | `/api/tasks/:id/subtasks/:subtaskId` | Update subtask | Yes |
| DELETE | `/api/tasks/:id/subtasks/:subtaskId` | Delete subtask | Yes |

### Comments Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/tasks/:id/comments` | Get task comments | Yes |
| POST | `/api/tasks/:id/comments` | Add comment | Yes |
| PATCH | `/api/tasks/:id/comments/:commentId` | Update comment | Yes |
| DELETE | `/api/tasks/:id/comments/:commentId` | Delete comment | Yes |

### Attachments Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/tasks/:id/attachments` | Get task attachments | Yes |
| POST | `/api/tasks/:id/attachments` | Upload attachment | Yes |
| DELETE | `/api/tasks/:id/attachments/:attachmentId` | Delete attachment | Yes |

### Time Tracking Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/tasks/:id/time-entries` | Get time entries for task | Yes |
| POST | `/api/tasks/:id/time-entries/start` | Start time tracking | Yes |
| POST | `/api/tasks/:id/time-entries/stop` | Stop time tracking | Yes |
| POST | `/api/tasks/:id/time-entries` | Add manual time entry | Yes |

### History Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/tasks/:id/history` | Get task history | Yes |

### Labels Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/labels` | Get all labels | Yes |
| POST | `/api/labels` | Create label | Yes |

## Team Management APIs

### Team Controller Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/team` | Get all team members | Yes |
| GET | `/api/team/:id` | Get team member by ID | Yes |
| POST | `/api/team/invite` | Invite new member | Yes |
| GET | `/api/team/invites` | Get pending invites | Yes |
| POST | `/api/team/invites/:id/resend` | Resend invite | Yes |
| DELETE | `/api/team/invites/:id` | Cancel invite | Yes |
| PATCH | `/api/team/:id` | Update team member | Yes |
| DELETE | `/api/team/:id` | Remove team member | Yes |
| GET | `/api/team/activity` | Get team activity logs | Yes |
| GET | `/api/team/workload` | Get workload data for team | Yes |
| GET | `/api/team/audit-logs` | Get audit logs (with filters) | Yes (admin only) |

## Notification APIs

### Notification Controller Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/notifications` | Get all notifications (with filters) | Yes |
| GET | `/api/notifications/unread-count` | Get unread count | Yes |
| PATCH | `/api/notifications/:id/read` | Mark notification as read | Yes |
| POST | `/api/notifications/mark-all-read` | Mark all notifications as read | Yes |
| DELETE | `/api/notifications/:id` | Delete notification | Yes |
| DELETE | `/api/notifications` | Clear all notifications | Yes |
| GET | `/api/notifications/preferences` | Get notification preferences | Yes |
| PATCH | `/api/notifications/preferences` | Update notification preferences | Yes |
| POST | `/api/notifications/push/subscribe` | Subscribe to push notifications | Yes |
| POST | `/api/notifications/push/unsubscribe` | Unsubscribe from push notifications | Yes |

## Analytics & Reporting APIs

### Analytics Controller Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/analytics/dashboard` | Get dashboard stats | Yes |
| GET | `/api/analytics/projects/:id` | Get project analytics | Yes |
| GET | `/api/analytics/projects` | Get all projects analytics | Yes |
| GET | `/api/analytics/team/productivity` | Get team productivity data | Yes |
| GET | `/api/analytics/tasks/trends` | Get task completion trends | Yes |
| GET | `/api/analytics/time-reports` | Get time reports (with filters) | Yes |
| GET | `/api/analytics/timesheets` | Get timesheets (with filters) | Yes |
| POST | `/api/analytics/timesheets/:id/submit` | Submit timesheet | Yes |
| POST | `/api/analytics/timesheets/:id/approve` | Approve timesheet | Yes |
| POST | `/api/analytics/timesheets/:id/reject` | Reject timesheet | Yes |
| GET | `/api/analytics/activity` | Get recent activity | Yes |
| GET | `/api/analytics/export` | Export report (with type/format) | Yes |

## Labels & Categories APIs

### Label Controller Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/labels` | Get all labels | Yes |
| POST | `/api/labels` | Create label | Yes |
| PATCH | `/api/labels/:id` | Update label | Yes |
| DELETE | `/api/labels/:id` | Delete label | Yes |

## Common Request/Response Format

### Success Response Format
```json
{
  "status": "success",
  "data": { /* response data */ },
  "timestamp": "2023-01-01T00:00:00.000Z"
}
```

### Error Response Format
```json
{
  "status": "error",
  "message": "Error message",
  "timestamp": "2023-01-01T00:00:00.000Z"
}
```

## Authentication Headers

All authenticated endpoints require the following header:
```
Authorization: Bearer <jwt_token>
```

## Pagination Format

When pagination is used, the response format includes:
```json
{
  "status": "success",
  "data": {
    "data": [/* array of items */],
    "pagination": {
      "currentPage": 1,
      "totalPages": 5,
      "totalItems": 100,
      "itemsPerPage": 20,
      "hasNext": true,
      "hasPrev": false
    }
  },
  "timestamp": "2023-01-01T00:00:00.000Z"
}
```

## Error Status Codes

- 200: Success
- 201: Created
- 400: Bad Request
- 401: Unauthorized
- 403: Forbidden
- 404: Not Found
- 409: Conflict
- 500: Internal Server Error