import { Router } from 'express';
import { timetableController } from './timetable.controller';
import { asyncHandler } from '../../common/utils/asyncHandler';
import { authenticate } from '../../middleware/auth.middleware';
import { authorize } from '../../middleware/rbac.middleware';
import { validateRequest } from '../../middleware/validate.middleware';
import { UserRole } from '@prisma/client';
import { createTimetableEventSchema, updateTimetableEventSchema } from './timetable.schema';

const router = Router();

router.use(authenticate);

router.get(
  '/',
  authorize(UserRole.STUDENT, UserRole.PARENT, UserRole.TEACHER),
  asyncHandler((req, res) => timetableController.getTimetable(req, res))
);

router.get(
  '/:id',
  authorize(UserRole.STUDENT, UserRole.PARENT, UserRole.TEACHER),
  asyncHandler((req, res) => timetableController.getEventById(req, res))
);

router.post(
  '/',
  authorize(UserRole.STUDENT, UserRole.TEACHER),
  validateRequest({ body: createTimetableEventSchema }),
  asyncHandler((req, res) => timetableController.createEvent(req, res))
);

router.patch(
  '/:id',
  authorize(UserRole.STUDENT, UserRole.TEACHER),
  validateRequest({ body: updateTimetableEventSchema }),
  asyncHandler((req, res) => timetableController.updateEvent(req, res))
);

router.delete(
  '/:id',
  authorize(UserRole.STUDENT, UserRole.TEACHER),
  asyncHandler((req, res) => timetableController.deleteEvent(req, res))
);

export const timetableRoutes = router;
