import { z } from 'zod';
import { QuestionType } from '@prisma/client';

export const quizOptionSchema = z.object({
  optionText: z.string().min(1, 'Option text is required').trim(),
  isCorrect: z.boolean().default(false),
  orderIndex: z.number().int().default(0),
});

export const quizQuestionSchema = z.object({
  questionText: z.string().min(1, 'Question text is required').trim(),
  questionType: z.nativeEnum(QuestionType).default(QuestionType.MULTIPLE_CHOICE),
  marks: z.number().positive().default(1),
  explanation: z.string().optional(),
  orderIndex: z.number().int().default(0),
  options: z.array(quizOptionSchema).min(2, 'At least 2 options are required for a question'),
});

export const createQuizSchema = z.object({
  title: z.string().min(1, 'Quiz title is required').max(200).trim(),
  description: z.string().max(1000).optional(),
  subjectId: z.string().uuid().optional().nullable(),
  durationMinutes: z.number().int().positive().default(15),
  questions: z.array(quizQuestionSchema).min(1, 'Quiz must contain at least one question'),
});

export const submitAnswerSchema = z.object({
  questionId: z.string().uuid('Valid question ID required'),
  selectedOptionId: z.string().uuid().optional().nullable(),
  answerText: z.string().optional().nullable(),
});

export const submitAttemptSchema = z.object({
  answers: z.array(submitAnswerSchema),
  timeSpentSeconds: z.number().int().min(0).default(0),
});

// Flashcard schemas
export const createDeckSchema = z.object({
  title: z.string().min(1, 'Deck title is required').max(150).trim(),
  description: z.string().max(500).optional(),
  subjectId: z.string().uuid().optional().nullable(),
  isPublic: z.boolean().default(false),
});

export const createFlashcardSchema = z.object({
  front: z.string().min(1, 'Front side text is required').trim(),
  back: z.string().min(1, 'Back side text is required').trim(),
});

export const reviewFlashcardSchema = z.object({
  masteryLevel: z.number().int().min(1).max(5),
});

export type CreateQuizInput = z.infer<typeof createQuizSchema>;
export type SubmitAttemptInput = z.infer<typeof submitAttemptSchema>;
export type CreateDeckInput = z.infer<typeof createDeckSchema>;
export type CreateFlashcardInput = z.infer<typeof createFlashcardSchema>;
export type ReviewFlashcardInput = z.infer<typeof reviewFlashcardSchema>;
