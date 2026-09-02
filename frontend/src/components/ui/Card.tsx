import React from 'react';
import { cn } from '../../lib/utils';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  subtitle?: string;
  action?: React.ReactNode;
  hoverable?: boolean;
}

export const Card: React.FC<CardProps> = ({
  className,
  title,
  subtitle,
  action,
  hoverable = false,
  children,
  ...props
}) => {
  return (
    <div
      className={cn(
        'rounded-xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/90 transition-all',
        hoverable && 'hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700',
        className
      )}
      {...props}
    >
      {(title || subtitle || action) && (
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            {title && (
              <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                {title}
              </h3>
            )}
            {subtitle && (
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {subtitle}
              </p>
            )}
          </div>
          {action && <div className="flex-shrink-0">{action}</div>}
        </div>
      )}
      {children}
    </div>
  );
};
