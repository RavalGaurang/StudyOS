import { z } from 'zod';

export const createSubjectSchema = z.object({
  name: z.string().min(1, 'Subject name is required').max(100).trim(),
  code: z.string().max(20).optional(),
  color: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, 'Invalid hex color code').default('#3B82F6'),
  icon: z.string().default('book'),
  targetGrade: z.string().max(10).optional(),
  creditHours: z.number().int().min(1).max(20).optional().default(3),
});

export const updateSubjectSchema = createSubjectSchema.partial().extend({
  isArchived: z.boolean().optional(),
});

export const createUnitSchema = z.object({
  title: z.string().min(1, 'Unit title is required').max(150).trim(),
  orderIndex: z.number().int().min(0).default(0),
  description: z.string().max(500).optional(),
});

export const updateUnitSchema = createUnitSchema.partial();

export const createTopicSchema = z.object({
  title: z.string().min(1, 'Topic title is required').max(200).trim(),
  orderIndex: z.number().int().min(0).default(0),
});

export const updateTopicSchema = z.object({
  title: z.string().min(1).max(200).trim().optional(),
  orderIndex: z.number().int().min(0).optional(),
  isCompleted: z.boolean().optional(),
});

export type CreateSubjectInput = z.infer<typeof createSubjectSchema>;
export type UpdateSubjectInput = z.infer<typeof updateSubjectSchema>;
export type CreateUnitInput = z.infer<typeof createUnitSchema>;
export type UpdateUnitInput = z.infer<typeof updateUnitSchema>;
export type CreateTopicInput = z.infer<typeof createTopicSchema>;
export type UpdateTopicInput = z.infer<typeof updateTopicSchema>;
