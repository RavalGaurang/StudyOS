import { z } from 'zod';
import { SessionType, GoalMetric, GoalStatus } from '@prisma/client';

export const createStudySessionSchema = z.object({
  subjectId: z.string().uuid().optional().nullable(),
  topicId: z.string().uuid().optional().nullable(),
  sessionType: z.nativeEnum(SessionType).default(SessionType.POMODORO_25_5),
  durationMinutes: z.number().int().positive('Duration must be greater than 0'),
  startedAt: z.string().datetime({ offset: true }),
  endedAt: z.string().datetime({ offset: true }),
  notes: z.string().max(1000).optional().nullable(),
});

export const studyPlanItemSchema = z.object({
  subjectId: z.string().uuid().optional().nullable(),
  unitId: z.string().uuid().optional().nullable(),
  topicId: z.string().uuid().optional().nullable(),
  plannedMinutes: z.number().int().positive().default(60),
  targetDate: z.string().datetime({ offset: true }).or(z.string().regex(/^\d{4}-\d{2}-\d{2}/)).optional().nullable(),
});

export const createStudyPlanSchema = z.object({
  title: z.string().min(1, 'Title is required').max(150).trim(),
  description: z.string().max(1000).optional(),
  startDate: z.string().datetime({ offset: true }).or(z.string().regex(/^\d{4}-\d{2}-\d{2}/)),
  endDate: z.string().datetime({ offset: true }).or(z.string().regex(/^\d{4}-\d{2}-\d{2}/)),
  targetHours: z.number().positive().default(10),
  items: z.array(studyPlanItemSchema).optional().default([]),
});

export const updateStudyPlanItemSchema = z.object({
  completedMinutes: z.number().int().min(0).optional(),
  isCompleted: z.boolean().optional(),
});

export const createGoalSchema = z.object({
  title: z.string().min(1, 'Goal title is required').max(150).trim(),
  description: z.string().max(500).optional(),
  targetDate: z.string().datetime({ offset: true }).or(z.string().regex(/^\d{4}-\d{2}-\d{2}/)),
  metricType: z.nativeEnum(GoalMetric).default(GoalMetric.STUDY_HOURS),
  targetValue: z.number().positive('Target value must be greater than 0'),
  currentValue: z.number().min(0).default(0),
});

export const updateGoalSchema = z.object({
  title: z.string().min(1).max(150).trim().optional(),
  description: z.string().max(500).optional(),
  targetDate: z.string().datetime({ offset: true }).or(z.string().regex(/^\d{4}-\d{2}-\d{2}/)).optional(),
  targetValue: z.number().positive().optional(),
  currentValue: z.number().min(0).optional(),
  status: z.nativeEnum(GoalStatus).optional(),
});

export type CreateStudySessionInput = z.infer<typeof createStudySessionSchema>;
export type CreateStudyPlanInput = z.infer<typeof createStudyPlanSchema>;
export type UpdateStudyPlanItemInput = z.infer<typeof updateStudyPlanItemSchema>;
export type CreateGoalInput = z.infer<typeof createGoalSchema>;
export type UpdateGoalInput = z.infer<typeof updateGoalSchema>;
