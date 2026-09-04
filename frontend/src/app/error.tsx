'use client';

import React, { useEffect } from 'react';
import { AlertTriangle, RefreshCw, LayoutDashboard } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { APP_ROUTES } from '@/enums/app.enum';
import Link from 'next/link';

export default function GlobalErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('StudyOS Runtime Error:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-4 sm:p-6 text-slate-900 dark:text-slate-100 selection:bg-indigo-500 selection:text-white">
      <div className="w-full max-w-md text-center">
        <Card className="p-8 sm:p-10 shadow-2xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <div className="w-16 h-16 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900/60 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto mb-5 shadow-inner">
            <AlertTriangle className="w-8 h-8" />
          </div>

          <span className="inline-block px-2.5 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400 mb-3">
            Application Error
          </span>

          <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-slate-100 sm:text-3xl">
            Something Went Wrong
          </h1>

          <p className="mt-2 text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-xs mx-auto leading-relaxed">
            {error.message || 'An unexpected error occurred while loading this view.'}
          </p>

          {error.digest && (
            <p className="mt-2 text-[10px] text-slate-400 font-mono">
              Error Digest: {error.digest}
            </p>
          )}

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Button
              variant="primary"
              size="md"
              onClick={() => reset()}
              className="w-full sm:w-auto font-bold"
              leftIcon={<RefreshCw className="w-4 h-4" />}
            >
              Try Again
            </Button>

            <Link href={APP_ROUTES.DASHBOARD} className="w-full sm:w-auto">
              <Button
                variant="outline"
                size="md"
                className="w-full font-bold"
                leftIcon={<LayoutDashboard className="w-4 h-4" />}
              >
                Dashboard
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}
