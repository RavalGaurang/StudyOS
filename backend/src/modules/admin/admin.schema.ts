import { z } from 'zod';
import { UserRole } from '@prisma/client';

export const userQuerySchema = z.object({
  page: z.string().optional().default('1'),
  limit: z.string().optional().default('20'),
  search: z.string().optional(),
  role: z.nativeEnum(UserRole).optional(),
  isActive: z.enum(['true', 'false']).optional(),
  sortBy: z.enum(['createdAt', 'email', 'firstName', 'role']).optional().default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
});

export type UserQueryInput = z.infer<typeof userQuerySchema>;
