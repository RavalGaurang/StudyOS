import React from 'react';
import { cn } from '../../lib/utils';
import { Inbox } from 'lucide-react';

export interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  action?: React.ReactNode;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon = <Inbox className="w-10 h-10 text-slate-400" />,
  title,
  description,
  action,
  className,
}) => {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center p-8 text-center rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30',
        className
      )}
    >
      <div className="p-3 bg-white dark:bg-slate-800 rounded-full shadow-sm mb-3">
        {icon}
      </div>
      <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">{title}</h4>
      <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mt-1 mb-4">
        {description}
      </p>
      {action && <div>{action}</div>}
    </div>
  );
};
