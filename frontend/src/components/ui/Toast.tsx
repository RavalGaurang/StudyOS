'use client';

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { cn } from '../../lib/utils';
import {
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Info,
  X,
} from 'lucide-react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastItem {
  id: string;
  type: ToastType;
  message: string;
  title?: string;
  duration?: number;
}

type ToastListener = (toast: Omit<ToastItem, 'id'>) => void;
const listeners = new Set<ToastListener>();

/**
 * Imperative / Global Toast Object
 * Usable anywhere across the app (Axios interceptors, services, callbacks, outside React)
 */
export const toast = {
  add: (item: Omit<ToastItem, 'id'>): string => {
    listeners.forEach((fn) => fn(item));
    return '';
  },
  success: (message: string, title?: string): string => {
    listeners.forEach((fn) => fn({ type: 'success', message, title }));
    return '';
  },
  error: (message: string, title?: string): string => {
    listeners.forEach((fn) => fn({ type: 'error', message, title }));
    return '';
  },
  warning: (message: string, title?: string): string => {
    listeners.forEach((fn) => fn({ type: 'warning', message, title }));
    return '';
  },
  info: (message: string, title?: string): string => {
    listeners.forEach((fn) => fn({ type: 'info', message, title }));
    return '';
  },
};

interface ToastContextType {
  toasts: ToastItem[];
  addToast: (toast: Omit<ToastItem, 'id'>) => string;
  removeToast: (id: string) => void;
  success: (message: string, title?: string) => string;
  error: (message: string, title?: string) => string;
  warning: (message: string, title?: string) => string;
  info: (message: string, title?: string) => string;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback(
    ({ type, message, title, duration = 4000 }: Omit<ToastItem, 'id'>) => {
      const id = Math.random().toString(36).substring(2, 9);
      const newToast: ToastItem = { id, type, message, title, duration };

      setToasts((prev) => [...prev, newToast]);

      if (duration > 0) {
        setTimeout(() => {
          removeToast(id);
        }, duration);
      }

      return id;
    },
    [removeToast]
  );

  // Connect imperative toast calls to this ToastProvider instance
  useEffect(() => {
    const listener: ToastListener = (item) => {
      addToast(item);
    };
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  }, [addToast]);

  const success = useCallback(
    (message: string, title?: string) => addToast({ type: 'success', message, title }),
    [addToast]
  );

  const error = useCallback(
    (message: string, title?: string) => addToast({ type: 'error', message, title }),
    [addToast]
  );

  const warning = useCallback(
    (message: string, title?: string) => addToast({ type: 'warning', message, title }),
    [addToast]
  );

  const info = useCallback(
    (message: string, title?: string) => addToast({ type: 'info', message, title }),
    [addToast]
  );

  return (
    <ToastContext.Provider
      value={{ toasts, addToast, removeToast, success, error, warning, info }}
    >
      {children}
      {/* Toast Container */}
      <div
        aria-live="assertive"
        className="fixed top-20 right-4 sm:right-6 z-[9999] flex flex-col items-end gap-2.5 max-w-md w-full sm:w-auto pointer-events-none"
      >
        {toasts.map((t) => {
          const icons = {
            success: <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />,
            error: <AlertCircle className="w-5 h-5 text-rose-600 dark:text-rose-400 flex-shrink-0" />,
            warning: <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0" />,
            info: <Info className="w-5 h-5 text-sky-600 dark:text-sky-400 flex-shrink-0" />,
          };

          const borders = {
            success: 'border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950 text-slate-800 dark:text-slate-100',
            error: 'border-rose-200 dark:border-rose-800 bg-rose-50 dark:bg-rose-950 text-slate-800 dark:text-slate-100',
            warning: 'border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950 text-slate-800 dark:text-slate-100',
            info: 'border-sky-200 dark:border-sky-800 bg-sky-50 dark:bg-sky-950 text-slate-800 dark:text-slate-100',
          };

          const hasTitle = Boolean(t.title);

          return (
            <div
              key={t.id}
              role="alert"
              className={cn(
                'pointer-events-auto flex gap-3 px-4 py-3 rounded-2xl border shadow-xl transition-all duration-300 animate-in slide-in-from-top-4 fade-in w-full sm:w-auto min-w-[280px] sm:min-w-[320px] max-w-md',
                hasTitle ? 'items-start' : 'items-center',
                borders[t.type]
              )}
            >
              <div className={cn('flex-shrink-0 flex items-center justify-center', hasTitle && 'mt-0.5')}>
                {icons[t.type]}
              </div>

              <div className="flex-1 min-w-0 text-left">
                {hasTitle ? (
                  <>
                    <p className="text-xs font-bold text-slate-900 dark:text-slate-100 leading-tight">
                      {t.title}
                    </p>
                    <p className="text-xs font-medium text-slate-700 dark:text-slate-300 mt-1 leading-normal break-words">
                      {t.message}
                    </p>
                  </>
                ) : (
                  <p className="text-sm font-medium text-slate-800 dark:text-slate-100 leading-normal break-words">
                    {t.message}
                  </p>
                )}
              </div>

              <button
                type="button"
                onClick={() => removeToast(t.id)}
                className={cn(
                  'p-1 -mr-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-black/5 dark:hover:bg-white/10 transition-colors flex-shrink-0 flex items-center justify-center',
                  hasTitle && 'mt-0.5'
                )}
                aria-label="Close notification"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    return toast;
  }
  return context;
};
