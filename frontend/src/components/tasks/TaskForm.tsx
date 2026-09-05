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
import { Task, Subject } from '@/types/academic.types';
import { taskService } from '@/services/taskService';
import { CheckSquare, Edit2, Plus } from 'lucide-react';

export const taskFormSchema = z.object({
  title: z.string().min(1, 'Task title is required').max(200),
  description: z.string().max(2000).optional(),
  dueDate: z.string().optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).default('MEDIUM'),
  subjectId: z.string().optional(),
});

export type TaskFormValues = z.infer<typeof taskFormSchema>;

export interface TaskFormProps {
  isOpen: boolean;
  onClose: () => void;
  task?: Task | null;
  taskId?: string | null;
  subjects: Subject[];
  onSubmit: (data: TaskFormValues) => Promise<void>;
  isLoading?: boolean;
  size?: FormLayoutSize;
}

export const TaskForm: React.FC<TaskFormProps> = ({
  isOpen,
  onClose,
  task,
  taskId,
  subjects,
  onSubmit,
  isLoading = false,
  size = 'md',
}) => {
  const [internalTask, setInternalTask] = useState<Task | null>(null);
  const [isFetchingTask, setIsFetchingTask] = useState(false);

  // Fetch task if taskId provided without task object
  useEffect(() => {
    if (isOpen && taskId && !task) {
      let isMounted = true;
      setIsFetchingTask(true);
      taskService
        .getTaskById(taskId)
        .then((res) => {
          if (isMounted && res) {
            setInternalTask(res);
          }
        })
        .catch((err) => {
          console.error('Failed to fetch task by ID:', err);
        })
        .finally(() => {
          if (isMounted) setIsFetchingTask(false);
        });

      return () => {
        isMounted = false;
      };
    } else if (!isOpen) {
      setInternalTask(null);
      setIsFetchingTask(false);
    }
  }, [isOpen, taskId, task]);

  const activeTask = task || internalTask;
  const isEditMode = Boolean(activeTask || taskId);

  const {
    control,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = useForm<TaskFormValues>({
    resolver: zodResolver(taskFormSchema) as any,
    defaultValues: {
      title: '',
      description: '',
      dueDate: new Date().toISOString().split('T')[0],
      priority: 'MEDIUM',
      subjectId: '',
    },
  });

  // Populate form with fetched data
  useEffect(() => {
    if (isOpen) {
      if (activeTask) {
        reset({
          title: activeTask.title,
          description: activeTask.description || '',
          dueDate: activeTask.dueDate ? new Date(activeTask.dueDate).toISOString().split('T')[0] : '',
          priority: activeTask.priority as any,
          subjectId: activeTask.subjectId || '',
        });
      } else if (!taskId) {
        reset({
          title: '',
          description: '',
          dueDate: new Date().toISOString().split('T')[0],
          priority: 'MEDIUM',
          subjectId: '',
        });
      }
    }
  }, [isOpen, activeTask, taskId, reset]);

  const subjectOptions = [
    { value: '', label: '-- No Subject (General Task) --' },
    ...subjects.map((s) => ({ value: s.id, label: s.name })),
  ];

  return (
    <FormLayout
      isOpen={isOpen}
      onClose={onClose}
      title={isEditMode ? 'Edit Task' : 'Create New Task'}
      description={
        isEditMode
          ? 'Update task details, deadline, priority, or subject association.'
          : 'Add a task with deadline, priority, and subject association.'
      }
      icon={isEditMode ? <Edit2 className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
      size={size}
      isLoading={isFetchingTask}
      loadingMessage="Fetching task details from server..."
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
            {isEditMode ? 'Update Task' : 'Create Task'}
          </Button>
        </div>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <FormInput
          name="title"
          label="Task Title"
          required
          placeholder="e.g. Complete BCNF problem set 4"
          control={control}
        />

        <FormTextarea
          name="description"
          label="Description / Notes (Optional)"
          placeholder="Additional requirements or context..."
          control={control}
        />

        <div className="grid grid-cols-2 gap-3">
          <FormSelect
            name="subjectId"
            label="Subject (Optional)"
            options={subjectOptions}
            control={control}
          />

          <FormSelect
            name="priority"
            label="Priority Level"
            options={[
              { value: 'LOW', label: 'Low' },
              { value: 'MEDIUM', label: 'Medium' },
              { value: 'HIGH', label: 'High' },
              { value: 'URGENT', label: 'Urgent' },
            ]}
            control={control}
          />
        </div>

        <FormInput
          name="dueDate"
          label="Due Date"
          type="date"
          control={control}
        />
      </form>
    </FormLayout>
  );
};

export default TaskForm;
