'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { authService } from '../../../services/authService';
import { useAppDispatch } from '../../../store/hooks';
import { setCredentials } from '../../../store/slices/authSlice';
import { FormInput } from '../../../components/ui/FormInput';
import { FormSelect } from '../../../components/ui/FormSelect';
import { Button } from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';
import { ArrowRight, Lock, Mail, User, School } from 'lucide-react';

const registerSchema = z.object({
  email: z.string().email('Please enter a valid email address').toLowerCase(),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  role: z.enum(['STUDENT', 'PARENT', 'TEACHER']).default('STUDENT'),
  gradeLevel: z.string().optional(),
  schoolName: z.string().optional(),
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    watch,
    formState: { isSubmitting },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: '',
      password: '',
      firstName: '',
      lastName: '',
      role: 'STUDENT',
      gradeLevel: 'Year 3 (B.Tech CSE)',
      schoolName: '',
    },
  });

  const selectedRole = watch('role');

  const onSubmit = async (values: RegisterFormValues) => {
    setServerError(null);
    try {
      const result = await authService.register(values);
      dispatch(setCredentials(result));

      if (result.user.role === 'PARENT') {
        router.push('/parent/dashboard');
      } else {
        router.push('/dashboard');
      }
    } catch (err: any) {
      setServerError(
        err.response?.data?.message || 'Registration failed. Please check your inputs.'
      );
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 px-4 selection:bg-indigo-500 selection:text-white">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link href="/" className="inline-flex items-center justify-center">
          <img
            src="/images/logo.png"
            alt="StudyOS"
            className="h-12 w-auto object-contain"
          />
        </Link>
        <h2 className="mt-4 text-2xl font-bold tracking-tight text-slate-900">
          Create your StudyOS account
        </h2>
        <p className="mt-1 text-xs text-slate-500">
          Already have an account?{' '}
          <Link href="/login" className="font-semibold text-indigo-600 hover:underline">
            Sign in
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <Card className="bg-white border-slate-200 p-6 sm:p-8 shadow-xl shadow-indigo-100/50">
          {serverError && (
            <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
              {serverError}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <FormInput
                name="firstName"
                label="First Name"
                placeholder="Rahul"
                control={control}
                leftElement={<User className="w-4 h-4 text-slate-400" />}
              />
              <FormInput
                name="lastName"
                label="Last Name"
                placeholder="Sharma"
                control={control}
              />
            </div>

            <FormInput
              name="email"
              label="Email Address"
              type="email"
              placeholder="rahul@example.com"
              control={control}
              leftElement={<Mail className="w-4 h-4 text-slate-400" />}
            />

            <FormInput
              name="password"
              label="Password (min 8 chars, 1 uppercase, 1 number)"
              type="password"
              placeholder="••••••••••••"
              control={control}
              leftElement={<Lock className="w-4 h-4 text-slate-400" />}
            />

            <FormSelect
              name="role"
              label="Account Role"
              control={control}
              options={[
                { value: 'STUDENT', label: 'Student (Personal Academic OS)' },
                { value: 'PARENT', label: 'Parent (Guardian Progress Monitor)' },
                { value: 'TEACHER', label: 'Teacher / Educator' },
              ]}
            />

            {selectedRole === 'STUDENT' && (
              <>
                <FormInput
                  name="gradeLevel"
                  label="Grade / Year of Study"
                  placeholder="e.g. Year 3 (B.Tech CSE)"
                  control={control}
                />
                <FormInput
                  name="schoolName"
                  label="School / University"
                  placeholder="e.g. Institute of Advanced Technology"
                  control={control}
                  leftElement={<School className="w-4 h-4 text-slate-400" />}
                />
              </>
            )}

            <Button
              type="submit"
              size="lg"
              variant="primary"
              className="w-full font-bold mt-2"
              isLoading={isSubmitting}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Complete Registration
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}
