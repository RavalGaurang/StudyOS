import { Router } from 'express';
import { parentController } from './parent.controller';
import { asyncHandler } from '../../common/utils/asyncHandler';
import { authenticate } from '../../middleware/auth.middleware';
import { authorize } from '../../middleware/rbac.middleware';
import { validateRequest } from '../../middleware/validate.middleware';
import { UserRole } from '@prisma/client';
import { linkStudentSchema } from './parent.schema';

const router = Router();

router.use(authenticate);
router.use(authorize(UserRole.PARENT));

router.get(
  '/children',
  asyncHandler((req, res) => parentController.getChildren(req, res))
);

router.get(
  '/children/:studentId/overview',
  asyncHandler((req, res) => parentController.getChildOverview(req, res))
);

router.post(
  '/link-student',
  validateRequest({ body: linkStudentSchema }),
  asyncHandler((req, res) => parentController.linkStudent(req, res))
);

export const parentRoutes = router;
