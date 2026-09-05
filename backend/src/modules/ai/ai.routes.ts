import { Router } from 'express';
import { aiController } from './ai.controller';
import { asyncHandler } from '../../common/utils/asyncHandler';
import { authenticate } from '../../middleware/auth.middleware';
import { authorize } from '../../middleware/rbac.middleware';
import { validateRequest } from '../../middleware/validate.middleware';
import { UserRole } from '@prisma/client';
import {
  askTutorSchema,
  generateQuizSchema,
  summarizeNotesSchema,
  aiStudyPlannerSchema,
} from './ai.schema';

const router = Router();

router.use(authenticate);
router.use(authorize(UserRole.STUDENT, UserRole.TEACHER));

router.post(
  '/ask-tutor',
  validateRequest({ body: askTutorSchema }),
  asyncHandler((req, res) => aiController.askTutor(req, res))
);

router.post(
  '/generate-quiz',
  validateRequest({ body: generateQuizSchema }),
  asyncHandler((req, res) => aiController.generateQuiz(req, res))
);

router.post(
  '/summarize-notes',
  validateRequest({ body: summarizeNotesSchema }),
  asyncHandler((req, res) => aiController.summarizeNotes(req, res))
);

router.post(
  '/study-planner',
  validateRequest({ body: aiStudyPlannerSchema }),
  asyncHandler((req, res) => aiController.generateStudyPlan(req, res))
);

export const aiRoutes = router;
