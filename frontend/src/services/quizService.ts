import { apiClient } from '../lib/api/axios';
import { ApiResponse } from '../types/api.types';
import { Quiz, QuizAttempt, FlashcardDeck, Flashcard } from '../types/study.types';

export const quizService = {
  // Quizzes
  async getQuizzes(subjectId?: string): Promise<Quiz[]> {
    const res = await apiClient.get<ApiResponse<{ quizzes: Quiz[] }>>('/quizzes', {
      params: subjectId ? { subjectId } : {},
    });
    return res.data.data?.quizzes || [];
  },

  async getQuizById(id: string): Promise<Quiz> {
    const res = await apiClient.get<ApiResponse<{ quiz: Quiz }>>(`/quizzes/${id}`);
    return res.data.data!.quiz;
  },

  async createQuiz(data: any): Promise<Quiz> {
    const res = await apiClient.post<ApiResponse<{ quiz: Quiz }>>('/quizzes', data);
    return res.data.data!.quiz;
  },

  async submitAttempt(quizId: string, data: any): Promise<QuizAttempt> {
    const res = await apiClient.post<ApiResponse<{ attempt: QuizAttempt }>>(`/quizzes/${quizId}/attempts`, data);
    return res.data.data!.attempt;
  },

  async getAttempts(quizId: string): Promise<QuizAttempt[]> {
    const res = await apiClient.get<ApiResponse<{ attempts: QuizAttempt[] }>>(`/quizzes/${quizId}/attempts`);
    return res.data.data?.attempts || [];
  },

  // Flashcards
  async getDecks(): Promise<FlashcardDeck[]> {
    const res = await apiClient.get<ApiResponse<{ decks: FlashcardDeck[] }>>('/quizzes/flashcards/decks');
    return res.data.data?.decks || [];
  },

  async getDeckById(id: string): Promise<FlashcardDeck> {
    const res = await apiClient.get<ApiResponse<{ deck: FlashcardDeck }>>(`/quizzes/flashcards/decks/${id}`);
    return res.data.data!.deck;
  },

  async createDeck(data: any): Promise<FlashcardDeck> {
    const res = await apiClient.post<ApiResponse<{ deck: FlashcardDeck }>>('/quizzes/flashcards/decks', data);
    return res.data.data!.deck;
  },

  async addCard(deckId: string, data: any): Promise<Flashcard> {
    const res = await apiClient.post<ApiResponse<{ card: Flashcard }>>(`/quizzes/flashcards/decks/${deckId}/cards`, data);
    return res.data.data!.card;
  },

  async getCardById(cardId: string): Promise<Flashcard> {
    const res = await apiClient.get<ApiResponse<{ card: Flashcard }>>(`/quizzes/flashcards/cards/${cardId}`);
    return res.data.data!.card;
  },

  async reviewCard(cardId: string, masteryLevel: number): Promise<Flashcard> {
    const res = await apiClient.patch<ApiResponse<{ card: Flashcard }>>(`/quizzes/flashcards/cards/${cardId}/review`, {
      masteryLevel,
    });
    return res.data.data!.card;
  },
};
