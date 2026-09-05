import { Router } from 'express';
import { assignmentController } from './assignment.controller';
import { asyncHandler } from '../../common/utils/asyncHandler';
import { authenticate } from '../../middleware/auth.middleware';
import { authorize } from '../../middleware/rbac.middleware';
import { validateRequest } from '../../middleware/validate.middleware';
import { UserRole } from '@prisma/client';
import { createAssignmentSchema, updateAssignmentSchema } from './assignment.schema';

const router = Router();

router.use(authenticate);

router.get(
  '/',
  authorize(UserRole.STUDENT, UserRole.PARENT, UserRole.TEACHER),
  asyncHandler((req, res) => assignmentController.getAssignments(req, res))
);

router.post(
  '/',
  authorize(UserRole.STUDENT, UserRole.TEACHER),
  validateRequest({ body: createAssignmentSchema }),
  asyncHandler((req, res) => assignmentController.createAssignment(req, res))
);

router.get(
  '/:id',
  authorize(UserRole.STUDENT, UserRole.PARENT, UserRole.TEACHER),
  asyncHandler((req, res) => assignmentController.getAssignmentById(req, res))
);

router.patch(
  '/:id',
  authorize(UserRole.STUDENT, UserRole.TEACHER),
  validateRequest({ body: updateAssignmentSchema }),
  asyncHandler((req, res) => assignmentController.updateAssignment(req, res))
);

router.delete(
  '/:id',
  authorize(UserRole.STUDENT, UserRole.TEACHER),
  asyncHandler((req, res) => assignmentController.deleteAssignment(req, res))
);

export const assignmentRoutes = router;
