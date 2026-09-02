import { z } from 'zod';

export const linkStudentSchema = z.object({
  studentEmail: z.string().email('Invalid student email address').toLowerCase().trim(),
  relationship: z.string().min(1).default('Parent'),
});

export type LinkStudentInput = z.infer<typeof linkStudentSchema>;
