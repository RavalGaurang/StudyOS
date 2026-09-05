'use client';

import React, { useState, useEffect } from 'react';
import { subjectService } from '../../../services/subjectService';
import { Subject } from '../../../types/academic.types';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { FormLayout } from '../../../components/ui/FormLayout';
import { FormInput } from '../../../components/ui/FormInput';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { LoadingState } from '../../../components/ui/LoadingState';
import { ErrorState } from '../../../components/ui/ErrorState';
import { EmptyState } from '../../../components/ui/EmptyState';
import { BookOpen, Plus, ArrowRight, Layers, CheckCircle2, Bookmark } from 'lucide-react';
import Link from 'next/link';

const subjectSchema = z.object({
  name: z.string().min(1, 'Subject name is required').max(100),
  code: z.string().max(20).optional(),
  color: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/).default('#3B82F6'),
  targetGrade: z.string().max(10).optional(),
  creditHours: z.coerce.number().min(1).max(20).default(3),
});

type SubjectFormValues = z.infer<typeof subjectSchema>;

export default function SubjectsPage() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const {
    control,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = useForm<SubjectFormValues>({
    resolver: zodResolver(subjectSchema) as any,
    defaultValues: {
      name: '',
      code: '',
      color: '#3B82F6',
      targetGrade: 'A',
      creditHours: 3,
    },
  });

  const loadSubjects = async () => {
    setLoading(true);
    try {
      const data = await subjectService.getSubjects();
      setSubjects(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load subjects');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSubjects();
  }, []);

  const onSubmit = async (values: SubjectFormValues) => {
    try {
      await subjectService.createSubject(values);
      setIsCreateOpen(false);
      reset();
      loadSubjects();
    } catch {
      // Error is caught and displayed by the global toast interceptor
    }
  };

  if (loading) return <LoadingState message="Loading subjects & syllabus trees..." />;
  if (error) return <ErrorState message={error} onRetry={loadSubjects} />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
            Enrolled Subjects
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Manage course syllabi, unit breakdowns, and track topic completion.
          </p>
        </div>

        <Button
          variant="primary"
          size="md"
          onClick={() => setIsCreateOpen(true)}
          leftIcon={<Plus className="w-4 h-4" />}
          className="shadow-lg shadow-indigo-500/20"
        >
          Add Subject
        </Button>
      </div>

      {subjects.length === 0 ? (
        <EmptyState
          title="No subjects enrolled yet"
          description="Create your first academic course to start tracking units, topics, and study progress."
          action={
            <Button onClick={() => setIsCreateOpen(true)} variant="primary">
              + Add First Subject
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {subjects.map((sub) => (
            <Card
              key={sub.id}
              hoverable
              className="flex flex-col justify-between border-t-4"
              style={{ borderTopColor: sub.color }}
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full flex-shrink-0"
                      style={{ backgroundColor: sub.color }}
                    />
                    <h3 className="font-bold text-base text-slate-900 dark:text-slate-100 line-clamp-1">
                      {sub.name}
                    </h3>
                  </div>
                  {sub.targetGrade && (
                    <Badge variant="primary">Target: {sub.targetGrade}</Badge>
                  )}
                </div>

                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-4">
                  {sub.code ? `${sub.code} • ` : ''}
                  {sub.creditHours || 3} Credit Hours
                </p>

                {/* Syllabus Progress Indicator */}
                <div className="space-y-1.5 mb-6">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500 dark:text-slate-400">Syllabus Progress</span>
                    <span className="font-extrabold text-slate-800 dark:text-slate-200">
                      {sub.syllabusProgress || 0}%
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${sub.syllabusProgress || 0}%`,
                        backgroundColor: sub.color,
                      }}
                    />
                  </div>
                </div>

                {/* Units & Topics count */}
                <div className="flex items-center gap-4 text-xs text-slate-600 dark:text-slate-400 py-3 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-slate-400" />
                    <span>{sub.totalUnits || 0} Units</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-slate-400" />
                    <span>
                      {sub.completedTopics || 0}/{sub.totalTopics || 0} Topics Done
                    </span>
                  </div>
                </div>
              </div>

              <Link href={`/subjects/${sub.id}`} className="mt-2">
                <Button variant="outline" size="sm" className="w-full font-semibold" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
                  View Syllabus & Units
                </Button>
              </Link>
            </Card>
          ))}
        </div>
      )}

      {/* Create Subject Modal */}
      <FormLayout
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Add New Subject"
        description="Enter course details to add to your semester curriculum."
        size="md"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <FormInput
            name="name"
            label="Subject Name"
            required
            placeholder="e.g. Distributed Operating Systems"
            control={control}
          />

          <div className="grid grid-cols-2 gap-3">
            <FormInput
              name="code"
              label="Course Code"
              placeholder="e.g. CS401"
              control={control}
            />
            <FormInput
              name="targetGrade"
              label="Target Grade"
              placeholder="e.g. A+ or 90%"
              control={control}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <FormInput
              name="creditHours"
              label="Credit Hours"
              type="number"
              control={control}
            />
            <FormInput
              name="color"
              label="Theme Color (Hex)"
              placeholder="#3B82F6"
              control={control}
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-4">
            <Button type="button" variant="ghost" onClick={() => setIsCreateOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={isSubmitting}>
              Create Subject
            </Button>
          </div>
        </form>
      </FormLayout>
    </div>
  );
}
