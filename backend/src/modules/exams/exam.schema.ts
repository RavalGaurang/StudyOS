import { z } from 'zod';

export const createExamSchema = z.object({
  title: z.string().min(1, 'Exam title is required').max(200).trim(),
  subjectId: z.string().uuid('Valid subject ID is required'),
  examDate: z.string().datetime({ offset: true }).or(z.string().regex(/^\d{4}-\d{2}-\d{2}/)),
  durationMinutes: z.number().int().positive().default(120),
  maxMarks: z.number().positive().default(100),
  weightagePercent: z.number().min(0).max(100).optional(),
  roomLocation: z.string().max(100).optional(),
  notes: z.string().max(2000).optional(),
});

export const updateExamSchema = z.object({
  title: z.string().min(1).max(200).trim().optional(),
  subjectId: z.string().uuid().optional(),
  examDate: z.string().datetime({ offset: true }).or(z.string().regex(/^\d{4}-\d{2}-\d{2}/)).optional(),
  durationMinutes: z.number().int().positive().optional(),
  maxMarks: z.number().positive().optional(),
  obtainedMarks: z.number().min(0).optional().nullable(),
  weightagePercent: z.number().min(0).max(100).optional().nullable(),
  roomLocation: z.string().max(100).optional().nullable(),
  notes: z.string().max(2000).optional().nullable(),
});

export type CreateExamInput = z.infer<typeof createExamSchema>;
export type UpdateExamInput = z.infer<typeof updateExamSchema>;
