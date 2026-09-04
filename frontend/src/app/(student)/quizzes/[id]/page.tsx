'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { quizService } from '../../../../services/quizService';
import { Quiz, QuizAttempt } from '../../../../types/study.types';
import { Card } from '../../../../components/ui/Card';
import { Button } from '../../../../components/ui/Button';
import { Badge } from '../../../../components/ui/Badge';
import { LoadingState } from '../../../../components/ui/LoadingState';
import { ErrorState } from '../../../../components/ui/ErrorState';
import {
  ArrowLeft,
  Clock,
  CheckCircle2,
  XCircle,
  Award,
  HelpCircle,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import Link from 'next/link';

export default function TakeQuizPage() {
  const params = useParams();
  const router = useRouter();
  const quizId = params.id as string;

  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [attemptResult, setAttemptResult] = useState<QuizAttempt | null>(null);
  const [timeRemaining, setTimeRemaining] = useState(15 * 60);

  useEffect(() => {
    async function loadQuiz() {
      setLoading(true);
      try {
        const data = await quizService.getQuizById(quizId);
        setQuiz(data);
        setTimeRemaining((data.durationMinutes || 15) * 60);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadQuiz();
  }, [quizId]);

  // Timer Tick
  useEffect(() => {
    if (!attemptResult && timeRemaining > 0) {
      const timer = setInterval(() => {
        setTimeRemaining((prev) => Math.max(0, prev - 1));
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [attemptResult, timeRemaining]);

  const handleSelectOption = (questionId: string, optionId: string) => {
    if (attemptResult) return; // Prevent change after submit
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionId]: optionId,
    }));
  };

  const handleSubmitQuiz = async () => {
    if (!quiz) return;
    setSubmitting(true);
    try {
      const answersPayload = Object.entries(selectedAnswers).map(([qId, optId]) => ({
        questionId: qId,
        selectedOptionId: optId,
      }));

      const totalTimeSpent = (quiz.durationMinutes || 15) * 60 - timeRemaining;

      const res = await quizService.submitAttempt(quiz.id, {
        answers: answersPayload,
        timeSpentSeconds: totalTimeSpent,
      });

      setAttemptResult(res);
    } catch {
      // Error is caught and displayed by the global toast interceptor
    } finally {
      setSubmitting(false);
    }
  };

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) return <LoadingState message="Loading practice test..." />;
  if (!quiz) return <ErrorState message="Quiz not found" onRetry={() => router.push('/quizzes')} />;

  const questions = quiz.questions || [];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Link
          href="/quizzes"
          className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-slate-100"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Quizzes
        </Link>

        {!attemptResult && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 text-xs font-bold">
            <Clock className="w-3.5 h-3.5" />
            <span>Time Left: {formatTimer(timeRemaining)}</span>
          </div>
        )}
      </div>

      {/* Quiz Details Banner */}
      <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-violet-700 text-white shadow-xl shadow-indigo-500/15 border border-indigo-400/30">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              {quiz.subject && (
                <span
                  className="text-xs font-bold px-2 py-0.5 rounded bg-white/20 text-white"
                >
                  {quiz.subject.name}
                </span>
              )}
              <span className="text-xs text-indigo-100">
                {questions.length} Questions • {quiz.totalMarks} Total Marks
              </span>
            </div>
            <h1 className="text-2xl font-black text-white mt-1">{quiz.title}</h1>
            {quiz.description && (
              <p className="text-xs text-indigo-100 mt-1">{quiz.description}</p>
            )}
          </div>
        </div>
      </div>

      {/* Results View when Attempt Completed */}
      {attemptResult && (
        <div className="p-6 rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-violet-700 text-white shadow-xl shadow-indigo-500/20 border border-indigo-400/30 text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-white text-indigo-600 flex items-center justify-center mx-auto shadow-lg">
            <Award className="w-6 h-6 text-indigo-600" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-white">
              Quiz Completed! You scored {attemptResult.score} / {quiz.totalMarks} (
              {attemptResult.percentage}%)
            </h2>
            <p className="text-xs text-indigo-100 mt-1">
              Correct: {attemptResult.correctAnswers} • Wrong: {attemptResult.wrongAnswers} •
              Time: {formatTimer(attemptResult.timeSpentSeconds)}
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              onClick={() => {
                setAttemptResult(null);
                setSelectedAnswers({});
                setTimeRemaining((quiz.durationMinutes || 15) * 60);
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-white/20 hover:bg-white/30 text-white border border-white/25 backdrop-blur-sm transition-all active:scale-[0.98]"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Retake Quiz</span>
            </button>
            <Link href="/quizzes">
              <button className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-white text-indigo-700 hover:bg-indigo-50 shadow-md transition-all active:scale-[0.98]">
                Done & Return
              </button>
            </Link>
          </div>
        </div>
      )}

      {/* Questions Form */}
      <div className="space-y-4">
        {questions.map((question, qIdx) => {
          const selectedOptId = selectedAnswers[question.id];
          const evaluatedAns = attemptResult?.answers?.find((a: any) => a.questionId === question.id);

          return (
            <Card key={question.id} className="p-5 space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                    Q{qIdx + 1}
                  </span>
                  <span className="text-xs text-slate-400 font-semibold">
                    {question.marks} {question.marks === 1 ? 'Mark' : 'Marks'}
                  </span>
                </div>

                {evaluatedAns && (
                  <Badge variant={evaluatedAns.isCorrect ? 'success' : 'danger'}>
                    {evaluatedAns.isCorrect ? 'Correct (+1)' : 'Incorrect (0)'}
                  </Badge>
                )}
              </div>

              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                {question.questionText}
              </h3>

              {/* Options */}
              <div className="space-y-2 pt-2">
                {question.options.map((option) => {
                  const isSelected = selectedOptId === option.id;
                  const isAnswerCorrectOption = option.isCorrect;

                  let borderStyle = 'border-slate-200 dark:border-slate-800 hover:border-indigo-500';
                  if (isSelected) {
                    borderStyle = 'border-indigo-600 bg-indigo-50/30 dark:bg-indigo-950/30 text-indigo-900 dark:text-indigo-200 font-bold';
                  }

                  if (evaluatedAns) {
                    if (isAnswerCorrectOption) {
                      borderStyle = 'border-emerald-500 bg-emerald-50/40 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 font-bold';
                    } else if (isSelected && !evaluatedAns.isCorrect) {
                      borderStyle = 'border-rose-500 bg-rose-50/40 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 font-bold';
                    }
                  }

                  return (
                    <div
                      key={option.id}
                      onClick={() => handleSelectOption(question.id, option.id)}
                      className={`flex items-center justify-between p-3 rounded-xl border text-xs transition-all cursor-pointer select-none ${borderStyle}`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                            isSelected
                              ? 'border-indigo-600 bg-indigo-600 text-white'
                              : 'border-slate-300 dark:border-slate-600'
                          }`}
                        >
                          {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                        </div>
                        <span>{option.optionText}</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Answer Explanation once submitted */}
              {evaluatedAns && question.explanation && (
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300 mt-3">
                  <span className="font-bold text-indigo-500">Explanation: </span>
                  {question.explanation}
                </div>
              )}
            </Card>
          );
        })}
      </div>

      {/* Submit Button */}
      {!attemptResult && (
        <div className="flex justify-end pt-4">
          <Button
            size="lg"
            variant="primary"
            onClick={handleSubmitQuiz}
            isLoading={submitting}
            className="px-8 font-bold shadow-xl shadow-indigo-600/30"
          >
            Submit & Grade Quiz
          </Button>
        </div>
      )}
    </div>
  );
}
