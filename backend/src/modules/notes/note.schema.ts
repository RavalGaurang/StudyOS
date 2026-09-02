import { z } from 'zod';

export const createNoteSchema = z.object({
  title: z.string().min(1, 'Note title is required').max(200).trim(),
  content: z.string().default(''),
  subjectId: z.string().uuid().optional().nullable(),
  unitId: z.string().uuid().optional().nullable(),
  topicId: z.string().uuid().optional().nullable(),
  isPinned: z.boolean().default(false),
  tags: z.array(z.string().trim()).default([]),
});

export const updateNoteSchema = z.object({
  title: z.string().min(1).max(200).trim().optional(),
  content: z.string().optional(),
  subjectId: z.string().uuid().optional().nullable(),
  unitId: z.string().uuid().optional().nullable(),
  topicId: z.string().uuid().optional().nullable(),
  isPinned: z.boolean().optional(),
  isArchived: z.boolean().optional(),
  tags: z.array(z.string().trim()).optional(),
});

export const noteQuerySchema = z.object({
  search: z.string().optional(),
  subjectId: z.string().optional(),
  tag: z.string().optional(),
  isPinned: z.string().optional(),
});

export type CreateNoteInput = z.infer<typeof createNoteSchema>;
export type UpdateNoteInput = z.infer<typeof updateNoteSchema>;
export type NoteQueryInput = z.infer<typeof noteQuerySchema>;
