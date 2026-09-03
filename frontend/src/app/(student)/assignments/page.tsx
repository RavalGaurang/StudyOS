'use client';

import React, { useState, useEffect } from 'react';
import { assignmentService } from '../../../services/assignmentService';
import { subjectService } from '../../../services/subjectService';
import { Assignment, Subject } from '../../../types/academic.types';
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
import { Plus, Calendar, Award, Trash2 } from 'lucide-react';
import { formatDate } from '../../../lib/utils';

const assignmentSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  description: z.string().max(3000).optional(),
  subjectId: z.string().min(1, 'Please select a subject'),
  dueDate: z.string().min(1, 'Due date is required'),
  maxMarks: z.coerce.number().positive().default(100),
  status: z.enum(['PENDING', 'IN_PROGRESS', 'SUBMITTED', 'GRADED']).default('PENDING'),
});

type AssignmentFormValues = z.infer<typeof assignmentSchema>;

export default function AssignmentsPage() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = useForm<AssignmentFormValues>({
    resolver: zodResolver(assignmentSchema) as any,
    defaultValues: {
      title: '',
      description: '',
      subjectId: '',
      dueDate: new Date().toISOString().split('T')[0],
      maxMarks: 100,
      status: 'PENDING',
    },
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const [assRes, subRes] = await Promise.all([
        assignmentService.getAssignments(),
        subjectService.getSubjects(),
      ]);
      setAssignments(assRes);
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

  const onSubmit = async (values: AssignmentFormValues) => {
    try {
      await assignmentService.createAssignment({
        ...values,
        dueDate: new Date(values.dueDate).toISOString(),
      });
      setIsCreateOpen(false);
      reset();
      loadData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to save assignment');
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await assignmentService.deleteAssignment(deleteId);
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
            Assignments & Submissions
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Track problem sets, lab reports, deadlines, and grade results.
          </p>
        </div>

        <Button
          variant="primary"
          size="md"
          onClick={() => setIsCreateOpen(true)}
          leftIcon={<Plus className="w-4 h-4" />}
          className="shadow-lg shadow-indigo-500/20"
        >
          Add Assignment
        </Button>
      </div>

      {loading ? (
        <LoadingState message="Loading assignments..." />
      ) : assignments.length === 0 ? (
        <EmptyState
          title="No assignments recorded"
          description="Add your course homework and project deliverables to stay ahead of deadlines."
          action={
            <Button variant="primary" onClick={() => setIsCreateOpen(true)}>
              + Create Assignment
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {assignments.map((ass) => (
            <Card key={ass.id} className="p-5 flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    {ass.subject && (
                      <span
                        className="text-[10px] font-bold px-2 py-0.5 rounded"
                        style={{
                          backgroundColor: `${ass.subject.color}15`,
                          color: ass.subject.color,
                        }}
                      >
                        {ass.subject.name}
                      </span>
                    )}
                  </div>
                  <Badge
                    variant={
                      ass.status === 'GRADED'
                        ? 'success'
                        : ass.status === 'SUBMITTED'
                        ? 'info'
                        : ass.status === 'IN_PROGRESS'
                        ? 'warning'
                        : 'neutral'
                    }
                  >
                    {ass.status}
                  </Badge>
                </div>

                <h3 className="font-bold text-base text-slate-900 dark:text-slate-100 mt-1">
                  {ass.title}
                </h3>
                {ass.description && (
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                    {ass.description}
                  </p>
                )}

                <div className="flex items-center gap-4 mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>Due {formatDate(ass.dueDate)}</span>
                  </div>

                  <div className="flex items-center gap-1.5 ml-auto">
                    <Award className="w-3.5 h-3.5 text-slate-400" />
                    <span>
                      {ass.obtainedMarks !== null && ass.obtainedMarks !== undefined
                        ? `${ass.obtainedMarks} / ${ass.maxMarks || 100} Marks`
                        : `${ass.maxMarks || 100} Max Marks`}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 mt-4 pt-2">
                <button
                  onClick={() => setDeleteId(ass.id)}
                  className="p-1.5 text-slate-400 hover:text-rose-500 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                  title="Delete assignment"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Modal: Create Assignment */}
      <Modal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Add New Assignment"
        description="Enter deadline and grading details for this assignment."
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <FormInput
            name="title"
            label="Assignment Title"
            placeholder="e.g. Distributed System Consensus Project"
            control={control}
          />

          <FormSelect
            name="subjectId"
            label="Subject"
            options={subjectOptions}
            control={control}
          />

          <FormTextarea
            name="description"
            label="Description / Problem Statement (Optional)"
            placeholder="Key instructions or submission requirements..."
            control={control}
          />

          <div className="grid grid-cols-2 gap-3">
            <FormInput
              name="dueDate"
              label="Due Date"
              type="date"
              control={control}
            />

            <FormInput
              name="maxMarks"
              label="Maximum Marks"
              type="number"
              control={control}
            />
          </div>

          <FormSelect
            name="status"
            label="Current Status"
            options={[
              { value: 'PENDING', label: 'Pending' },
              { value: 'IN_PROGRESS', label: 'In Progress' },
              { value: 'SUBMITTED', label: 'Submitted' },
              { value: 'GRADED', label: 'Graded' },
            ]}
            control={control}
          />

          <div className="flex justify-end gap-2 pt-3">
            <Button type="button" variant="ghost" onClick={() => setIsCreateOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={isSubmitting}>
              Save Assignment
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Delete Assignment"
        message="Are you sure you want to remove this assignment?"
      />
    </div>
  );
}
