import { cn } from '@/lib/utils';

interface SkeletonProps {
  className?: string;
  variant?: 'default' | 'circular' | 'text';
}

export const Skeleton = ({ className, variant = 'default' }: SkeletonProps) => {
  return (
    <div
      className={cn(
        'relative overflow-hidden bg-muted rounded-md',
        variant === 'circular' && 'rounded-full',
        variant === 'text' && 'h-4 rounded',
        className
      )}
    >
      <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-foreground/5 to-transparent animate-shimmer" />
    </div>
  );
};

export const CardSkeleton = () => (
  <div className="p-6 rounded-xl border border-border bg-card">
    <div className="flex items-center gap-4 mb-4">
      <Skeleton variant="circular" className="w-10 h-10" />
      <div className="flex-1 space-y-2">
        <Skeleton variant="text" className="w-3/4" />
        <Skeleton variant="text" className="w-1/2" />
      </div>
    </div>
    <Skeleton className="w-full h-24" />
  </div>
);

export const TableRowSkeleton = () => (
  <div className="flex items-center gap-4 p-4 border-b border-border">
    <Skeleton variant="circular" className="w-8 h-8" />
    <Skeleton variant="text" className="flex-1" />
    <Skeleton variant="text" className="w-24" />
    <Skeleton variant="text" className="w-20" />
  </div>
);

export const StatCardSkeleton = () => (
  <div className="p-6 rounded-xl border border-border bg-card">
    <div className="flex items-center justify-between mb-4">
      <Skeleton variant="text" className="w-24" />
      <Skeleton variant="circular" className="w-10 h-10" />
    </div>
    <Skeleton variant="text" className="w-16 h-8" />
    <Skeleton variant="text" className="w-32 mt-2" />
  </div>
);
