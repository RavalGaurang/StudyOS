import { Router } from 'express';
import { taskController } from './task.controller';
import { asyncHandler } from '../../common/utils/asyncHandler';
import { authenticate } from '../../middleware/auth.middleware';
import { authorize } from '../../middleware/rbac.middleware';
import { validateRequest } from '../../middleware/validate.middleware';
import { UserRole } from '@prisma/client';
import { createTaskSchema, updateTaskSchema, taskQuerySchema } from './task.schema';

const router = Router();

router.use(authenticate);

router.get(
  '/',
  authorize(UserRole.STUDENT),
  validateRequest({ query: taskQuerySchema }),
  asyncHandler((req, res) => taskController.getTasks(req, res))
);

router.post(
  '/',
  authorize(UserRole.STUDENT),
  validateRequest({ body: createTaskSchema }),
  asyncHandler((req, res) => taskController.createTask(req, res))
);

router.get(
  '/:id',
  authorize(UserRole.STUDENT),
  asyncHandler((req, res) => taskController.getTaskById(req, res))
);

router.patch(
  '/:id',
  authorize(UserRole.STUDENT),
  validateRequest({ body: updateTaskSchema }),
  asyncHandler((req, res) => taskController.updateTask(req, res))
);

router.patch(
  '/:id/toggle',
  authorize(UserRole.STUDENT),
  asyncHandler((req, res) => taskController.toggleStatus(req, res))
);

router.delete(
  '/:id',
  authorize(UserRole.STUDENT),
  asyncHandler((req, res) => taskController.deleteTask(req, res))
);

export const taskRoutes = router;
