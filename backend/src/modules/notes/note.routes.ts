import { Router } from 'express';
import { noteController } from './note.controller';
import { asyncHandler } from '../../common/utils/asyncHandler';
import { authenticate } from '../../middleware/auth.middleware';
import { authorize } from '../../middleware/rbac.middleware';
import { validateRequest } from '../../middleware/validate.middleware';
import { UserRole } from '@prisma/client';
import { createNoteSchema, updateNoteSchema, noteQuerySchema } from './note.schema';

const router = Router();

router.use(authenticate);

router.get(
  '/',
  authorize(UserRole.STUDENT, UserRole.TEACHER),
  validateRequest({ query: noteQuerySchema }),
  asyncHandler((req, res) => noteController.getNotes(req, res))
);

router.post(
  '/',
  authorize(UserRole.STUDENT, UserRole.TEACHER),
  validateRequest({ body: createNoteSchema }),
  asyncHandler((req, res) => noteController.createNote(req, res))
);

router.get(
  '/:id',
  authorize(UserRole.STUDENT, UserRole.TEACHER),
  asyncHandler((req, res) => noteController.getNoteById(req, res))
);

router.patch(
  '/:id',
  authorize(UserRole.STUDENT, UserRole.TEACHER),
  validateRequest({ body: updateNoteSchema }),
  asyncHandler((req, res) => noteController.updateNote(req, res))
);

router.patch(
  '/:id/pin',
  authorize(UserRole.STUDENT, UserRole.TEACHER),
  asyncHandler((req, res) => noteController.togglePin(req, res))
);

router.delete(
  '/:id',
  authorize(UserRole.STUDENT, UserRole.TEACHER),
  asyncHandler((req, res) => noteController.deleteNote(req, res))
);

export const noteRoutes = router;
