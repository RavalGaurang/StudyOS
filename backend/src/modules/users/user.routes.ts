import { Router } from 'express';
import { userController } from './user.controller';
import { asyncHandler } from '../../common/utils/asyncHandler';
import { authenticate } from '../../middleware/auth.middleware';
import { authorize } from '../../middleware/rbac.middleware';
import { validateRequest } from '../../middleware/validate.middleware';
import { UserRole } from '@prisma/client';
import {
  createUserSchema,
  updateUserSchema,
  updateUserStatusSchema,
  userQuerySchema,
  userIdParamSchema,
} from './user.schema';

const router = Router();

// Protect all user management routes with Authentication and ADMIN RBAC
router.use(authenticate);
router.use(authorize(UserRole.ADMIN));

router.get(
  '/',
  validateRequest({ query: userQuerySchema }),
  asyncHandler((req, res) => userController.getUsers(req, res))
);

router.post(
  '/',
  validateRequest({ body: createUserSchema }),
  asyncHandler((req, res) => userController.createUser(req, res))
);

router.get(
  '/:id',
  validateRequest({ params: userIdParamSchema }),
  asyncHandler((req, res) => userController.getUserById(req, res))
);

router.put(
  '/:id',
  validateRequest({ params: userIdParamSchema, body: updateUserSchema }),
  asyncHandler((req, res) => userController.updateUser(req, res))
);

router.delete(
  '/:id',
  validateRequest({ params: userIdParamSchema }),
  asyncHandler((req, res) => userController.deleteUser(req, res))
);

router.patch(
  '/:id/status',
  validateRequest({ params: userIdParamSchema, body: updateUserStatusSchema }),
  asyncHandler((req, res) => userController.updateStatus(req, res))
);

export const userRoutes = router;
