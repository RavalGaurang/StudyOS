import { z } from 'zod';

export const createTimetableEventSchema = z.object({
  subjectId: z.string().uuid().optional().nullable(),
  title: z.string().min(1, 'Event title is required').max(150).trim(),
  dayOfWeek: z.number().int().min(0).max(6), // 0 = Sunday, 1 = Monday, etc.
  startTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Format must be HH:mm (e.g. 09:30)'),
  endTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Format must be HH:mm (e.g. 11:00)'),
  room: z.string().max(50).optional().nullable(),
  location: z.string().max(100).optional().nullable(),
  color: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/).default('#3B82F6'),
  recurrence: z.string().default('WEEKLY'),
});

export const updateTimetableEventSchema = createTimetableEventSchema.partial();

export type CreateTimetableEventInput = z.infer<typeof createTimetableEventSchema>;
export type UpdateTimetableEventInput = z.infer<typeof updateTimetableEventSchema>;
