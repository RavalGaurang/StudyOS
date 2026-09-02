import { z } from 'zod';
import { AssignmentStatus } from '@prisma/client';

export const createAssignmentSchema = z.object({
  title: z.string().min(1, 'Assignment title is required').max(200).trim(),
  description: z.string().max(3000).optional(),
  subjectId: z.string().uuid('Valid subject ID is required'),
  dueDate: z.string().datetime({ offset: true }).or(z.string().regex(/^\d{4}-\d{2}-\d{2}/)),
  status: z.nativeEnum(AssignmentStatus).default(AssignmentStatus.PENDING),
  maxMarks: z.number().positive().default(100),
});

export const updateAssignmentSchema = z.object({
  title: z.string().min(1).max(200).trim().optional(),
  description: z.string().max(3000).optional(),
  subjectId: z.string().uuid().optional(),
  dueDate: z.string().datetime({ offset: true }).or(z.string().regex(/^\d{4}-\d{2}-\d{2}/)).optional(),
  status: z.nativeEnum(AssignmentStatus).optional(),
  maxMarks: z.number().positive().optional(),
  obtainedMarks: z.number().min(0).optional().nullable(),
  submissionNotes: z.string().max(2000).optional().nullable(),
});

export type CreateAssignmentInput = z.infer<typeof createAssignmentSchema>;
export type UpdateAssignmentInput = z.infer<typeof updateAssignmentSchema>;
