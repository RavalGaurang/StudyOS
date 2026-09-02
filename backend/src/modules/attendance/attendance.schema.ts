import { z } from 'zod';
import { AttendanceStatus } from '@prisma/client';

export const recordAttendanceSchema = z.object({
  subjectId: z.string().uuid('Valid subject ID is required'),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be formatted as YYYY-MM-DD'),
  status: z.nativeEnum(AttendanceStatus).default(AttendanceStatus.PRESENT),
  notes: z.string().max(500).optional(),
});

export const updateAttendanceSchema = z.object({
  status: z.nativeEnum(AttendanceStatus).optional(),
  notes: z.string().max(500).optional(),
});

export const attendanceQuerySchema = z.object({
  subjectId: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

export type RecordAttendanceInput = z.infer<typeof recordAttendanceSchema>;
export type UpdateAttendanceInput = z.infer<typeof updateAttendanceSchema>;
