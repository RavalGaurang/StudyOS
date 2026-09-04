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
        className="fixed top-5 right-5 z-[9999] flex flex-col gap-2.5 max-w-sm w-full pointer-events-none"
      >
        {toasts.map((t) => {
          const icons = {
            success: <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" />,
            error: <AlertCircle className="w-5 h-5 text-rose-500 flex-shrink-0" />,
            warning: <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0" />,
            info: <Info className="w-5 h-5 text-sky-500 flex-shrink-0" />,
          };

          const borders = {
            success: 'border-emerald-200 dark:border-emerald-800/60 bg-emerald-50/90 dark:bg-emerald-950/80',
            error: 'border-rose-200 dark:border-rose-800/60 bg-rose-50/90 dark:bg-rose-950/80',
            warning: 'border-amber-200 dark:border-amber-800/60 bg-amber-50/90 dark:bg-amber-950/80',
            info: 'border-sky-200 dark:border-sky-800/60 bg-sky-50/90 dark:bg-sky-950/80',
          };

          return (
            <div
              key={t.id}
              role="alert"
              className={cn(
                'pointer-events-auto flex items-start gap-3 p-3.5 rounded-xl border shadow-lg backdrop-blur-sm transition-all duration-300 animate-in slide-in-from-top-4 fade-in',
                borders[t.type]
              )}
            >
              {icons[t.type]}
              <div className="flex-1 text-left">
                {t.title && (
                  <p className="text-xs font-bold text-slate-900 dark:text-slate-100">
                    {t.title}
                  </p>
                )}
                <p className="text-xs font-medium text-slate-700 dark:text-slate-200">
                  {t.message}
                </p>
              </div>
              <button
                type="button"
                onClick={() => removeToast(t.id)}
                className="p-1 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-slate-800/50 transition-colors"
              >
                <X className="w-3.5 h-3.5" />
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
