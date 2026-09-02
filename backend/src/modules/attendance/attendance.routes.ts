import { Router } from 'express';
import { attendanceController } from './attendance.controller';
import { asyncHandler } from '../../common/utils/asyncHandler';
import { authenticate } from '../../middleware/auth.middleware';
import { authorize } from '../../middleware/rbac.middleware';
import { validateRequest } from '../../middleware/validate.middleware';
import { UserRole } from '@prisma/client';
import { recordAttendanceSchema, updateAttendanceSchema, attendanceQuerySchema } from './attendance.schema';

const router = Router();

router.use(authenticate);

router.get(
  '/',
  authorize(UserRole.STUDENT, UserRole.PARENT),
  validateRequest({ query: attendanceQuerySchema }),
  asyncHandler((req, res) => attendanceController.getAttendance(req, res))
);

router.post(
  '/',
  authorize(UserRole.STUDENT),
  validateRequest({ body: recordAttendanceSchema }),
  asyncHandler((req, res) => attendanceController.recordAttendance(req, res))
);

router.patch(
  '/:id',
  authorize(UserRole.STUDENT),
  validateRequest({ body: updateAttendanceSchema }),
  asyncHandler((req, res) => attendanceController.updateAttendance(req, res))
);

router.delete(
  '/:id',
  authorize(UserRole.STUDENT),
  asyncHandler((req, res) => attendanceController.deleteAttendance(req, res))
);

export const attendanceRoutes = router;
