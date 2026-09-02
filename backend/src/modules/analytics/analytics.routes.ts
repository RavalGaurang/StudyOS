import { Router } from 'express';
import { analyticsController } from './analytics.controller';
import { asyncHandler } from '../../common/utils/asyncHandler';
import { authenticate } from '../../middleware/auth.middleware';
import { authorize } from '../../middleware/rbac.middleware';
import { UserRole } from '@prisma/client';

const router = Router();

router.use(authenticate);

router.get(
  '/student',
  authorize(UserRole.STUDENT),
  asyncHandler((req, res) => analyticsController.getStudentDashboard(req, res))
);

router.get(
  '/admin',
  authorize(UserRole.ADMIN),
  asyncHandler((req, res) => analyticsController.getAdminStats(req, res))
);

export const analyticsRoutes = router;
