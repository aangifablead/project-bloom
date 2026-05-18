import { cn } from '@/lib/utils';

type BadgeVariant = 'default' | 'success' | 'warning' | 'destructive' | 'info' | 'outline';

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
}

const variantClasses: Record<BadgeVariant, string> = {
  default: 'bg-primary/10 text-primary',
  success: 'bg-success/10 text-success',
  warning: 'bg-warning/10 text-warning',
  destructive: 'bg-destructive/10 text-destructive',
  info: 'bg-info/10 text-info',
  outline: 'border border-border text-muted-foreground bg-transparent',
};

export const Badge = ({ children, variant = 'default', className }: BadgeProps) => {
  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium uppercase tracking-wider',
        variantClasses[variant],
        className
      )}
    >
      {children}
    </span>
  );
};

// 🟢 Bulletproof Priority Badge
export const PriorityBadge = ({ priority }: { priority: string | undefined }) => {
  const normalized = (priority || 'low').toLowerCase();

  const config: Record<string, { variant: BadgeVariant; label: string }> = {
    low: { variant: 'outline', label: 'Low' },
    medium: { variant: 'info', label: 'Medium' },
    high: { variant: 'warning', label: 'High' },
    urgent: { variant: 'destructive', label: 'Urgent' },
  };

  const current = config[normalized] || { variant: 'outline', label: priority || 'Low' };
  return <Badge variant={current.variant}>{current.label}</Badge>;
};

// 🟢 Bulletproof Status Badge
export const StatusBadge = ({ status }: { status: string | undefined }) => {
  // 1. Safe fallback string normalization to match backend styles
  const normalized = (status || 'active').toLowerCase();

  const config: Record<string, { variant: BadgeVariant; label: string }> = {
    active: { variant: 'success', label: 'Active' },
    'in-progress': { variant: 'success', label: 'In Progress' }, // Catches standard variations
    inprogress: { variant: 'success', label: 'In Progress' },
    completed: { variant: 'info', label: 'Completed' },
    'on-hold': { variant: 'warning', label: 'On Hold' },
    onhold: { variant: 'warning', label: 'On Hold' },
    archived: { variant: 'outline', label: 'Archived' },
  };

  // 2. Fallback execution instead of throwing an undefined error
  const current = config[normalized] || { variant: 'default', label: status || 'Active' };
  return <Badge variant={current.variant}>{current.label}</Badge>;
};