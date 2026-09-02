import { Router } from 'express';
import { notificationController } from './notification.controller';
import { asyncHandler } from '../../common/utils/asyncHandler';
import { authenticate } from '../../middleware/auth.middleware';

const router = Router();

router.use(authenticate);

router.get(
  '/',
  asyncHandler((req, res) => notificationController.getNotifications(req, res))
);

router.patch(
  '/:id/read',
  asyncHandler((req, res) => notificationController.markAsRead(req, res))
);

router.post(
  '/read-all',
  asyncHandler((req, res) => notificationController.markAllAsRead(req, res))
);

export const notificationRoutes = router;
