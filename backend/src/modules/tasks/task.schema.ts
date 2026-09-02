import { z } from 'zod';
import { TaskPriority, TaskStatus } from '@prisma/client';

export const createTaskSchema = z.object({
  title: z.string().min(1, 'Task title is required').max(200).trim(),
  description: z.string().max(2000).optional(),
  dueDate: z
    .string()
    .datetime({ offset: true })
    .or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/))
    .optional()
    .nullable(),
  priority: z.nativeEnum(TaskPriority).default(TaskPriority.MEDIUM),
  status: z.nativeEnum(TaskStatus).default(TaskStatus.TODO),
  subjectId: z.string().uuid('Invalid subject ID format').optional().nullable(),
});

export const updateTaskSchema = createTaskSchema.partial();

export const taskQuerySchema = z.object({
  page: z.string().optional().default('1'),
  limit: z.string().optional().default('20'),
  search: z.string().optional(),
  status: z.nativeEnum(TaskStatus).optional(),
  priority: z.nativeEnum(TaskPriority).optional(),
  subjectId: z.string().optional(),
  dueFilter: z.enum(['today', 'upcoming', 'overdue', 'all']).optional().default('all'),
  sortBy: z.enum(['dueDate', 'priority', 'createdAt', 'title']).optional().default('dueDate'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('asc'),
});

export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
export type TaskQueryInput = z.infer<typeof taskQuerySchema>;
