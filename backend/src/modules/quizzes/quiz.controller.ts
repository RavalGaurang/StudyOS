import { Request, Response } from 'express';
import { quizService } from './quiz.service';
import { sendSuccess } from '../../common/utils/responseFormatter';
import { UnauthorizedError } from '../../common/errors/AppError';

export class QuizController {
  private getStudentId(req: Request): string {
    const studentId = req.user?.profileId;
    if (!studentId) {
      throw new UnauthorizedError('Student profile not found for active user');
    }
    return studentId;
  }

  // Quizzes
  async getQuizzes(req: Request, res: Response) {
    const studentId = this.getStudentId(req);
    const { subjectId } = req.query;
    const quizzes = await quizService.getQuizzes(studentId, subjectId as string);
    return sendSuccess(res, 'Quizzes retrieved successfully', { quizzes });
  }

  async getQuizById(req: Request, res: Response) {
    const studentId = this.getStudentId(req);
    const quiz = await quizService.getQuizForTaking(req.params.id, studentId);
    return sendSuccess(res, 'Quiz retrieved successfully', { quiz });
  }

  async createQuiz(req: Request, res: Response) {
    const studentId = this.getStudentId(req);
    const quiz = await quizService.createQuiz(studentId, req.body);
    return sendSuccess(res, 'Quiz created successfully', { quiz }, undefined, 201);
  }

  async submitAttempt(req: Request, res: Response) {
    const studentId = this.getStudentId(req);
    const attempt = await quizService.submitQuizAttempt(req.params.id, studentId, req.body);
    return sendSuccess(res, 'Quiz evaluated and submitted successfully', { attempt }, undefined, 201);
  }

  async getAttempts(req: Request, res: Response) {
    const studentId = this.getStudentId(req);
    const attempts = await quizService.getQuizAttempts(req.params.id, studentId);
    return sendSuccess(res, 'Quiz attempts history retrieved', { attempts });
  }

  // Decks
  async getDecks(req: Request, res: Response) {
    const studentId = this.getStudentId(req);
    const decks = await quizService.getDecks(studentId);
    return sendSuccess(res, 'Flashcard decks retrieved successfully', { decks });
  }

  async getDeckById(req: Request, res: Response) {
    const studentId = this.getStudentId(req);
    const deck = await quizService.getDeckById(req.params.id, studentId);
    return sendSuccess(res, 'Deck retrieved successfully', { deck });
  }

  async createDeck(req: Request, res: Response) {
    const studentId = this.getStudentId(req);
    const deck = await quizService.createDeck(studentId, req.body);
    return sendSuccess(res, 'Flashcard deck created successfully', { deck }, undefined, 201);
  }

  async addCard(req: Request, res: Response) {
    const studentId = this.getStudentId(req);
    const card = await quizService.createFlashcard(req.params.deckId, studentId, req.body);
    return sendSuccess(res, 'Flashcard added to deck', { card }, undefined, 201);
  }

  async reviewCard(req: Request, res: Response) {
    const studentId = this.getStudentId(req);
    const card = await quizService.reviewFlashcard(req.params.cardId, studentId, req.body);
    return sendSuccess(res, 'Flashcard review recorded', { card });
  }

  async getCardById(req: Request, res: Response) {
    const studentId = this.getStudentId(req);
    const card = await quizService.getCardById(req.params.cardId, studentId);
    return sendSuccess(res, 'Flashcard retrieved successfully', { card });
  }
}

export const quizController = new QuizController();
