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
  authorize(UserRole.STUDENT, UserRole.TEACHER),
  asyncHandler((req, res) => quizController.getQuizzes(req, res))
);

router.post(
  '/',
  authorize(UserRole.STUDENT, UserRole.TEACHER),
  validateRequest({ body: createQuizSchema }),
  asyncHandler((req, res) => quizController.createQuiz(req, res))
);

router.get(
  '/:id',
  authorize(UserRole.STUDENT, UserRole.TEACHER),
  asyncHandler((req, res) => quizController.getQuizById(req, res))
);

router.post(
  '/:id/attempts',
  authorize(UserRole.STUDENT, UserRole.TEACHER),
  validateRequest({ body: submitAttemptSchema }),
  asyncHandler((req, res) => quizController.submitAttempt(req, res))
);

router.get(
  '/:id/attempts',
  authorize(UserRole.STUDENT, UserRole.PARENT, UserRole.TEACHER),
  asyncHandler((req, res) => quizController.getAttempts(req, res))
);

// Flashcards
router.get(
  '/flashcards/decks',
  authorize(UserRole.STUDENT, UserRole.TEACHER),
  asyncHandler((req, res) => quizController.getDecks(req, res))
);

router.post(
  '/flashcards/decks',
  authorize(UserRole.STUDENT, UserRole.TEACHER),
  validateRequest({ body: createDeckSchema }),
  asyncHandler((req, res) => quizController.createDeck(req, res))
);

router.get(
  '/flashcards/decks/:id',
  authorize(UserRole.STUDENT, UserRole.TEACHER),
  asyncHandler((req, res) => quizController.getDeckById(req, res))
);

router.post(
  '/flashcards/decks/:deckId/cards',
  authorize(UserRole.STUDENT, UserRole.TEACHER),
  validateRequest({ body: createFlashcardSchema }),
  asyncHandler((req, res) => quizController.addCard(req, res))
);

router.patch(
  '/flashcards/cards/:cardId/review',
  authorize(UserRole.STUDENT, UserRole.TEACHER),
  validateRequest({ body: reviewFlashcardSchema }),
  asyncHandler((req, res) => quizController.reviewCard(req, res))
);

router.get(
  '/flashcards/cards/:cardId',
  authorize(UserRole.STUDENT, UserRole.TEACHER),
  asyncHandler((req, res) => quizController.getCardById(req, res))
);

export const quizRoutes = router;
