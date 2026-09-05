'use client';

import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { FormLayout, FormLayoutSize } from '../ui/FormLayout';
import { Button } from '../ui/Button';
import { FormInput } from '../ui/FormInput';
import { FormSelect } from '../ui/FormSelect';
import { FormTextarea } from '../ui/FormTextarea';
import { Goal } from '@/types/study.types';
import { studyService } from '@/services/studyService';
import { Target, Edit2 } from 'lucide-react';

export const goalSchema = z.object({
  title: z.string().min(1, 'Title is required').max(150),
  description: z.string().max(500).optional(),
  targetDate: z.string().min(1, 'Target date is required'),
  metricType: z.enum(['STUDY_HOURS', 'TASKS_COMPLETED', 'EXAM_SCORE', 'ATTENDANCE_PERCENT']).default('STUDY_HOURS'),
  targetValue: z.coerce.number().min(1, 'Target must be > 0'),
  currentValue: z.coerce.number().min(0).default(0),
});

export type GoalFormValues = z.infer<typeof goalSchema>;

export interface GoalFormProps {
  isOpen: boolean;
  onClose: () => void;
  goal?: Goal | null;
  goalId?: string | null;
  onSubmit: (data: GoalFormValues) => Promise<void>;
  isLoading?: boolean;
  size?: FormLayoutSize;
}

export const GoalForm: React.FC<GoalFormProps> = ({
  isOpen,
  onClose,
  goal,
  goalId,
  onSubmit,
  isLoading = false,
  size = 'md',
}) => {
  const [internalGoal, setInternalGoal] = useState<Goal | null>(null);
  const [isFetchingGoal, setIsFetchingGoal] = useState(false);

  // Fetch goal if goalId provided without goal object
  useEffect(() => {
    if (isOpen && goalId && !goal) {
      let isMounted = true;
      setIsFetchingGoal(true);
      studyService
        .getGoalById(goalId)
        .then((res) => {
          if (isMounted && res) {
            setInternalGoal(res);
          }
        })
        .catch((err) => {
          console.error('Failed to fetch goal by ID:', err);
        })
        .finally(() => {
          if (isMounted) setIsFetchingGoal(false);
        });

      return () => {
        isMounted = false;
      };
    } else if (!isOpen) {
      setInternalGoal(null);
      setIsFetchingGoal(false);
    }
  }, [isOpen, goalId, goal]);

  const activeGoal = goal || internalGoal;
  const isEditMode = Boolean(activeGoal || goalId);

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

  // Populate form with fetched data
  useEffect(() => {
    if (isOpen) {
      if (activeGoal) {
        reset({
          title: activeGoal.title,
          description: activeGoal.description || '',
          targetDate: new Date(activeGoal.targetDate).toISOString().split('T')[0],
          metricType: activeGoal.metricType as any,
          targetValue: activeGoal.targetValue,
          currentValue: activeGoal.currentValue,
        });
      } else if (!goalId) {
        reset({
          title: '',
          description: '',
          targetDate: new Date().toISOString().split('T')[0],
          metricType: 'STUDY_HOURS',
          targetValue: 40,
          currentValue: 0,
        });
      }
    }
  }, [isOpen, activeGoal, goalId, reset]);

  return (
    <FormLayout
      isOpen={isOpen}
      onClose={onClose}
      title={isEditMode ? 'Edit Target Goal' : 'Set Academic Target Goal'}
      description={
        isEditMode
          ? 'Update your academic goal targets or progress milestones.'
          : 'Establish measurable goals for your semester.'
      }
      icon={isEditMode ? <Edit2 className="w-5 h-5" /> : <Target className="w-5 h-5" />}
      size={size}
      isLoading={isFetchingGoal}
      loadingMessage="Fetching goal details from server..."
      footer={
        <div className="flex items-center justify-end gap-2 w-full">
          <Button type="button" variant="ghost" onClick={onClose} disabled={isSubmitting || isLoading}>
            Cancel
          </Button>
          <Button
            type="button"
            variant="primary"
            isLoading={isSubmitting || isLoading}
            onClick={handleSubmit(onSubmit)}
          >
            {isEditMode ? 'Update Goal' : 'Save Goal'}
          </Button>
        </div>
      }
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
            label="Current Progress"
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
      </form>
    </FormLayout>
  );
};

export default GoalForm;
