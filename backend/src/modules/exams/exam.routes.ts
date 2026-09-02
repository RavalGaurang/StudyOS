import { Router } from 'express';
import { examController } from './exam.controller';
import { asyncHandler } from '../../common/utils/asyncHandler';
import { authenticate } from '../../middleware/auth.middleware';
import { authorize } from '../../middleware/rbac.middleware';
import { validateRequest } from '../../middleware/validate.middleware';
import { UserRole } from '@prisma/client';
import { createExamSchema, updateExamSchema } from './exam.schema';

const router = Router();

router.use(authenticate);

router.get(
  '/',
  authorize(UserRole.STUDENT, UserRole.PARENT),
  asyncHandler((req, res) => examController.getExams(req, res))
);

router.post(
  '/',
  authorize(UserRole.STUDENT),
  validateRequest({ body: createExamSchema }),
  asyncHandler((req, res) => examController.createExam(req, res))
);

router.get(
  '/:id',
  authorize(UserRole.STUDENT, UserRole.PARENT),
  asyncHandler((req, res) => examController.getExamById(req, res))
);

router.patch(
  '/:id',
  authorize(UserRole.STUDENT),
  validateRequest({ body: updateExamSchema }),
  asyncHandler((req, res) => examController.updateExam(req, res))
);

router.delete(
  '/:id',
  authorize(UserRole.STUDENT),
  asyncHandler((req, res) => examController.deleteExam(req, res))
);

export const examRoutes = router;
