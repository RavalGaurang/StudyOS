'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { FormLayout, FormLayoutSize } from '../ui/FormLayout';
import { Button } from '../ui/Button';
import { FormInput } from '../ui/FormInput';
import { FormSelect } from '../ui/FormSelect';
import { Subject, TimetableEvent } from '@/types/academic.types';
import { Calendar, Plus } from 'lucide-react';

export const timetableSchema = z.object({
  title: z.string().min(1, 'Title is required').max(150),
  subjectId: z.string().optional(),
  dayOfWeek: z.coerce.number().min(0).max(6),
  startTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Format HH:mm'),
  endTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Format HH:mm'),
  room: z.string().optional(),
  location: z.string().optional(),
});

export type TimetableFormValues = z.infer<typeof timetableSchema>;

export interface TimetableFormProps {
  isOpen: boolean;
  onClose: () => void;
  subjects: Subject[];
  onSubmit: (data: TimetableFormValues) => Promise<void>;
  isLoading?: boolean;
  size?: FormLayoutSize;
}

export const TimetableForm: React.FC<TimetableFormProps> = ({
  isOpen,
  onClose,
  subjects,
  onSubmit,
  isLoading = false,
  size = 'lg',
}) => {
  const {
    control,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = useForm<TimetableFormValues>({
    resolver: zodResolver(timetableSchema) as any,
    defaultValues: {
      title: '',
      subjectId: '',
      dayOfWeek: 1,
      startTime: '09:00',
      endTime: '10:30',
      room: 'LH-101',
      location: 'Science Block',
    },
  });

  const handleFormSubmit = async (values: TimetableFormValues) => {
    await onSubmit(values);
    reset();
  };

  const subjectOptions = [
    { value: '', label: '-- General Session / No Subject --' },
    ...subjects.map((s) => ({ value: s.id, label: s.name })),
  ];

  return (
    <FormLayout
      isOpen={isOpen}
      onClose={onClose}
      title="Add Timetable Class"
      description="Schedule a recurring weekly lecture, tutorial, or lab session."
      icon={<Calendar className="w-5 h-5" />}
      size={size}
      isLoading={isLoading}
      footer={
        <div className="flex items-center justify-end gap-2 w-full">
          <Button type="button" variant="ghost" onClick={onClose} disabled={isSubmitting || isLoading}>
            Cancel
          </Button>
          <Button
            type="button"
            variant="primary"
            isLoading={isSubmitting || isLoading}
            onClick={handleSubmit(handleFormSubmit)}
          >
            Add Class
          </Button>
        </div>
      }
    >
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
        <FormInput
          name="title"
          label="Class / Session Title"
          required
          placeholder="e.g. Operating Systems Lecture"
          control={control}
        />

        <FormSelect
          name="subjectId"
          label="Subject (Optional)"
          options={subjectOptions}
          control={control}
        />

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <FormSelect
            name="dayOfWeek"
            label="Day of Week"
            required
            options={[
              { value: 1, label: 'Monday' },
              { value: 2, label: 'Tuesday' },
              { value: 3, label: 'Wednesday' },
              { value: 4, label: 'Thursday' },
              { value: 5, label: 'Friday' },
              { value: 6, label: 'Saturday' },
              { value: 0, label: 'Sunday' },
            ]}
            control={control}
          />

          <FormInput
            name="startTime"
            label="Start Time (HH:mm)"
            required
            placeholder="09:00"
            control={control}
          />

          <FormInput
            name="endTime"
            label="End Time (HH:mm)"
            required
            placeholder="10:30"
            control={control}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <FormInput
            name="room"
            label="Room / Lab No. (Optional)"
            placeholder="e.g. Hall B-2"
            control={control}
          />

          <FormInput
            name="location"
            label="Building / Campus Block (Optional)"
            placeholder="e.g. Tech Tower 4th Floor"
            control={control}
          />
        </div>
      </form>
    </FormLayout>
  );
};

export default TimetableForm;
