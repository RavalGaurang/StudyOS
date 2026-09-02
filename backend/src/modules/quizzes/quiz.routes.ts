import { Router } from 'express';
import { quizController } from './quiz.controller';
import { asyncHandler } from '../../common/utils/asyncHandler';
import { authenticate } from '../../middleware/auth.middleware';
import { authorize } from '../../middleware/rbac.middleware';
import { validateRequest } from '../../middleware/validate.middleware';
import { UserRole } from '@prisma/client';
import {
  createQuizSchema,
  submitAttemptSchema,
  createDeckSchema,
  createFlashcardSchema,
  reviewFlashcardSchema,
} from './quiz.schema';

const router = Router();

router.use(authenticate);

// Quizzes
router.get(
  '/',
  authorize(UserRole.STUDENT),
  asyncHandler((req, res) => quizController.getQuizzes(req, res))
);

router.post(
  '/',
  authorize(UserRole.STUDENT),
  validateRequest({ body: createQuizSchema }),
  asyncHandler((req, res) => quizController.createQuiz(req, res))
);

router.get(
  '/:id',
  authorize(UserRole.STUDENT),
  asyncHandler((req, res) => quizController.getQuizById(req, res))
);

router.post(
  '/:id/attempts',
  authorize(UserRole.STUDENT),
  validateRequest({ body: submitAttemptSchema }),
  asyncHandler((req, res) => quizController.submitAttempt(req, res))
);

router.get(
  '/:id/attempts',
  authorize(UserRole.STUDENT, UserRole.PARENT),
  asyncHandler((req, res) => quizController.getAttempts(req, res))
);

// Flashcards
router.get(
  '/flashcards/decks',
  authorize(UserRole.STUDENT),
  asyncHandler((req, res) => quizController.getDecks(req, res))
);

router.post(
  '/flashcards/decks',
  authorize(UserRole.STUDENT),
  validateRequest({ body: createDeckSchema }),
  asyncHandler((req, res) => quizController.createDeck(req, res))
);

router.get(
  '/flashcards/decks/:id',
  authorize(UserRole.STUDENT),
  asyncHandler((req, res) => quizController.getDeckById(req, res))
);

router.post(
  '/flashcards/decks/:deckId/cards',
  authorize(UserRole.STUDENT),
  validateRequest({ body: createFlashcardSchema }),
  asyncHandler((req, res) => quizController.addCard(req, res))
);

router.patch(
  '/flashcards/cards/:cardId/review',
  authorize(UserRole.STUDENT),
  validateRequest({ body: reviewFlashcardSchema }),
  asyncHandler((req, res) => quizController.reviewCard(req, res))
);

export const quizRoutes = router;
