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
  authorize(UserRole.STUDENT, UserRole.PARENT),
  asyncHandler((req, res) => timetableController.getTimetable(req, res))
);

router.post(
  '/',
  authorize(UserRole.STUDENT),
  validateRequest({ body: createTimetableEventSchema }),
  asyncHandler((req, res) => timetableController.createEvent(req, res))
);

router.patch(
  '/:id',
  authorize(UserRole.STUDENT),
  validateRequest({ body: updateTimetableEventSchema }),
  asyncHandler((req, res) => timetableController.updateEvent(req, res))
);

router.delete(
  '/:id',
  authorize(UserRole.STUDENT),
  asyncHandler((req, res) => timetableController.deleteEvent(req, res))
);

export const timetableRoutes = router;
