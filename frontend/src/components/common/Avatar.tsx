import { cn } from '@/lib/utils';

interface AvatarProps {
  src?: string;
  name?: string; // Change to optional because runtime data can be unpredictable
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
  // Defensive fallbacks to ensure split() always receives a valid string
  const validName = typeof name === 'string' ? name.trim() : '';

  const initials = validName
    ? validName
        .split(' ')
        .filter(Boolean) // Cleans out extra spaces between names
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
        onError={(e) => {
          // If the image link breaks or 404s, remove the image source to gracefully fall back to initials
          (e.target as HTMLImageElement).style.display = 'none';
        }}
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
  // Broaden the type definitions to match your backend reality
  users?: { name?: string; id?: string; _id?: string; email?: string; avatar?: string }[];
  max?: number;
  size?: 'sm' | 'md' | 'lg';
}

export const AvatarGroup = ({ users = [], max = 4, size = 'md' }: AvatarGroupProps) => {
  // Fallback to empty array if users prop is null or undefined
  const safeUsers = Array.isArray(users) ? users : [];
  const visibleUsers = safeUsers.slice(0, max);
  const remainingCount = Math.max(0, safeUsers.length - max);

  return (
    <div className="flex -space-x-2-reverse flex-row-reverse justify-end items-center">
      {/* Reversing direction visually helps stack avatars nicely over one another if using CSS space utilities */}
      {remainingCount > 0 && (
        <div
          className={cn(
            'rounded-full bg-muted text-muted-foreground font-semibold flex items-center justify-center ring-2 ring-background z-10',
            sizeClasses[size]
          )}
        >
          +{remainingCount}
        </div>
      )}
      
      {[...visibleUsers].reverse().map((user, index) => {
        // Fallback cascade to make sure a name is ALWAYS found
        const safeName = user.name || user.email || 'Team Member';
        
        return (
          <Avatar
            key={user.id || user._id || user.email || index}
            src={user.avatar}
            name={safeName}
            size={size}
          />
        );
      })}
    </div>
  );
};