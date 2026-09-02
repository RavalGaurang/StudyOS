import { Router } from 'express';
import { subjectController } from './subject.controller';
import { asyncHandler } from '../../common/utils/asyncHandler';
import { authenticate } from '../../middleware/auth.middleware';
import { authorize } from '../../middleware/rbac.middleware';
import { validateRequest } from '../../middleware/validate.middleware';
import { UserRole } from '@prisma/client';
import {
  createSubjectSchema,
  updateSubjectSchema,
  createUnitSchema,
  updateUnitSchema,
  createTopicSchema,
  updateTopicSchema,
} from './subject.schema';

const router = Router();

// Protect all subject routes
router.use(authenticate);

// Subjects
router.get(
  '/',
  authorize(UserRole.STUDENT, UserRole.PARENT),
  asyncHandler((req, res) => subjectController.getSubjects(req, res))
);

router.post(
  '/',
  authorize(UserRole.STUDENT),
  validateRequest({ body: createSubjectSchema }),
  asyncHandler((req, res) => subjectController.createSubject(req, res))
);

router.get(
  '/:id',
  authorize(UserRole.STUDENT, UserRole.PARENT),
  asyncHandler((req, res) => subjectController.getSubjectById(req, res))
);

router.patch(
  '/:id',
  authorize(UserRole.STUDENT),
  validateRequest({ body: updateSubjectSchema }),
  asyncHandler((req, res) => subjectController.updateSubject(req, res))
);

router.delete(
  '/:id',
  authorize(UserRole.STUDENT),
  asyncHandler((req, res) => subjectController.deleteSubject(req, res))
);

// Units
router.post(
  '/:subjectId/units',
  authorize(UserRole.STUDENT),
  validateRequest({ body: createUnitSchema }),
  asyncHandler((req, res) => subjectController.createUnit(req, res))
);

router.patch(
  '/units/:id',
  authorize(UserRole.STUDENT),
  validateRequest({ body: updateUnitSchema }),
  asyncHandler((req, res) => subjectController.updateUnit(req, res))
);

router.delete(
  '/units/:id',
  authorize(UserRole.STUDENT),
  asyncHandler((req, res) => subjectController.deleteUnit(req, res))
);

// Topics
router.post(
  '/units/:unitId/topics',
  authorize(UserRole.STUDENT),
  validateRequest({ body: createTopicSchema }),
  asyncHandler((req, res) => subjectController.createTopic(req, res))
);

router.patch(
  '/topics/:id',
  authorize(UserRole.STUDENT),
  validateRequest({ body: updateTopicSchema }),
  asyncHandler((req, res) => subjectController.updateTopic(req, res))
);

router.delete(
  '/topics/:id',
  authorize(UserRole.STUDENT),
  asyncHandler((req, res) => subjectController.deleteTopic(req, res))
);

export const subjectRoutes = router;
