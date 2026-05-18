import React, { createContext, useContext, useMemo } from 'react';
import { User } from '@/types';
import { useAuth } from '@/context/AuthContext';

// Permission types
export type Permission = 
  // Project permissions
  | 'project:create'
  | 'project:read'
  | 'project:update'
  | 'project:delete'
  | 'project:archive'
  | 'project:manage_members'
  // Task permissions
  | 'task:create'
  | 'task:read'
  | 'task:update'
  | 'task:delete'
  | 'task:assign'
  | 'task:bulk_actions'
  // Team permissions
  | 'team:read'
  | 'team:invite'
  | 'team:remove'
  | 'team:manage_roles'
  // Settings permissions
  | 'settings:read'
  | 'settings:update'
  | 'settings:billing'
  // Admin permissions
  | 'admin:audit_logs'
  | 'admin:analytics'
  | 'admin:system_settings';

// Role-based permission mapping
const rolePermissions: Record<User['role'], Permission[]> = {
  admin: [
    // All project permissions
    'project:create', 'project:read', 'project:update', 'project:delete', 'project:archive', 'project:manage_members',
    // All task permissions
    'task:create', 'task:read', 'task:update', 'task:delete', 'task:assign', 'task:bulk_actions',
    // All team permissions
    'team:read', 'team:invite', 'team:remove', 'team:manage_roles',
    // All settings permissions
    'settings:read', 'settings:update', 'settings:billing',
    // Admin permissions
    'admin:audit_logs', 'admin:analytics', 'admin:system_settings',
  ],
  manager: [
    // Project permissions (no delete)
    'project:create', 'project:read', 'project:update', 'project:archive', 'project:manage_members',
    // All task permissions
    'task:create', 'task:read', 'task:update', 'task:delete', 'task:assign', 'task:bulk_actions',
    // Team permissions (no manage roles)
    'team:read', 'team:invite',
    // Settings permissions (no billing)
    'settings:read', 'settings:update',
    // Limited admin
    'admin:analytics',
  ],
  member: [
    // Project permissions (read only)
    'project:read',
    // Task permissions (no bulk actions)
    'task:create', 'task:read', 'task:update',
    // Team permissions (read only)
    'team:read',
    // Settings permissions (read only)
    'settings:read',
  ],
};

interface RBACContextValue {
  hasPermission: (permission: Permission) => boolean;
  hasAnyPermission: (permissions: Permission[]) => boolean;
  hasAllPermissions: (permissions: Permission[]) => boolean;
  userRole: User['role'] | null;
  isAdmin: boolean;
  isManager: boolean;
  isMember: boolean;
}

const RBACContext = createContext<RBACContextValue | undefined>(undefined);

export const RBACProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();

  const value = useMemo<RBACContextValue>(() => {
    const userRole = user?.role || null;
    const userPermissions = userRole ? rolePermissions[userRole] : [];

    return {
      hasPermission: (permission: Permission) => userPermissions.includes(permission),
      hasAnyPermission: (permissions: Permission[]) => 
        permissions.some(p => userPermissions.includes(p)),
      hasAllPermissions: (permissions: Permission[]) => 
        permissions.every(p => userPermissions.includes(p)),
      userRole,
      isAdmin: userRole === 'admin',
      isManager: userRole === 'manager',
      isMember: userRole === 'member',
    };
  }, [user]);

  return <RBACContext.Provider value={value}>{children}</RBACContext.Provider>;
};

export const useRBAC = (): RBACContextValue => {
  const context = useContext(RBACContext);
  if (!context) {
    throw new Error('useRBAC must be used within an RBACProvider');
  }
  return context;
};

// Hook for checking single permission
export const usePermission = (permission: Permission): boolean => {
  const { hasPermission } = useRBAC();
  return hasPermission(permission);
};

// Hook for checking multiple permissions
export const usePermissions = (permissions: Permission[], mode: 'any' | 'all' = 'any'): boolean => {
  const { hasAnyPermission, hasAllPermissions } = useRBAC();
  return mode === 'any' ? hasAnyPermission(permissions) : hasAllPermissions(permissions);
};
