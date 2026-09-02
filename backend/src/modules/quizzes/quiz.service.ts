import { prisma } from '../../config/database';
import { NotFoundError } from '../../common/errors/AppError';
import {
  CreateQuizInput,
  SubmitAttemptInput,
  CreateDeckInput,
  CreateFlashcardInput,
  ReviewFlashcardInput,
} from './quiz.schema';

export class QuizService {
  async getQuizzes(studentId: string, subjectId?: string) {
    const where: any = { studentId };
    if (subjectId) where.subjectId = subjectId;

    return prisma.quiz.findMany({
      where,
      include: {
        subject: { select: { id: true, name: true, color: true, code: true } },
        _count: { select: { questions: true, attempts: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getQuizForTaking(quizId: string, studentId: string) {
    const quiz = await prisma.quiz.findFirst({
      where: { id: quizId, studentId },
      include: {
        subject: true,
        questions: {
          orderBy: { orderIndex: 'asc' },
          include: {
            options: {
              select: {
                id: true,
                optionText: true,
                orderIndex: true,
              },
              orderBy: { orderIndex: 'asc' },
            },
          },
        },
      },
    });

    if (!quiz) {
      throw new NotFoundError('Quiz not found or access denied');
    }

    return quiz;
  }

  async createQuiz(studentId: string, input: CreateQuizInput) {
    let totalMarks = 0;
    for (const q of input.questions) {
      totalMarks += q.marks || 1;
    }

    return prisma.quiz.create({
      data: {
        studentId,
        subjectId: input.subjectId || null,
        title: input.title,
        description: input.description,
        durationMinutes: input.durationMinutes,
        totalMarks,
        questions: {
          create: input.questions.map((q) => ({
            questionText: q.questionText,
            questionType: q.questionType,
            marks: q.marks || 1,
            explanation: q.explanation,
            orderIndex: q.orderIndex,
            options: {
              create: q.options.map((opt) => ({
                optionText: opt.optionText,
                isCorrect: opt.isCorrect,
                orderIndex: opt.orderIndex,
              })),
            },
          })),
        },
      },
      include: {
        questions: {
          include: { options: true },
        },
      },
    });
  }

  async submitQuizAttempt(quizId: string, studentId: string, input: SubmitAttemptInput) {
    const quiz = await prisma.quiz.findFirst({
      where: { id: quizId, studentId },
      include: {
        questions: {
          include: { options: true },
        },
      },
    });

    if (!quiz) {
      throw new NotFoundError('Quiz not found or access denied');
    }

    // Transactional evaluation
    return prisma.$transaction(async (tx) => {
      let totalQuestions = quiz.questions.length;
      let correctAnswersCount = 0;
      let wrongAnswersCount = 0;
      let score = 0;

      const evaluatedAnswers = [];

      for (const q of quiz.questions) {
        const studentAns = input.answers.find((a) => a.questionId === q.id);
        let isCorrect = false;
        let marksAwarded = 0;

        if (studentAns && studentAns.selectedOptionId) {
          const correctOpt = q.options.find((opt) => opt.isCorrect);
          if (correctOpt && correctOpt.id === studentAns.selectedOptionId) {
            isCorrect = true;
            marksAwarded = q.marks;
            correctAnswersCount += 1;
            score += q.marks;
          } else {
            wrongAnswersCount += 1;
          }
        } else {
          wrongAnswersCount += 1;
        }

        evaluatedAnswers.push({
          questionId: q.id,
          selectedOptionId: studentAns?.selectedOptionId || null,
          answerText: studentAns?.answerText || null,
          isCorrect,
          marksAwarded,
        });
      }

      const totalMarks = quiz.totalMarks > 0 ? quiz.totalMarks : 1;
      const percentage = Math.round((score / totalMarks) * 100);

      const attempt = await tx.quizAttempt.create({
        data: {
          quizId,
          studentId,
          score,
          percentage,
          totalQuestions,
          correctAnswers: correctAnswersCount,
          wrongAnswers: wrongAnswersCount,
          timeSpentSeconds: input.timeSpentSeconds,
          completedAt: new Date(),
          answers: {
            create: evaluatedAnswers,
          },
        },
        include: {
          answers: {
            include: {
              question: {
                include: { options: true },
              },
            },
          },
        },
      });

      return attempt;
    });
  }

  async getQuizAttempts(quizId: string, studentId: string) {
    return prisma.quizAttempt.findMany({
      where: { quizId, studentId },
      orderBy: { startedAt: 'desc' },
      include: {
        answers: {
          include: {
            question: true,
          },
        },
      },
    });
  }

  // Flashcards
  async getDecks(studentId: string) {
    return prisma.flashcardDeck.findMany({
      where: { studentId },
      include: {
        subject: { select: { id: true, name: true, color: true } },
        _count: { select: { flashcards: true } },
      },
      orderBy: { updatedAt: 'desc' },
    });
  }

  async getDeckById(deckId: string, studentId: string) {
    const deck = await prisma.flashcardDeck.findFirst({
      where: { id: deckId, studentId },
      include: {
        subject: true,
        flashcards: {
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!deck) {
      throw new NotFoundError('Deck not found or access denied');
    }

    return deck;
  }

  async createDeck(studentId: string, input: CreateDeckInput) {
    return prisma.flashcardDeck.create({
      data: {
        studentId,
        title: input.title,
        description: input.description,
        subjectId: input.subjectId || null,
        isPublic: input.isPublic,
      },
    });
  }

  async createFlashcard(deckId: string, studentId: string, input: CreateFlashcardInput) {
    const deck = await prisma.flashcardDeck.findFirst({
      where: { id: deckId, studentId },
    });

    if (!deck) {
      throw new NotFoundError('Deck not found or access denied');
    }

    return prisma.flashcard.create({
      data: {
        deckId,
        front: input.front,
        back: input.back,
      },
    });
  }

  async reviewFlashcard(cardId: string, studentId: string, input: ReviewFlashcardInput) {
    const card = await prisma.flashcard.findFirst({
      where: { id: cardId, deck: { studentId } },
    });

    if (!card) {
      throw new NotFoundError('Flashcard not found or access denied');
    }

    // Spaced repetition interval in days based on mastery level
    const intervals: Record<number, number> = {
      1: 1,
      2: 3,
      3: 7,
      4: 14,
      5: 30,
    };

    const daysToAdd = intervals[input.masteryLevel] || 1;
    const nextReviewAt = new Date();
    nextReviewAt.setDate(nextReviewAt.getDate() + daysToAdd);

    return prisma.flashcard.update({
      where: { id: cardId },
      data: {
        masteryLevel: input.masteryLevel,
        reviewCount: card.reviewCount + 1,
        nextReviewAt,
      },
    });
  }
}

export const quizService = new QuizService();
