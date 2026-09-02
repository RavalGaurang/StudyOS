'use client';

import React, { useState, useEffect } from 'react';
import { examService } from '../../../services/examService';
import { subjectService } from '../../../services/subjectService';
import { Exam, Subject } from '../../../types/academic.types';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { Modal } from '../../../components/ui/Modal';
import { FormInput } from '../../../components/ui/FormInput';
import { FormSelect } from '../../../components/ui/FormSelect';
import { FormTextarea } from '../../../components/ui/FormTextarea';
import { ConfirmDialog } from '../../../components/ui/ConfirmDialog';
import { LoadingState } from '../../../components/ui/LoadingState';
import { EmptyState } from '../../../components/ui/EmptyState';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Calendar, Clock, MapPin, Award, Trash2 } from 'lucide-react';
import { formatDate, getDaysRemaining } from '../../../lib/utils';

const examSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  subjectId: z.string().min(1, 'Subject is required'),
  examDate: z.string().min(1, 'Exam date is required'),
  durationMinutes: z.coerce.number().positive().default(120),
  maxMarks: z.coerce.number().positive().default(100),
  weightagePercent: z.coerce.number().min(0).max(100).optional(),
  roomLocation: z.string().optional(),
  notes: z.string().max(2000).optional(),
});

type ExamFormValues = z.infer<typeof examSchema>;

export default function ExamsPage() {
  const [exams, setExams] = useState<Exam[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = useForm<ExamFormValues>({
    resolver: zodResolver(examSchema),
    defaultValues: {
      title: '',
      subjectId: '',
      examDate: new Date().toISOString().split('T')[0],
      durationMinutes: 120,
      maxMarks: 100,
      weightagePercent: 30,
      roomLocation: 'Lecture Hall 101',
      notes: '',
    },
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const [exRes, subRes] = await Promise.all([
        examService.getExams(),
        subjectService.getSubjects(),
      ]);
      setExams(exRes);
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

  const onSubmit = async (values: ExamFormValues) => {
    try {
      await examService.createExam({
        ...values,
        examDate: new Date(values.examDate).toISOString(),
      });
      setIsCreateOpen(false);
      reset();
      loadData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to schedule exam');
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await examService.deleteExam(deleteId);
      setDeleteId(null);
      loadData();
    } catch (err) {
      console.error(err);
    }
  };

  const subjectOptions = subjects.map((s) => ({ value: s.id, label: s.name }));

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
            Exams & Test Schedules
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Track mid-terms, final exams, quizzes, and grade weightage.
          </p>
        </div>

        <Button
          variant="primary"
          size="md"
          onClick={() => setIsCreateOpen(true)}
          leftIcon={<Plus className="w-4 h-4" />}
          className="shadow-lg shadow-indigo-500/20"
        >
          Schedule Exam
        </Button>
      </div>

      {loading ? (
        <LoadingState message="Loading exam schedules..." />
      ) : exams.length === 0 ? (
        <EmptyState
          title="No exams scheduled"
          description="Schedule your upcoming mid-terms, practicals, or quizzes."
          action={
            <Button variant="primary" onClick={() => setIsCreateOpen(true)}>
              + Schedule Exam
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {exams.map((exam) => {
            const daysLeft = getDaysRemaining(exam.examDate);
            return (
              <Card key={exam.id} className="p-5 flex flex-col justify-between">
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    {exam.subject && (
                      <span
                        className="text-[10px] font-bold px-2 py-0.5 rounded"
                        style={{
                          backgroundColor: `${exam.subject.color}15`,
                          color: exam.subject.color,
                        }}
                      >
                        {exam.subject.name}
                      </span>
                    )}

                    <Badge variant={daysLeft <= 7 ? 'danger' : 'warning'}>
                      {daysLeft <= 0 ? 'Today' : `in ${daysLeft} days`}
                    </Badge>
                  </div>

                  <h3 className="font-bold text-base text-slate-900 dark:text-slate-100 mt-1">
                    {exam.title}
                  </h3>

                  {exam.notes && (
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                      {exam.notes}
                    </p>
                  )}

                  <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span>{formatDate(exam.examDate)}</span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>{exam.durationMinutes || 120} Minutes</span>
                    </div>

                    {exam.roomLocation && (
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        <span>{exam.roomLocation}</span>
                      </div>
                    )}

                    {exam.weightagePercent && (
                      <div className="flex items-center gap-1.5">
                        <Award className="w-3.5 h-3.5 text-indigo-400" />
                        <span className="font-semibold text-indigo-500">
                          {exam.weightagePercent}% Weight
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between mt-4 pt-2">
                  <span className="text-xs font-bold text-slate-600 dark:text-slate-300">
                    {exam.obtainedMarks !== null && exam.obtainedMarks !== undefined
                      ? `Score: ${exam.obtainedMarks} / ${exam.maxMarks}`
                      : `${exam.maxMarks} Max Marks`}
                  </span>

                  <button
                    onClick={() => setDeleteId(exam.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-500 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Modal: Schedule Exam */}
      <Modal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Schedule Exam / Test"
        description="Add examination date, room location, and grade weightage."
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <FormInput
            name="title"
            label="Exam Title"
            placeholder="e.g. DBMS Mid-Term Examination"
            control={control}
          />

          <FormSelect
            name="subjectId"
            label="Subject"
            options={subjectOptions}
            control={control}
          />

          <div className="grid grid-cols-2 gap-3">
            <FormInput
              name="examDate"
              label="Exam Date"
              type="date"
              control={control}
            />

            <FormInput
              name="durationMinutes"
              label="Duration (Minutes)"
              type="number"
              control={control}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <FormInput
              name="maxMarks"
              label="Max Marks"
              type="number"
              control={control}
            />

            <FormInput
              name="weightagePercent"
              label="Weightage % in Final Grade"
              type="number"
              control={control}
            />
          </div>

          <FormInput
            name="roomLocation"
            label="Exam Hall / Room Location"
            placeholder="e.g. Lecture Hall 204"
            control={control}
          />

          <FormTextarea
            name="notes"
            label="Syllabus Scope & Notes"
            placeholder="Chapters covered, permitted materials..."
            control={control}
          />

          <div className="flex justify-end gap-2 pt-3">
            <Button type="button" variant="ghost" onClick={() => setIsCreateOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={isSubmitting}>
              Schedule Exam
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Delete Exam"
        message="Are you sure you want to remove this exam schedule?"
      />
    </div>
  );
}
