'use client';

import React, { useState, useEffect } from 'react';
import { quizService } from '../../../services/quizService';
import { subjectService } from '../../../services/subjectService';
import { Quiz } from '../../../types/study.types';
import { Subject } from '../../../types/academic.types';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { Modal } from '../../../components/ui/Modal';
import { FormInput } from '../../../components/ui/FormInput';
import { FormSelect } from '../../../components/ui/FormSelect';
import { LoadingState } from '../../../components/ui/LoadingState';
import { EmptyState } from '../../../components/ui/EmptyState';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { HelpCircle, Plus, Play, Clock, Award, ArrowRight } from 'lucide-react';
import Link from 'next/link';

const createQuizSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  subjectId: z.string().optional(),
  durationMinutes: z.coerce.number().positive().default(15),
  q1_text: z.string().min(1, 'Question 1 is required'),
  q1_opt1: z.string().min(1, 'Option 1 required'),
  q1_opt2: z.string().min(1, 'Option 2 required'),
  q1_correct: z.coerce.number().min(1).max(2).default(1),
  q1_explanation: z.string().optional(),
});

type CreateQuizFormValues = z.infer<typeof createQuizSchema>;

export default function QuizzesPage() {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const {
    control,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = useForm<CreateQuizFormValues>({
    resolver: zodResolver(createQuizSchema) as any,
    defaultValues: {
      title: '',
      subjectId: '',
      durationMinutes: 15,
      q1_text: '',
      q1_opt1: '',
      q1_opt2: '',
      q1_correct: 1,
      q1_explanation: '',
    },
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const [quizRes, subRes] = await Promise.all([
        quizService.getQuizzes(),
        subjectService.getSubjects(),
      ]);
      setQuizzes(quizRes);
      setSubjects(subRes);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const onSubmit = async (values: CreateQuizFormValues) => {
    try {
      await quizService.createQuiz({
        title: values.title,
        subjectId: values.subjectId || undefined,
        durationMinutes: values.durationMinutes,
        questions: [
          {
            questionText: values.q1_text,
            questionType: 'MULTIPLE_CHOICE',
            marks: 1,
            explanation: values.q1_explanation,
            orderIndex: 1,
            options: [
              { optionText: values.q1_opt1, isCorrect: values.q1_correct === 1, orderIndex: 1 },
              { optionText: values.q1_opt2, isCorrect: values.q1_correct === 2, orderIndex: 2 },
            ],
          },
        ],
      });
      setIsCreateOpen(false);
      reset();
      loadData();
    } catch {
      // Error is caught and displayed by the global toast interceptor
    }
  };

  const subjectOptions = [
    { value: '', label: '-- General Topic / No Subject --' },
    ...subjects.map((s) => ({ value: s.id, label: s.name })),
  ];

  if (loading) return <LoadingState message="Loading quizzes library..." />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
            Interactive Quizzes & Practice Tests
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Test active recall with auto-graded MCQ and True/False questions.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/ai">
            <Button variant="secondary" size="md" leftIcon={<HelpCircle className="w-4 h-4" />}>
              AI Quiz Generator
            </Button>
          </Link>
          <Button
            variant="primary"
            size="md"
            onClick={() => setIsCreateOpen(true)}
            leftIcon={<Plus className="w-4 h-4" />}
          >
            Create Quiz
          </Button>
        </div>
      </div>

      {quizzes.length === 0 ? (
        <EmptyState
          title="No quizzes available"
          description="Create your first quiz or use the AI generator to test your course knowledge."
          action={
            <Button variant="primary" onClick={() => setIsCreateOpen(true)}>
              + Create Quiz
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {quizzes.map((quiz) => (
            <Card key={quiz.id} hoverable className="p-5 flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  {quiz.subject && (
                    <span
                      className="text-[10px] font-bold px-2 py-0.5 rounded"
                      style={{
                        backgroundColor: `${quiz.subject.color}15`,
                        color: quiz.subject.color,
                      }}
                    >
                      {quiz.subject.name}
                    </span>
                  )}
                  <Badge variant="info">{quiz.durationMinutes || 15} Mins</Badge>
                </div>

                <h3 className="font-bold text-base text-slate-900 dark:text-slate-100 mt-1">
                  {quiz.title}
                </h3>
                {quiz.description && (
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                    {quiz.description}
                  </p>
                )}

                <div className="flex items-center gap-4 mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500">
                  <div className="flex items-center gap-1.5">
                    <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
                    <span>{quiz._count?.questions || 0} Questions</span>
                  </div>
                  <div className="flex items-center gap-1.5 ml-auto">
                    <Award className="w-3.5 h-3.5 text-slate-400" />
                    <span>{quiz._count?.attempts || 0} Attempts</span>
                  </div>
                </div>
              </div>

              <Link href={`/quizzes/${quiz.id}`} className="mt-4">
                <Button
                  variant="primary"
                  size="sm"
                  className="w-full font-bold shadow-md shadow-indigo-500/20"
                  rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
                >
                  Take Practice Quiz
                </Button>
              </Link>
            </Card>
          ))}
        </div>
      )}

      {/* Modal: Create Quiz */}
      <Modal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Create Practice Quiz"
        description="Add a quiz and test questions."
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <FormInput
            name="title"
            label="Quiz Title"
            required
            placeholder="e.g. Database Normalization & BCNF Check"
            control={control}
          />

          <div className="grid grid-cols-2 gap-3">
            <FormSelect
              name="subjectId"
              label="Subject (Optional)"
              options={subjectOptions}
              control={control}
            />

            <FormInput
              name="durationMinutes"
              label="Duration (Minutes)"
              type="number"
              required
              control={control}
            />
          </div>

          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-3">
            <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">Question 1</h4>
            <FormInput
              name="q1_text"
              label="Question Text"
              required
              placeholder="e.g. In BCNF, must every determinant be a super key?"
              control={control}
            />

            <div className="grid grid-cols-2 gap-2">
              <FormInput
                name="q1_opt1"
                label="Option 1"
                required
                placeholder="True / Yes"
                control={control}
              />
              <FormInput
                name="q1_opt2"
                label="Option 2"
                required
                placeholder="False / No"
                control={control}
              />
            </div>

            <FormSelect
              name="q1_correct"
              label="Correct Option"
              required
              options={[
                { value: 1, label: 'Option 1 is correct' },
                { value: 2, label: 'Option 2 is correct' },
              ]}
              control={control}
            />

            <FormInput
              name="q1_explanation"
              label="Explanation (Optional)"
              placeholder="Why this answer is correct..."
              control={control}
            />
          </div>

          <div className="flex justify-end gap-2 pt-3">
            <Button type="button" variant="ghost" onClick={() => setIsCreateOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={isSubmitting}>
              Create Quiz
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
