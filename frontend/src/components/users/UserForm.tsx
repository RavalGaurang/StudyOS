'use client';

import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { FormLayout, FormLayoutSize } from '../ui/FormLayout';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { FormSelect } from '../ui/FormSelect';
import { Switch } from '../ui/Switch';
import { User } from '@/types/user.types';
import { USER_ROLES, UserRole } from '@/enums/app.enum';
import { UserPlus, UserCheck } from 'lucide-react';
import { apiClient } from '@/lib/api/axios';
import { ApiResponse } from '@/types/api.types';

const userFormSchema = z.object({
  firstName: z
    .string()
    .min(1, 'First name is required')
    .max(50, 'First name cannot exceed 50 characters')
    .trim(),
  lastName: z
    .string()
    .min(1, 'Last name is required')
    .max(50, 'Last name cannot exceed 50 characters')
    .trim(),
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address')
    .toLowerCase()
    .trim(),
  mobile: z
    .string()
    .trim()
    .regex(/^[+0-9\s-]{7,20}$/, 'Invalid phone number format')
    .optional()
    .or(z.literal('')),
  password: z
    .string()
    .optional()
    .or(z.literal('')),
  role: z.enum(['STUDENT', 'PARENT', 'TEACHER', 'ADMIN'] as const),
  isActive: z.boolean().default(true),
});

export interface UserFormData {
  firstName: string;
  lastName: string;
  email: string;
  mobile?: string;
  password?: string;
  role: UserRole;
  isActive: boolean;
}

export interface UserFormProps {
  isOpen: boolean;
  onClose: () => void;
  user?: User | null;
  userId?: string | null;
  onSubmit: (data: UserFormData) => Promise<void>;
  isLoading?: boolean;
  size?: FormLayoutSize;
}

export const UserForm: React.FC<UserFormProps> = ({
  isOpen,
  onClose,
  user,
  userId,
  onSubmit,
  isLoading = false,
  size = 'sm',
}) => {
  const [internalUser, setInternalUser] = useState<User | null>(null);
  const [isFetchingUser, setIsFetchingUser] = useState(false);

  // If userId is provided directly, fetch user via GET API inside the FormLayout
  useEffect(() => {
    if (isOpen && userId && !user) {
      let isMounted = true;
      setIsFetchingUser(true);
      apiClient
        .get<ApiResponse<{ user: User }>>(`/users/${userId}`)
        .then((res) => {
          if (isMounted && res.data.data?.user) {
            setInternalUser(res.data.data.user);
          }
        })
        .catch((err) => {
          console.error('Failed to fetch user by ID:', err);
        })
        .finally(() => {
          if (isMounted) setIsFetchingUser(false);
        });

      return () => {
        isMounted = false;
      };
    } else if (!isOpen) {
      setInternalUser(null);
      setIsFetchingUser(false);
    }
  }, [isOpen, userId, user]);

  const activeUser = user || internalUser;
  const isEditMode = Boolean(activeUser || userId);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    setError,
    control,
    formState: { errors },
  } = useForm<UserFormData>({
    resolver: zodResolver(userFormSchema) as any,
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      mobile: '',
      password: '',
      role: USER_ROLES.STUDENT,
      isActive: true,
    },
  });

  const isActiveValue = watch('isActive');

  // Populate form fields once the GET API returns fresh data
  useEffect(() => {
    if (isOpen) {
      if (activeUser) {
        reset({
          firstName: activeUser.firstName,
          lastName: activeUser.lastName,
          email: activeUser.email,
          mobile: activeUser.mobile || '',
          password: '',
          role: activeUser.role,
          isActive: activeUser.isActive,
        });
      } else if (!userId) {
        reset({
          firstName: '',
          lastName: '',
          email: '',
          mobile: '',
          password: '',
          role: USER_ROLES.STUDENT,
          isActive: true,
        });
      }
    }
  }, [isOpen, activeUser, userId, reset]);

  const handleFormSubmit = async (data: UserFormData) => {
    // Password validation only for Create User
    if (!isEditMode) {
      if (!data.password || data.password.trim().length < 8) {
        setError('password', {
          type: 'manual',
          message: 'Password must be at least 8 characters',
        });
        return;
      }
      if (!/[A-Z]/.test(data.password)) {
        setError('password', {
          type: 'manual',
          message: 'Password must contain at least one uppercase letter',
        });
        return;
      }
      if (!/[0-9]/.test(data.password)) {
        setError('password', {
          type: 'manual',
          message: 'Password must contain at least one number',
        });
        return;
      }
    }

    await onSubmit(data);
  };

  const roleOptions = [
    { value: USER_ROLES.STUDENT, label: 'Student' },
    { value: USER_ROLES.PARENT, label: 'Parent' },
    { value: USER_ROLES.TEACHER, label: 'Teacher' },
    { value: USER_ROLES.ADMIN, label: 'System Administrator' },
  ];

  return (
    <FormLayout
      isOpen={isOpen}
      onClose={onClose}
      title={isEditMode ? 'Edit User Profile' : 'Create New User'}
      description={
        isEditMode
          ? 'Update account information and role assignments.'
          : 'Provision a new student, teacher, parent, or system admin.'
      }
      icon={isEditMode ? <UserCheck className="w-5 h-5" /> : <UserPlus className="w-5 h-5" />}
      size={size}
      isLoading={isFetchingUser || (Boolean(userId) && !activeUser)}
      loadingMessage="Fetching user profile from server..."
      footer={
        <div className="flex items-center justify-end gap-3 w-full">
          <Button
            type="button"
            variant="outline"
            size="md"
            onClick={onClose}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="primary"
            size="md"
            isLoading={isLoading}
            onClick={handleSubmit(handleFormSubmit)}
          >
            {isEditMode
              ? isLoading
                ? 'Updating...'
                : 'Update User'
              : isLoading
              ? 'Creating...'
              : 'Create User'}
          </Button>
        </div>
      }
    >
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4 pt-1">
        {/* First & Last Name */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            label="First Name *"
            required
            placeholder="e.g. Gaurang"
            error={errors.firstName?.message}
            {...register('firstName')}
          />
          <Input
            label="Last Name *"
            required
            placeholder="e.g. Raval"
            error={errors.lastName?.message}
            {...register('lastName')}
          />
        </div>

        {/* Email */}
        <Input
          label="Email Address *"
          type="email"
          required
          placeholder="name@institution.edu"
          error={errors.email?.message}
          {...register('email')}
        />

        {/* Mobile */}
        <Input
          label="Mobile Number (Optional)"
          type="tel"
          placeholder="+91 98765 43210"
          error={errors.mobile?.message}
          {...register('mobile')}
        />

        {/* Password (Required for create, optional for edit) */}
        {!isEditMode && (
          <Input
            label="Initial Temporary Password *"
            type="password"
            required
            placeholder="Min 8 chars, 1 uppercase, 1 number"
            error={errors.password?.message}
            {...register('password')}
          />
        )}

        {/* Academic Role */}
        <FormSelect
          name="role"
          control={control}
          label="System / Academic Role *"
          options={roleOptions}
          required
        />

        {/* Initial Status Switch */}
        <div className="flex items-center justify-between p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
          <div>
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
              Account Status
            </span>
            <span className="text-[11px] text-slate-500 dark:text-slate-400">
              {isActiveValue
                ? 'Active account allowed to log in'
                : 'Suspended account (access disabled)'}
            </span>
          </div>
          <Switch
            checked={isActiveValue}
            onChange={(checked) => setValue('isActive', checked, { shouldValidate: true })}
            size="sm"
          />
        </div>
      </form>
    </FormLayout>
  );
};

export default UserForm;
