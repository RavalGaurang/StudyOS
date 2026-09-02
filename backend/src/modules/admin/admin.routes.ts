import { Router } from 'express';
import { adminController } from './admin.controller';
import { asyncHandler } from '../../common/utils/asyncHandler';
import { authenticate } from '../../middleware/auth.middleware';
import { authorize } from '../../middleware/rbac.middleware';
import { validateRequest } from '../../middleware/validate.middleware';
import { UserRole } from '@prisma/client';
import { userQuerySchema } from './admin.schema';

const router = Router();

router.use(authenticate);
router.use(authorize(UserRole.ADMIN));

router.get(
  '/users',
  validateRequest({ query: userQuerySchema }),
  asyncHandler((req, res) => adminController.getUsers(req, res))
);

router.patch(
  '/users/:id/status',
  asyncHandler((req, res) => adminController.toggleStatus(req, res))
);

export const adminRoutes = router;
