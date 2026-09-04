'use client';

import React from 'react';
import Link from 'next/link';
import { FileQuestion, LayoutDashboard, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { APP_ROUTES } from '@/enums/app.enum';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-4 sm:p-6 text-slate-900 dark:text-slate-100 selection:bg-indigo-500 selection:text-white">
      <div className="w-full max-w-md text-center">
        <Card className="p-8 sm:p-10 shadow-2xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <div className="w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto mb-5 shadow-inner">
            <FileQuestion className="w-8 h-8" />
          </div>

          <span className="inline-block px-2.5 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 mb-3">
            Error 404
          </span>

          <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-slate-100 sm:text-3xl">
            Page Not Found
          </h1>

          <p className="mt-2 text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-xs mx-auto leading-relaxed">
            The page or workspace module you are trying to access doesn&apos;t exist or has moved.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link href={APP_ROUTES.DASHBOARD} className="w-full sm:w-auto">
              <Button
                variant="primary"
                size="md"
                className="w-full font-bold"
                leftIcon={<LayoutDashboard className="w-4 h-4" />}
              >
                Go to Dashboard
              </Button>
            </Link>

            <button
              onClick={() => window.history.back()}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/60 transition-all"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Go Back</span>
            </button>
          </div>
        </Card>
      </div>
    </div>
  );
}
