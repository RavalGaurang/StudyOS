import { Router } from 'express';
import { studyController } from './study.controller';
import { asyncHandler } from '../../common/utils/asyncHandler';
import { authenticate } from '../../middleware/auth.middleware';
import { authorize } from '../../middleware/rbac.middleware';
import { validateRequest } from '../../middleware/validate.middleware';
import { UserRole } from '@prisma/client';
import {
  createStudySessionSchema,
  createStudyPlanSchema,
  updateStudyPlanItemSchema,
  createGoalSchema,
  updateGoalSchema,
} from './study.schema';

const router = Router();

router.use(authenticate);

// Sessions
router.get(
  '/sessions',
  authorize(UserRole.STUDENT, UserRole.PARENT),
  asyncHandler((req, res) => studyController.getSessions(req, res))
);

router.get(
  '/sessions/:id',
  authorize(UserRole.STUDENT, UserRole.PARENT),
  asyncHandler((req, res) => studyController.getSessionById(req, res))
);

router.post(
  '/sessions',
  authorize(UserRole.STUDENT),
  validateRequest({ body: createStudySessionSchema }),
  asyncHandler((req, res) => studyController.logSession(req, res))
);

// Plans
router.get(
  '/plans',
  authorize(UserRole.STUDENT),
  asyncHandler((req, res) => studyController.getPlans(req, res))
);

router.get(
  '/plans/:id',
  authorize(UserRole.STUDENT),
  asyncHandler((req, res) => studyController.getPlanById(req, res))
);

router.post(
  '/plans',
  authorize(UserRole.STUDENT),
  validateRequest({ body: createStudyPlanSchema }),
  asyncHandler((req, res) => studyController.createPlan(req, res))
);

router.patch(
  '/plans/items/:itemId',
  authorize(UserRole.STUDENT),
  validateRequest({ body: updateStudyPlanItemSchema }),
  asyncHandler((req, res) => studyController.updatePlanItem(req, res))
);

// Goals
router.get(
  '/goals',
  authorize(UserRole.STUDENT, UserRole.PARENT),
  asyncHandler((req, res) => studyController.getGoals(req, res))
);

router.get(
  '/goals/:id',
  authorize(UserRole.STUDENT, UserRole.PARENT),
  asyncHandler((req, res) => studyController.getGoalById(req, res))
);

router.post(
  '/goals',
  authorize(UserRole.STUDENT),
  validateRequest({ body: createGoalSchema }),
  asyncHandler((req, res) => studyController.createGoal(req, res))
);

router.patch(
  '/goals/:id',
  authorize(UserRole.STUDENT),
  validateRequest({ body: updateGoalSchema }),
  asyncHandler((req, res) => studyController.updateGoal(req, res))
);

router.delete(
  '/goals/:id',
  authorize(UserRole.STUDENT),
  asyncHandler((req, res) => studyController.deleteGoal(req, res))
);

export const studyRoutes = router;
