import React from 'react';
import { useRBAC, Permission } from '@/context/RBACContext';

interface CanProps {
  permission?: Permission;
  permissions?: Permission[];
  mode?: 'any' | 'all';
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

/**
 * Conditional rendering based on user permissions
 * 
 * Usage:
 * <Can permission="project:create">
 *   <Button>Create Project</Button>
 * </Can>
 * 
 * <Can permissions={['task:delete', 'task:bulk_actions']} mode="any">
 *   <Button>Delete Tasks</Button>
 * </Can>
 */
export const Can: React.FC<CanProps> = ({ 
  permission, 
  permissions, 
  mode = 'any', 
  children, 
  fallback = null 
}) => {
  const { hasPermission, hasAnyPermission, hasAllPermissions } = useRBAC();

  let hasAccess = false;

  if (permission) {
    hasAccess = hasPermission(permission);
  } else if (permissions) {
    hasAccess = mode === 'any' 
      ? hasAnyPermission(permissions) 
      : hasAllPermissions(permissions);
  }

  return hasAccess ? <>{children}</> : <>{fallback}</>;
};

interface CannotProps {
  permission?: Permission;
  permissions?: Permission[];
  mode?: 'any' | 'all';
  children: React.ReactNode;
}

/**
 * Render children only if user does NOT have permission
 */
export const Cannot: React.FC<CannotProps> = ({ 
  permission, 
  permissions, 
  mode = 'any', 
  children 
}) => {
  const { hasPermission, hasAnyPermission, hasAllPermissions } = useRBAC();

  let hasAccess = false;

  if (permission) {
    hasAccess = hasPermission(permission);
  } else if (permissions) {
    hasAccess = mode === 'any' 
      ? hasAnyPermission(permissions) 
      : hasAllPermissions(permissions);
  }

  return !hasAccess ? <>{children}</> : null;
};

interface RoleGateProps {
  roles: ('admin' | 'manager' | 'member')[];
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

/**
 * Conditional rendering based on user role
 * 
 * Usage:
 * <RoleGate roles={['admin', 'manager']}>
 *   <AdminPanel />
 * </RoleGate>
 */
export const RoleGate: React.FC<RoleGateProps> = ({ roles, children, fallback = null }) => {
  const { userRole } = useRBAC();

  if (!userRole || !roles.includes(userRole)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};

interface AdminOnlyProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

/**
 * Render only for admin users
 */
export const AdminOnly: React.FC<AdminOnlyProps> = ({ children, fallback = null }) => {
  const { isAdmin } = useRBAC();
  return isAdmin ? <>{children}</> : <>{fallback}</>;
};

interface ManagerOrAboveProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

/**
 * Render for manager or admin users
 */
export const ManagerOrAbove: React.FC<ManagerOrAboveProps> = ({ children, fallback = null }) => {
  const { isAdmin, isManager } = useRBAC();
  return (isAdmin || isManager) ? <>{children}</> : <>{fallback}</>;
};
