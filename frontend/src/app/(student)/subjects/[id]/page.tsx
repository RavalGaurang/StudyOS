'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { subjectService } from '../../../../services/subjectService';
import { Subject, Unit, Topic } from '../../../../types/academic.types';
import { Card } from '../../../../components/ui/Card';
import { Button } from '../../../../components/ui/Button';
import { Badge } from '../../../../components/ui/Badge';
import { Modal } from '../../../../components/ui/Modal';
import { FormInput } from '../../../../components/ui/FormInput';
import { FormTextarea } from '../../../../components/ui/FormTextarea';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { LoadingState } from '../../../../components/ui/LoadingState';
import { ErrorState } from '../../../../components/ui/ErrorState';
import {
  ArrowLeft,
  Plus,
  Layers,
  CheckCircle2,
  Circle,
  Trash2,
  BookOpen,
  Calendar,
  FileText,
} from 'lucide-react';
import Link from 'next/link';

const unitSchema = z.object({
  title: z.string().min(1, 'Unit title is required').max(150),
  description: z.string().max(500).optional(),
});

const topicSchema = z.object({
  title: z.string().min(1, 'Topic title is required').max(200),
});

export default function SubjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const subjectId = params.id as string;

  const [subject, setSubject] = useState<Subject | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isAddUnitOpen, setIsAddUnitOpen] = useState(false);
  const [activeUnitForTopic, setActiveUnitForTopic] = useState<string | null>(null);

  const unitForm = useForm({
    resolver: zodResolver(unitSchema),
    defaultValues: { title: '', description: '' },
  });

  const topicForm = useForm({
    resolver: zodResolver(topicSchema),
    defaultValues: { title: '' },
  });

  const loadSubject = async () => {
    setLoading(true);
    try {
      const data = await subjectService.getSubjectById(subjectId);
      setSubject(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load subject details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSubject();
  }, [subjectId]);

  const handleToggleTopic = async (topicId: string, currentStatus: boolean) => {
    try {
      await subjectService.updateTopic(topicId, { isCompleted: !currentStatus });
      loadSubject();
    } catch (err) {
      console.error(err);
    }
  };

  const onAddUnit = async (values: any) => {
    try {
      await subjectService.createUnit(subjectId, values);
      setIsAddUnitOpen(false);
      unitForm.reset();
      loadSubject();
    } catch (err) {
      console.error(err);
    }
  };

  const onAddTopic = async (values: any) => {
    if (!activeUnitForTopic) return;
    try {
      await subjectService.createTopic(activeUnitForTopic, values);
      setActiveUnitForTopic(null);
      topicForm.reset();
      loadSubject();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <LoadingState message="Loading syllabus structure..." />;
  if (error || !subject) return <ErrorState message={error || 'Subject not found'} onRetry={loadSubject} />;

  return (
    <div className="space-y-6">
      {/* Back button & Subject Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <button
            onClick={() => router.push('/subjects')}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 mb-2 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Subjects
          </button>
          <div className="flex items-center gap-3">
            <div
              className="w-4 h-4 rounded-full flex-shrink-0"
              style={{ backgroundColor: subject.color }}
            />
            <h1 className="text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
              {subject.name}
            </h1>
            {subject.code && (
              <Badge variant="neutral">{subject.code}</Badge>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsAddUnitOpen(true)}
            leftIcon={<Plus className="w-4 h-4" />}
          >
            Add Unit
          </Button>
        </div>
      </div>

      {/* Progress & Quick Stats Card */}
      <Card className="bg-slate-900 text-white border-slate-800">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 divide-y md:divide-y-0 md:divide-x divide-slate-800">
          <div className="p-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Syllabus Progress
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-3xl font-black text-indigo-400">
                {subject.syllabusProgress || 0}%
              </span>
              <span className="text-xs text-slate-400">
                ({subject.completedTopics}/{subject.totalTopics} Topics)
              </span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-slate-800 mt-3 overflow-hidden">
              <div
                className="h-full rounded-full bg-indigo-500 transition-all"
                style={{ width: `${subject.syllabusProgress || 0}%` }}
              />
            </div>
          </div>

          <div className="p-2 md:pl-6">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Units Structure
            </span>
            <div className="text-2xl font-black text-white mt-1">
              {subject.units.length} Units
            </div>
            <span className="text-xs text-slate-400 mt-1 block">Course breakdown</span>
          </div>

          <div className="p-2 md:pl-6">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Target Grade
            </span>
            <div className="text-2xl font-black text-emerald-400 mt-1">
              {subject.targetGrade || 'A'}
            </div>
            <span className="text-xs text-slate-400 mt-1 block">
              {subject.creditHours || 3} Credit Hours
            </span>
          </div>

          <div className="p-2 md:pl-6 flex items-center gap-2">
            <Link href={`/quizzes?subjectId=${subject.id}`} className="w-full">
              <Button variant="secondary" size="sm" className="w-full text-xs font-bold">
                Generate Quiz on Syllabus
              </Button>
            </Link>
          </div>
        </div>
      </Card>

      {/* Units & Topics Hierarchy List */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
          Curriculum Syllabus Breakdown
        </h2>

        {subject.units.length === 0 ? (
          <Card className="text-center py-12">
            <Layers className="w-8 h-8 text-slate-400 mx-auto mb-2" />
            <p className="text-sm font-bold text-slate-700 dark:text-slate-300">No units added yet</p>
            <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1 mb-4">
              Add units and breakdown each chapter into specific topics to track completion.
            </p>
            <Button size="sm" variant="outline" onClick={() => setIsAddUnitOpen(true)}>
              + Create First Unit
            </Button>
          </Card>
        ) : (
          subject.units.map((unit, uIdx) => (
            <Card key={unit.id} className="space-y-4">
              <div className="flex items-start justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                      Unit {uIdx + 1}
                    </span>
                    <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                      {unit.title}
                    </h3>
                  </div>
                  {unit.description && (
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      {unit.description}
                    </p>
                  )}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setActiveUnitForTopic(unit.id)}
                  leftIcon={<Plus className="w-3.5 h-3.5" />}
                >
                  Add Topic
                </Button>
              </div>

              {/* Topics Checklist within Unit */}
              <div className="space-y-2">
                {unit.topics.length === 0 ? (
                  <p className="text-xs text-slate-400 py-2 italic">
                    No topics listed under this unit. Click &quot;Add Topic&quot; to build the checklist.
                  </p>
                ) : (
                  unit.topics.map((topic) => (
                    <div
                      key={topic.id}
                      onClick={() => handleToggleTopic(topic.id, topic.isCompleted)}
                      className="flex items-center justify-between p-2.5 rounded-xl border border-slate-100 dark:border-slate-800/80 bg-slate-50/40 dark:bg-slate-800/30 hover:bg-slate-100/60 dark:hover:bg-slate-800/60 transition-all cursor-pointer select-none"
                    >
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          className={`w-5 h-5 rounded-md flex items-center justify-center border transition-all ${
                            topic.isCompleted
                              ? 'bg-emerald-600 border-emerald-600 text-white'
                              : 'border-slate-300 dark:border-slate-600 hover:border-indigo-500'
                          }`}
                        >
                          {topic.isCompleted && <CheckCircle2 className="w-3.5 h-3.5" />}
                        </button>
                        <span
                          className={`text-xs font-semibold ${
                            topic.isCompleted
                              ? 'line-through text-slate-400 dark:text-slate-500'
                              : 'text-slate-800 dark:text-slate-200'
                          }`}
                        >
                          {topic.title}
                        </span>
                      </div>

                      {topic.isCompleted && (
                        <Badge variant="success">Completed</Badge>
                      )}
                    </div>
                  ))
                )}
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Modal: Add Unit */}
      <Modal
        isOpen={isAddUnitOpen}
        onClose={() => setIsAddUnitOpen(false)}
        title="Add Course Unit"
        description={`Add a new unit to ${subject.name}`}
      >
        <form onSubmit={unitForm.handleSubmit(onAddUnit)} className="space-y-4">
          <FormInput
            name="title"
            label="Unit Title"
            placeholder="e.g. Transactions & Concurrency Control"
            control={unitForm.control}
          />
          <FormTextarea
            name="description"
            label="Unit Description / Objectives (Optional)"
            placeholder="Key concepts covered in this unit..."
            control={unitForm.control}
          />
          <div className="flex justify-end gap-2 pt-3">
            <Button type="button" variant="ghost" onClick={() => setIsAddUnitOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={unitForm.formState.isSubmitting}>
              Add Unit
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal: Add Topic */}
      <Modal
        isOpen={!!activeUnitForTopic}
        onClose={() => setActiveUnitForTopic(null)}
        title="Add Topic to Unit"
        description="Add a specific syllabus topic or sub-concept."
      >
        <form onSubmit={topicForm.handleSubmit(onAddTopic)} className="space-y-4">
          <FormInput
            name="title"
            label="Topic Name"
            placeholder="e.g. Two-Phase Locking Protocol (2PL)"
            control={topicForm.control}
          />
          <div className="flex justify-end gap-2 pt-3">
            <Button type="button" variant="ghost" onClick={() => setActiveUnitForTopic(null)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={topicForm.formState.isSubmitting}>
              Add Topic
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
