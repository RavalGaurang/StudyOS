'use client';

import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Switch } from '../ui/Switch';
import { User } from '@/types/user.types';
import { USER_ROLES, UserRole } from '@/enums/app.enum';

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

export interface UserFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  user?: User | null;
  onSubmit: (data: UserFormData) => Promise<void>;
  isLoading?: boolean;
}

export const UserFormModal: React.FC<UserFormModalProps> = ({
  isOpen,
  onClose,
  user,
  onSubmit,
  isLoading = false,
}) => {
  const isEditMode = Boolean(user);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    setError,
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

  const selectedRole = watch('role');
  const isActiveValue = watch('isActive');

  // Populate form fields on open / edit
  useEffect(() => {
    if (isOpen) {
      if (user) {
        reset({
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          mobile: user.mobile || '',
          password: '',
          role: user.role,
          isActive: user.isActive,
        });
      } else {
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
  }, [isOpen, user, reset]);

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
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditMode ? 'Edit User Profile' : 'Create New User'}
      description={
        isEditMode
          ? 'Update account information and role assignments.'
          : 'Provision a new student, teacher, parent, or system admin.'
      }
      size="md"
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

        {/* Email & Mobile */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            label="Email Address *"
            type="email"
            required
            placeholder="name@example.com"
            error={errors.email?.message}
            {...register('email')}
          />
          <Input
            label="Mobile Number"
            placeholder="+1 555-0199"
            error={errors.mobile?.message}
            {...register('mobile')}
          />
        </div>

        {/* Password (Required on Create, Hidden on Edit) */}
        {!isEditMode && (
          <div>
            <Input
              label="Temporary Password *"
              type="password"
              required
              placeholder="Min 8 chars, 1 uppercase, 1 number"
              error={errors.password?.message}
              helperText="The user can change this after their initial login."
              {...register('password')}
            />
          </div>
        )}

        {/* Role Selection */}
        <div>
          <Select
            label="Role Assignment *"
            required
            options={roleOptions}
            value={selectedRole}
            onChange={(e: any) => {
              const val = (e?.target ? e.target.value : e) as UserRole;
              setValue('role', val, { shouldValidate: true });
            }}
            error={errors.role?.message}
          />
        </div>

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

        {/* Modal Buttons */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
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
            type="submit"
            variant="primary"
            size="md"
            isLoading={isLoading}
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
      </form>
    </Modal>
  );
};
