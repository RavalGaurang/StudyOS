import { Router } from 'express';
import { authController } from './auth.controller';
import { asyncHandler } from '../../common/utils/asyncHandler';
import { validateRequest } from '../../middleware/validate.middleware';
import { authenticate } from '../../middleware/auth.middleware';
import { authLimiter } from '../../middleware/rateLimiter.middleware';
import {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from './auth.schema';

const router = Router();

router.post(
  '/register',
  authLimiter,
  validateRequest({ body: registerSchema }),
  asyncHandler((req, res) => authController.register(req, res))
);

router.post(
  '/login',
  authLimiter,
  validateRequest({ body: loginSchema }),
  asyncHandler((req, res) => authController.login(req, res))
);

router.post(
  '/refresh',
  asyncHandler((req, res) => authController.refresh(req, res))
);

router.post(
  '/logout',
  asyncHandler((req, res) => authController.logout(req, res))
);

router.get(
  '/me',
  authenticate,
  asyncHandler((req, res) => authController.me(req, res))
);

router.post(
  '/forgot-password',
  authLimiter,
  validateRequest({ body: forgotPasswordSchema }),
  asyncHandler((req, res) => authController.forgotPassword(req, res))
);

router.post(
  '/reset-password',
  authLimiter,
  validateRequest({ body: resetPasswordSchema }),
  asyncHandler((req, res) => authController.resetPassword(req, res))
);

export const authRoutes = router;
