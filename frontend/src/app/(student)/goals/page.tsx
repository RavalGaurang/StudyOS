'use client';

import React, { useState, useEffect } from 'react';
import { studyService } from '../../../services/studyService';
import { Goal } from '../../../types/study.types';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { Modal } from '../../../components/ui/Modal';
import { FormInput } from '../../../components/ui/FormInput';
import { FormSelect } from '../../../components/ui/FormSelect';
import { FormTextarea } from '../../../components/ui/FormTextarea';
import { LoadingState } from '../../../components/ui/LoadingState';
import { EmptyState } from '../../../components/ui/EmptyState';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Target, Plus, Calendar, CheckCircle2, Trash2 } from 'lucide-react';
import { formatDate } from '../../../lib/utils';

const goalSchema = z.object({
  title: z.string().min(1, 'Title is required').max(150),
  description: z.string().max(500).optional(),
  targetDate: z.string().min(1, 'Target date is required'),
  metricType: z.enum(['STUDY_HOURS', 'TASKS_COMPLETED', 'EXAM_SCORE', 'ATTENDANCE_PERCENT']).default('STUDY_HOURS'),
  targetValue: z.coerce.number().positive('Must be greater than 0'),
  currentValue: z.coerce.number().min(0).default(0),
});

type GoalFormValues = z.infer<typeof goalSchema>;

export default function GoalsPage() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const {
    control,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = useForm<GoalFormValues>({
    resolver: zodResolver(goalSchema) as any,
    defaultValues: {
      title: '',
      description: '',
      targetDate: new Date().toISOString().split('T')[0],
      metricType: 'STUDY_HOURS',
      targetValue: 40,
      currentValue: 0,
    },
  });

  const loadGoals = async () => {
    setLoading(true);
    try {
      const data = await studyService.getGoals();
      setGoals(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadGoals();
  }, []);

  const onSubmit = async (values: GoalFormValues) => {
    try {
      await studyService.createGoal({
        ...values,
        targetDate: new Date(values.targetDate).toISOString(),
      });
      setIsCreateOpen(false);
      reset();
      loadGoals();
    } catch {
      // Error is caught and displayed by the global toast interceptor
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await studyService.deleteGoal(id);
      loadGoals();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <LoadingState message="Loading academic goals..." />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
            Academic Goals & Targets
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Set and monitor targets for study hours, test scores, and attendance.
          </p>
        </div>

        <Button
          variant="primary"
          size="md"
          onClick={() => setIsCreateOpen(true)}
          leftIcon={<Plus className="w-4 h-4" />}
          className="shadow-lg shadow-indigo-500/20"
        >
          Set New Goal
        </Button>
      </div>

      {goals.length === 0 ? (
        <EmptyState
          title="No goals set"
          description="Establish target milestones to keep your academic momentum strong."
          action={
            <Button variant="primary" onClick={() => setIsCreateOpen(true)}>
              + Set First Goal
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {goals.map((g) => {
            const percent = Math.min(100, Math.round((g.currentValue / g.targetValue) * 100));
            return (
              <Card key={g.id} className="p-5 flex flex-col justify-between space-y-4">
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <Badge variant="primary">{g.metricType.replace(/_/g, ' ')}</Badge>
                    <Badge variant={percent >= 100 ? 'success' : 'neutral'}>
                      {percent >= 100 ? 'Completed' : 'In Progress'}
                    </Badge>
                  </div>

                  <h3 className="font-bold text-base text-slate-900 dark:text-slate-100 mt-2">
                    {g.title}
                  </h3>
                  {g.description && (
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      {g.description}
                    </p>
                  )}

                  {/* Progress bar */}
                  <div className="space-y-1 mt-4">
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span className="text-slate-500">Progress</span>
                      <span className="text-indigo-500">
                        {g.currentValue} / {g.targetValue} ({percent}%)
                      </span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-indigo-500 transition-all"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-400">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" /> Target: {formatDate(g.targetDate)}
                  </span>
                  <button
                    onClick={() => handleDelete(g.id)}
                    className="p-1 text-slate-400 hover:text-rose-500 rounded"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Modal: Set Goal */}
      <Modal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Set Academic Target Goal"
        description="Establish measurable goals for your semester."
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <FormInput
            name="title"
            label="Goal Title"
            required
            placeholder="e.g. Log 40 Study Hours this Month"
            control={control}
          />

          <FormTextarea
            name="description"
            label="Description (Optional)"
            placeholder="Action plan or strategy to achieve this..."
            control={control}
          />

          <FormSelect
            name="metricType"
            label="Metric Type"
            required
            options={[
              { value: 'STUDY_HOURS', label: 'Total Study Hours' },
              { value: 'TASKS_COMPLETED', label: 'Tasks Completed' },
              { value: 'EXAM_SCORE', label: 'Target Exam Score (%)' },
              { value: 'ATTENDANCE_PERCENT', label: 'Attendance Percentage (%)' },
            ]}
            control={control}
          />

          <div className="grid grid-cols-2 gap-3">
            <FormInput
              name="targetValue"
              label="Target Value"
              type="number"
              required
              control={control}
            />

            <FormInput
              name="currentValue"
              label="Current Progress (Initial)"
              type="number"
              control={control}
            />
          </div>

          <FormInput
            name="targetDate"
            label="Target Deadline"
            type="date"
            required
            control={control}
          />

          <div className="flex justify-end gap-2 pt-3">
            <Button type="button" variant="ghost" onClick={() => setIsCreateOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={isSubmitting}>
              Save Goal
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
