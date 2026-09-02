import React from 'react';
import { cn } from '../../lib/utils';

export interface AvatarProps {
  src?: string | null;
  name?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export const Avatar: React.FC<AvatarProps> = ({ src, name = 'User', size = 'md', className }) => {
  const initials = name
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  const sizes = {
    sm: 'w-7 h-7 text-xs',
    md: 'w-9 h-9 text-sm font-semibold',
    lg: 'w-12 h-12 text-base font-bold',
    xl: 'w-16 h-16 text-xl font-bold',
  };

  if (src) {
    return (
      <img
        src={src}
        alt={name}
        className={cn('rounded-full object-cover border border-slate-200 dark:border-slate-800', sizes[size], className)}
      />
    );
  }

  // Consistent background color based on name hash
  const colors = [
    'bg-indigo-600',
    'bg-emerald-600',
    'bg-violet-600',
    'bg-amber-600',
    'bg-rose-600',
    'bg-sky-600',
  ];
  const charCode = name.charCodeAt(0) || 0;
  const bgColor = colors[charCode % colors.length];

  return (
    <div
      className={cn(
        'rounded-full flex items-center justify-center text-white select-none shadow-sm',
        bgColor,
        sizes[size],
        className
      )}
    >
      {initials}
    </div>
  );
};
