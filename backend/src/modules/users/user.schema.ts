import { z } from 'zod';
import { UserRole } from '@prisma/client';

export const createUserSchema = z.object({
  firstName: z
    .string({ required_error: 'First name is required' })
    .min(1, 'First name cannot be empty')
    .max(50, 'First name cannot exceed 50 characters')
    .trim(),
  lastName: z
    .string({ required_error: 'Last name is required' })
    .min(1, 'Last name cannot be empty')
    .max(50, 'Last name cannot exceed 50 characters')
    .trim(),
  email: z
    .string({ required_error: 'Email is required' })
    .email('Invalid email address')
    .toLowerCase()
    .trim(),
  mobile: z
    .string()
    .trim()
    .regex(/^[+0-9\s-]{7,20}$/, 'Invalid mobile number format')
    .optional()
    .or(z.literal('')),
  password: z
    .string({ required_error: 'Password is required' })
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  role: z.nativeEnum(UserRole).optional().default(UserRole.STUDENT),
  isActive: z.boolean().optional().default(true),
});

export const updateUserSchema = z.object({
  firstName: z
    .string()
    .min(1, 'First name cannot be empty')
    .max(50, 'First name cannot exceed 50 characters')
    .trim()
    .optional(),
  lastName: z
    .string()
    .min(1, 'Last name cannot be empty')
    .max(50, 'Last name cannot exceed 50 characters')
    .trim()
    .optional(),
  email: z
    .string()
    .email('Invalid email address')
    .toLowerCase()
    .trim()
    .optional(),
  mobile: z
    .string()
    .trim()
    .regex(/^[+0-9\s-]{7,20}$/, 'Invalid mobile number format')
    .optional()
    .or(z.literal('')),
  role: z.nativeEnum(UserRole).optional(),
  isActive: z.boolean().optional(),
});

export const updateUserStatusSchema = z.object({
  isActive: z.boolean({ required_error: 'isActive must be a valid boolean (true or false)' }),
});

export const userQuerySchema = z.object({
  page: z.string().optional().default('1'),
  limit: z.string().optional().default('10'),
  search: z.string().optional(),
  role: z.nativeEnum(UserRole).optional(),
  isActive: z.enum(['true', 'false']).optional(),
  sortBy: z.enum(['createdAt', 'email', 'firstName', 'lastName', 'role']).optional().default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
});

export const userIdParamSchema = z.object({
  id: z.string().min(1, 'User ID is required'),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type UpdateUserStatusInput = z.infer<typeof updateUserStatusSchema>;
export type UserQueryInput = z.infer<typeof userQuerySchema>;
export type UserIdParamInput = z.infer<typeof userIdParamSchema>;
