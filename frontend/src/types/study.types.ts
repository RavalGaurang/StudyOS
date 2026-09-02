import { SubjectSummary } from './academic.types';

export type SessionType = 'POMODORO_25_5' | 'POMODORO_50_10' | 'CUSTOM';
export type GoalStatus = 'IN_PROGRESS' | 'COMPLETED' | 'ABANDONED';
export type GoalMetric = 'STUDY_HOURS' | 'TASKS_COMPLETED' | 'EXAM_SCORE' | 'ATTENDANCE_PERCENT';

export interface Note {
  id: string;
  studentId: string;
  subjectId?: string | null;
  unitId?: string | null;
  topicId?: string | null;
  title: string;
  content: string;
  isPinned: boolean;
  isArchived: boolean;
  tags: string[];
  subject?: SubjectSummary | null;
  unit?: { id: string; title: string } | null;
  topic?: { id: string; title: string } | null;
  createdAt: string;
  updatedAt: string;
}

export interface StudySession {
  id: string;
  studentId: string;
  subjectId?: string | null;
  topicId?: string | null;
  sessionType: SessionType;
  durationMinutes: number;
  startedAt: string;
  endedAt: string;
  notes?: string | null;
  subject?: SubjectSummary | null;
  topic?: { id: string; title: string } | null;
}

export interface StudyPlanItem {
  id: string;
  studyPlanId: string;
  subjectId?: string | null;
  unitId?: string | null;
  topicId?: string | null;
  plannedMinutes: number;
  completedMinutes: number;
  targetDate?: string | null;
  isCompleted: boolean;
  subject?: { id: string; name: string; color: string } | null;
}

export interface StudyPlan {
  id: string;
  studentId: string;
  title: string;
  description?: string | null;
  startDate: string;
  endDate: string;
  targetHours: number;
  items: StudyPlanItem[];
}

export interface Goal {
  id: string;
  studentId: string;
  title: string;
  description?: string | null;
  targetDate: string;
  metricType: GoalMetric;
  targetValue: number;
  currentValue: number;
  status: GoalStatus;
}

export interface Flashcard {
  id: string;
  deckId: string;
  front: string;
  back: string;
  masteryLevel: number;
  reviewCount: number;
  nextReviewAt: string;
}

export interface FlashcardDeck {
  id: string;
  studentId: string;
  subjectId?: string | null;
  title: string;
  description?: string | null;
  isPublic: boolean;
  flashcards?: Flashcard[];
  subject?: SubjectSummary | null;
  _count?: { flashcards: number };
}

export interface QuizOption {
  id: string;
  optionText: string;
  isCorrect?: boolean;
  orderIndex: number;
}

export interface QuizQuestion {
  id: string;
  quizId: string;
  questionText: string;
  questionType: 'MULTIPLE_CHOICE' | 'TRUE_FALSE';
  marks: number;
  explanation?: string | null;
  orderIndex: number;
  options: QuizOption[];
}

export interface Quiz {
  id: string;
  studentId: string;
  subjectId?: string | null;
  title: string;
  description?: string | null;
  durationMinutes: number;
  totalMarks: number;
  questions?: QuizQuestion[];
  subject?: SubjectSummary | null;
  _count?: { questions: number; attempts: number };
}

export interface QuizAttempt {
  id: string;
  quizId: string;
  studentId: string;
  score: number;
  percentage: number;
  totalQuestions: number;
  correctAnswers: number;
  wrongAnswers: number;
  timeSpentSeconds: number;
  startedAt: string;
  completedAt?: string | null;
  answers?: any[];
}
