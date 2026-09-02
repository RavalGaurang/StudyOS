import { z } from 'zod';

export const askTutorSchema = z.object({
  prompt: z.string().min(1, 'Prompt is required').max(3000).trim(),
  subjectName: z.string().optional(),
  conversationId: z.string().uuid().optional(),
});

export const generateQuizSchema = z.object({
  topicTitle: z.string().min(1, 'Topic title is required').trim(),
  subjectName: z.string().optional(),
  numQuestions: z.number().int().min(1).max(10).default(3),
  notesText: z.string().optional(),
});

export const summarizeNotesSchema = z.object({
  notesContent: z.string().min(10, 'Notes content must be at least 10 characters').max(10000),
});

export const aiStudyPlannerSchema = z.object({
  examDate: z.string().regex(/^\d{4}-\d{2}-\d{2}/),
  availableDailyHours: z.number().positive().default(3),
  subjects: z.array(z.string()).min(1, 'At least one subject is required'),
});

export type AskTutorInput = z.infer<typeof askTutorSchema>;
export type GenerateQuizInput = z.infer<typeof generateQuizSchema>;
export type SummarizeNotesInput = z.infer<typeof summarizeNotesSchema>;
export type AiStudyPlannerInput = z.infer<typeof aiStudyPlannerSchema>;
