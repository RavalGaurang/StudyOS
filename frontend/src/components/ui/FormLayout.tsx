'use client';

import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '../../lib/utils';
import { X, Loader2 } from 'lucide-react';

export type FormLayoutSize = 'sm' | 'md' | 'lg' | 'full';

export interface FormLayoutProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  icon?: React.ReactNode;
  size?: FormLayoutSize;
  isLoading?: boolean;
  loadingMessage?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
  hideHeader?: boolean;
}

export const FormLayout: React.FC<FormLayoutProps> = ({
  isOpen,
  onClose,
  title,
  description,
  icon,
  size = 'md',
  isLoading = false,
  loadingMessage = 'Loading form details...',
  children,
  footer,
  className,
  hideHeader = false,
}) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && !isLoading) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, isLoading]);

  // Lock body scroll when layout is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen || !mounted) return null;

  const isFullScreen = size === 'lg' || size === 'full';

  // Responsive panel widths:
  // - On mobile (< sm / < md): ALL sizes automatically expand to FULL SCREEN (w-full h-full inset-0)
  // - On desktop (sm+ / md+):
  //   - 'sm': compact 380px side panel (sm:w-[380px])
  //   - 'md': half screen panel (md:w-[50vw])
  //   - 'lg' / 'full': full screen (w-screen)
  const sizeClasses: Record<FormLayoutSize, string> = {
    sm: 'w-full sm:w-[380px]',
    md: 'w-full md:w-[50vw]',
    lg: 'w-full w-screen max-w-none',
    full: 'w-full w-screen max-w-none',
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[100] overflow-hidden bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isLoading) {
          onClose();
        }
      }}
    >
      {/* Slide-over panel container: full screen on mobile, right-aligned on desktop */}
      <div
        className={cn(
          'fixed inset-0 sm:inset-y-0 sm:left-auto sm:right-0 flex justify-end w-full sm:max-w-full pointer-events-none',
          isFullScreen ? 'sm:inset-0 sm:w-screen' : ''
        )}
      >
        <div
          className={cn(
            'pointer-events-auto relative h-full h-[100dvh] flex flex-col bg-white dark:bg-slate-900 shadow-2xl border-l-0 sm:border-l border-slate-200 dark:border-slate-800 transition-all duration-300 animate-in slide-in-from-right duration-300',
            sizeClasses[size],
            className
          )}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          {!hideHeader && (
            <div
              className={cn(
                'flex items-center justify-between border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xs flex-shrink-0',
                size === 'sm' ? 'px-5 py-3.5' : 'px-6 py-4'
              )}
            >
              <div className="flex items-center gap-3 min-w-0 pr-4">
                {icon && (
                  <div
                    className={cn(
                      'rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex-shrink-0',
                      size === 'sm' ? 'p-2' : 'p-2.5'
                    )}
                  >
                    {icon}
                  </div>
                )}
                {title && (
                  <div className="min-w-0">
                    <h3
                      className={cn(
                        'font-bold text-slate-900 dark:text-slate-100 truncate tracking-tight',
                        size === 'sm' ? 'text-base' : 'text-base sm:text-lg'
                      )}
                    >
                      {title}
                    </h3>
                    {description && (
                      <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">
                        {description}
                      </p>
                    )}
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={onClose}
                disabled={isLoading}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors disabled:opacity-40 flex-shrink-0"
                title="Close (Esc)"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          )}

          {/* Content Body */}
          <div
            className={cn(
              'flex-1 overflow-y-auto',
              size === 'sm' ? 'px-5 py-5' : 'px-6 py-6 sm:px-8 sm:py-8'
            )}
          >
            {isLoading ? (
              <div className="h-full min-h-[220px] flex flex-col items-center justify-center space-y-3 py-16">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-600 dark:text-indigo-400" />
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                  {loadingMessage}
                </p>
              </div>
            ) : (
              children
            )}
          </div>

          {/* Optional Footer */}
          {footer && !isLoading && (
            <div
              className={cn(
                'flex items-center justify-end gap-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/80 flex-shrink-0',
                size === 'sm' ? 'px-5 py-3.5' : 'px-6 py-4'
              )}
            >
              {footer}
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
};

export default FormLayout;
