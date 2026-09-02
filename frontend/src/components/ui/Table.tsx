import React from 'react';
import { cn } from '../../lib/utils';
import { Skeleton } from './Skeleton';

export interface Column<T> {
  header: string;
  accessor?: keyof T | ((row: T) => React.ReactNode);
  className?: string;
}

export interface TableProps<T> {
  columns: Column<T>[];
  data: T[];
  isLoading?: boolean;
  emptyMessage?: string;
  onRowClick?: (row: T) => void;
  className?: string;
}

export function Table<T extends Record<string, any>>({
  columns,
  data,
  isLoading = false,
  emptyMessage = 'No data available',
  onRowClick,
  className,
}: TableProps<T>) {
  return (
    <div className={cn('w-full overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800', className)}>
      <table className="w-full text-left text-sm text-slate-700 dark:text-slate-300">
        <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wider text-slate-500 border-b border-slate-200 dark:bg-slate-900/60 dark:border-slate-800 dark:text-slate-400">
          <tr>
            {columns.map((col, idx) => (
              <th key={idx} scope="col" className={cn('px-4 py-3', col.className)}>
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 bg-white dark:bg-slate-900">
          {isLoading ? (
            Array.from({ length: 4 }).map((_, rIdx) => (
              <tr key={rIdx}>
                {columns.map((_, cIdx) => (
                  <td key={cIdx} className="px-4 py-3.5">
                    <Skeleton className="h-4 w-full" />
                  </td>
                ))}
              </tr>
            ))
          ) : data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="px-4 py-8 text-center text-slate-400 dark:text-slate-500">
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((row, rIdx) => (
              <tr
                key={rIdx}
                onClick={() => onRowClick && onRowClick(row)}
                className={cn(
                  'transition-colors',
                  onRowClick && 'cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50'
                )}
              >
                {columns.map((col, cIdx) => (
                  <td key={cIdx} className={cn('px-4 py-3.5', col.className)}>
                    {typeof col.accessor === 'function'
                      ? col.accessor(row)
                      : col.accessor
                      ? row[col.accessor]
                      : null}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
