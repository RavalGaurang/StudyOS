import React from 'react';
import { Loader2 } from 'lucide-react';

export const LoadingState: React.FC<{ message?: string }> = ({
  message = 'Loading data...',
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center">
      <Loader2 className="w-8 h-8 animate-spin text-indigo-600 dark:text-indigo-400 mb-3" />
      <p className="text-xs font-semibold text-slate-600 dark:text-slate-400">{message}</p>
    </div>
  );
};
