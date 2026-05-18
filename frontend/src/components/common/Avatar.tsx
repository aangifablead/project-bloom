import { cn } from '@/lib/utils';

interface AvatarProps {
  src?: string;
  name: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const sizeClasses = {
  sm: 'w-6 h-6 text-xs',
  md: 'w-8 h-8 text-sm',
  lg: 'w-10 h-10 text-base',
  xl: 'w-12 h-12 text-lg',
};

export const Avatar = ({ src, name, size = 'md', className }: AvatarProps) => {
  // Defensive fallbacks to ensure split() always receives a valid string string
  const validName = typeof name === 'string' ? name.trim() : '';

  const initials = validName
    ? validName
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : '?'; // Fallback character if name remains empty or missing

  if (src) {
    return (
      <img
        src={src}
        alt={validName || "Avatar"}
        className={cn(
          'rounded-full object-cover ring-2 ring-background',
          sizeClasses[size],
          className
        )}
      />
    );
  }

  return (
    <div
      className={cn(
        'rounded-full bg-primary/10 text-primary font-semibold flex items-center justify-center ring-2 ring-background',
        sizeClasses[size],
        className
      )}
    >
      {initials}
    </div>
  );
};

interface AvatarGroupProps {
  users: { name: string; avatar?: string }[];
  max?: number;
  size?: 'sm' | 'md' | 'lg';
}

export const AvatarGroup = ({ users, max = 4, size = 'md' }: AvatarGroupProps) => {
  const visibleUsers = users.slice(0, max);
  const remainingCount = users.length - max;

  return (
    <div className="flex -space-x-2">
      {visibleUsers.map((user, index) => (
        <Avatar
          key={index}
          src={user.avatar}
          name={user.name}
          size={size}
        />
      ))}
      {remainingCount > 0 && (
        <div
          className={cn(
            'rounded-full bg-muted text-muted-foreground font-semibold flex items-center justify-center ring-2 ring-background',
            sizeClasses[size]
          )}
        >
          +{remainingCount}
        </div>
      )}
    </div>
  );
};
