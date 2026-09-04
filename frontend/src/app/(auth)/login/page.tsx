'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { authService } from '@/services/authService';
import { useAppDispatch } from '@/store/hooks';
import { setCredentials } from '@/store/slices/authSlice';
import { FormInput } from '@/components/ui/FormInput';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { GraduationCap, Users, Shield, UserCheck, ArrowRight, Lock, Mail } from 'lucide-react';
import { APP_ROUTES, USER_ROLES } from '@/enums/app.enum';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address').toLowerCase(),
  password: z.string().min(1, 'Password is required'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();

  const {
    control,
    handleSubmit,
    setValue,
    formState: { isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (values: LoginFormValues) => {
    try {
      const result = await authService.login(values);
      // Updates Redux and stores token in secure cookies
      dispatch(setCredentials(result));

      // Role-based redirect using application routes enum
      if (result.user.role === USER_ROLES.PARENT) {
        router.push(APP_ROUTES.PARENT_DASHBOARD);
      } else if (result.user.role === USER_ROLES.ADMIN) {
        router.push(APP_ROUTES.ADMIN_DASHBOARD);
      } else {
        router.push(APP_ROUTES.DASHBOARD);
      }
    } catch {
      // Error notification is handled by the global toast interceptor
    }
  };

  const handleQuickLogin = (email: string) => {
    setValue('email', email);
    setValue('password', 'StudyOS@123456');
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col justify-center py-8 sm:py-12 sm:px-6 lg:px-8 px-4 selection:bg-indigo-500 selection:text-white text-slate-900 dark:text-slate-100">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link href={APP_ROUTES.HOME} className="inline-flex items-center justify-center">
          <img
            src="/images/logo.png"
            alt="StudyOS"
            className="h-10 sm:h-12 w-auto object-contain"
          />
        </Link>
        <h2 className="mt-4 text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
          Sign in to your account
        </h2>
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
          Or{' '}
          <Link href={APP_ROUTES.REGISTER} className="font-semibold text-indigo-600 dark:text-indigo-400 hover:underline">
            create a new student profile
          </Link>
        </p>
      </div>

      <div className="mt-6 sm:mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 p-5 sm:p-8 shadow-xl">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <FormInput
              name="email"
              label="Email Address"
              type="email"
              required
              placeholder="student@studyos.com"
              control={control}
              leftElement={<Mail className="w-4 h-4 text-slate-400" />}
            />

            <FormInput
              name="password"
              label="Password"
              type="password"
              required
              placeholder="••••••••••••"
              control={control}
              leftElement={<Lock className="w-4 h-4 text-slate-400" />}
            />

            <div className="flex items-center justify-between">
              <div className="text-xs">
                <Link
                  href={APP_ROUTES.FORGOT_PASSWORD}
                  className="font-medium text-indigo-600 hover:text-indigo-500"
                >
                  Forgot your password?
                </Link>
              </div>
            </div>

            <Button
              type="submit"
              size="lg"
              variant="primary"
              className="w-full font-bold"
              isLoading={isSubmitting}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Sign In to StudyOS
            </Button>
          </form>

          {/* 1-Click Demo Accounts Switcher */}
          <div className="mt-6 pt-6 border-t border-slate-100">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-3 text-center">
              Instant Demo Accounts (Click to Fill)
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleQuickLogin('student@studyos.com')}
                className="flex items-center gap-2 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 hover:bg-indigo-50/50 dark:hover:bg-slate-800 hover:border-indigo-300 text-slate-800 dark:text-slate-200 text-xs font-semibold transition-all text-left"
              >
                <GraduationCap className="w-4 h-4 text-indigo-600 dark:text-indigo-400 flex-shrink-0" />
                <div>
                  <div className="leading-tight font-bold">Student</div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400">Rahul Sharma</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('parent@studyos.com')}
                className="flex items-center gap-2 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 hover:bg-emerald-50/50 dark:hover:bg-slate-800 hover:border-emerald-300 text-slate-800 dark:text-slate-200 text-xs font-semibold transition-all text-left"
              >
                <Users className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                <div>
                  <div className="leading-tight font-bold">Parent</div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400">Rajesh Sharma</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('admin@studyos.com')}
                className="flex items-center gap-2 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 hover:bg-rose-50/50 dark:hover:bg-slate-800 hover:border-rose-300 text-slate-800 dark:text-slate-200 text-xs font-semibold transition-all text-left"
              >
                <Shield className="w-4 h-4 text-rose-600 dark:text-rose-400 flex-shrink-0" />
                <div>
                  <div className="leading-tight font-bold">Admin</div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400">System Admin</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('teacher@studyos.com')}
                className="flex items-center gap-2 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 hover:bg-sky-50/50 dark:hover:bg-slate-800 hover:border-sky-300 text-slate-800 dark:text-slate-200 text-xs font-semibold transition-all text-left"
              >
                <UserCheck className="w-4 h-4 text-sky-600 dark:text-sky-400 flex-shrink-0" />
                <div>
                  <div className="leading-tight font-bold">Teacher</div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400">Dr. Jenkins</div>
                </div>
              </button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
