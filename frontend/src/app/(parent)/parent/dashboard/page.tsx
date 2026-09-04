'use client';

import React, { useState, useEffect } from 'react';
import { parentService, ChildSummary } from '../../../../services/parentService';
import { StudentDashboardAnalytics } from '../../../../services/analyticsService';
import { Card } from '../../../../components/ui/Card';
import { Button } from '../../../../components/ui/Button';
import { Badge } from '../../../../components/ui/Badge';
import { Modal } from '../../../../components/ui/Modal';
import { FormInput } from '../../../../components/ui/FormInput';
import { FormSelect } from '../../../../components/ui/FormSelect';
import { LoadingState } from '../../../../components/ui/LoadingState';
import { ErrorState } from '../../../../components/ui/ErrorState';
import { EmptyState } from '../../../../components/ui/EmptyState';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Users, Plus, Timer, Clock, GraduationCap, FileText, CheckCircle2, Shield } from 'lucide-react';
import { formatDate, getDaysRemaining } from '../../../../lib/utils';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';
import { toast } from '@/hooks/useToast';

const linkSchema = z.object({
  studentEmail: z.string().email('Valid student email required').toLowerCase(),
  relationship: z.string().min(1, 'Relationship is required'),
});

type LinkFormValues = z.infer<typeof linkSchema>;

export default function ParentDashboardPage() {
  const [children, setChildren] = useState<ChildSummary[]>([]);
  const [selectedChildId, setSelectedChildId] = useState<string>('');
  const [childData, setChildData] = useState<StudentDashboardAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [childLoading, setChildLoading] = useState(false);
  const [isLinkOpen, setIsLinkOpen] = useState(false);

  const {
    control,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = useForm<LinkFormValues>({
    resolver: zodResolver(linkSchema) as any,
    defaultValues: {
      studentEmail: '',
      relationship: 'Father',
    },
  });

  const loadChildren = async () => {
    setLoading(true);
    try {
      const kids = await parentService.getChildren();
      setChildren(kids);
      if (kids.length > 0 && !selectedChildId) {
        setSelectedChildId(kids[0].studentId);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadChildren();
  }, []);

  useEffect(() => {
    if (!selectedChildId) return;
    async function loadChildStats() {
      setChildLoading(true);
      try {
        const stats = await parentService.getChildOverview(selectedChildId);
        setChildData(stats);
      } catch (err) {
        console.error(err);
      } finally {
        setChildLoading(false);
      }
    }
    loadChildStats();
  }, [selectedChildId]);

  const onLinkSubmit = async (values: LinkFormValues) => {
    try {
      await parentService.linkStudent(values);
      setIsLinkOpen(false);
      reset();
      loadChildren();
      toast.success('Student linked successfully!');
    } catch {
      // API error is automatically shown by global toast interceptor
    }
  };

  if (loading) return <LoadingState message="Loading linked children profiles..." />;

  const selectedChild = children.find((c) => c.studentId === selectedChildId);

  return (
    <div className="space-y-6">
      {/* Header with Child Selector & Link Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 sm:p-6 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 text-white shadow-xl shadow-emerald-500/15 border border-emerald-400/30">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Parent Guardian Portal
            </h1>
            <Shield className="w-5 h-5 text-emerald-200" />
          </div>
          <p className="text-xs text-emerald-100 mt-1">
            Read-only academic supervision, attendance monitoring, and exam performance.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {children.length > 0 && (
            <select
              value={selectedChildId}
              onChange={(e) => setSelectedChildId(e.target.value)}
              className="w-full sm:w-auto px-3 py-2 text-xs font-bold rounded-xl border border-white/30 bg-white/20 text-white backdrop-blur-sm focus:outline-none"
            >
              {children.map((k) => (
                <option key={k.studentId} value={k.studentId} className="bg-slate-900 text-white">
                  Viewing: {k.firstName} {k.lastName} ({k.gradeLevel || 'Student'})
                </option>
              ))}
            </select>
          )}

          <button
            onClick={() => setIsLinkOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl bg-white text-emerald-700 hover:bg-emerald-50 shadow-md transition-all active:scale-[0.98] whitespace-nowrap"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Link Student</span>
          </button>
        </div>
      </div>

      {children.length === 0 ? (
        <EmptyState
          title="No linked student profiles found"
          description="Link your child's student account to view their academic attendance, study hours, and exam dates."
          action={
            <Button variant="primary" onClick={() => setIsLinkOpen(true)}>
              + Link Student Account
            </Button>
          }
        />
      ) : childLoading || !childData ? (
        <LoadingState message="Aggregating student academic metrics..." />
      ) : (
        <div className="space-y-6">
          {/* KPI Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <Card className="border-l-4 border-l-indigo-500">
              <span className="text-xs font-bold uppercase text-slate-400">Weekly Study</span>
              <div className="mt-2 text-2xl font-black text-slate-900 dark:text-slate-100">
                {childData.summary.weeklyStudyHours}h
              </div>
              <span className="text-[11px] text-slate-400 mt-0.5 block">
                {childData.summary.monthlyStudyHours}h this month
              </span>
            </Card>

            <Card className="border-l-4 border-l-emerald-500">
              <span className="text-xs font-bold uppercase text-slate-400">Attendance</span>
              <div className="mt-2 text-2xl font-black text-slate-900 dark:text-slate-100">
                {childData.summary.attendancePercentage}%
              </div>
              <span className="text-[11px] text-emerald-500 font-semibold block mt-0.5">
                Status: Good
              </span>
            </Card>

            <Card className="border-l-4 border-l-purple-500">
              <span className="text-xs font-bold uppercase text-slate-400">Tasks Completed</span>
              <div className="mt-2 text-2xl font-black text-slate-900 dark:text-slate-100">
                {childData.summary.completedTasksCount}
              </div>
              <span className="text-[11px] text-slate-400 mt-0.5 block">
                {childData.summary.pendingTasksCount} pending
              </span>
            </Card>

            <Card className="border-l-4 border-l-amber-500">
              <span className="text-xs font-bold uppercase text-slate-400">Upcoming Exams</span>
              <div className="mt-2 text-2xl font-black text-slate-900 dark:text-slate-100">
                {childData.summary.upcomingExamsCount}
              </div>
              <span className="text-[11px] text-slate-400 mt-0.5 block">Next 30 days</span>
            </Card>
          </div>

          {/* Syllabus Progress & 7-Day Trend */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card
              title={`${selectedChild?.firstName}'s Course Syllabus Progress`}
              subtitle="Subject completion status"
            >
              <div className="space-y-4 pt-2">
                {childData.subjectProgress.map((sub) => (
                  <div key={sub.id} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-2.5 h-2.5 rounded-full"
                          style={{ backgroundColor: sub.color }}
                        />
                        <span>{sub.name}</span>
                      </div>
                      <span>{sub.progress}%</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{ width: `${sub.progress}%`, backgroundColor: sub.color }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            <Card
              title="Daily Study Hours Trend"
              subtitle="Logged deep work hours over past 7 days"
            >
              <div className="h-60 w-full pt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={childData.dailyStudyTrend}>
                    <XAxis dataKey="day" stroke="#94A3B8" fontSize={12} tickLine={false} />
                    <YAxis stroke="#94A3B8" fontSize={12} tickLine={false} unit="h" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#0F172A',
                        borderColor: '#1E293B',
                        borderRadius: '12px',
                        color: '#F8FAFC',
                      }}
                    />
                    <Bar dataKey="hours" fill="#10B981" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </div>

          {/* Upcoming Exams & Due Assignments */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card title="Upcoming Exams & Tests" subtitle="Test dates and countdowns">
              {childData.upcomingExams.length === 0 ? (
                <p className="text-xs text-slate-400 py-6 text-center">No upcoming exams</p>
              ) : (
                <div className="space-y-3">
                  {childData.upcomingExams.map((ex) => {
                    const daysLeft = getDaysRemaining(ex.examDate);
                    return (
                      <div
                        key={ex.id}
                        className="p-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-800/30 flex items-center justify-between"
                      >
                        <div>
                          <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">
                            {ex.title}
                          </h4>
                          <span className="text-[11px] text-slate-400">
                            {formatDate(ex.examDate)}
                          </span>
                        </div>
                        <Badge variant={daysLeft <= 7 ? 'danger' : 'warning'}>
                          {daysLeft <= 0 ? 'Today' : `in ${daysLeft} days`}
                        </Badge>
                      </div>
                    );
                  })}
                </div>
              )}
            </Card>

            <Card title="Due Assignments" subtitle="Homework deliverables">
              {childData.upcomingAssignments.length === 0 ? (
                <p className="text-xs text-slate-400 py-6 text-center">No pending assignments</p>
              ) : (
                <div className="space-y-3">
                  {childData.upcomingAssignments.map((ass) => (
                    <div
                      key={ass.id}
                      className="p-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-800/30 flex items-center justify-between"
                    >
                      <div>
                        <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">
                          {ass.title}
                        </h4>
                        <span className="text-[11px] text-slate-400">
                          Due {formatDate(ass.dueDate)}
                        </span>
                      </div>
                      <Badge variant="info">{ass.status}</Badge>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>
        </div>
      )}

      {/* Modal: Link Student */}
      <Modal
        isOpen={isLinkOpen}
        onClose={() => setIsLinkOpen(false)}
        title="Link Student Account"
        description="Connect your child's student profile by entering their registered email address."
      >
        <form onSubmit={handleSubmit(onLinkSubmit)} className="space-y-4">
          <FormInput
            name="studentEmail"
            label="Student's Registered Email"
            placeholder="student@studyos.com"
            required
            control={control}
          />

          <FormSelect
            name="relationship"
            label="Relationship"
            required
            options={[
              { value: 'Father', label: 'Father' },
              { value: 'Mother', label: 'Mother' },
              { value: 'Guardian', label: 'Guardian' },
            ]}
            control={control}
          />

          <div className="flex justify-end gap-2 pt-3">
            <Button type="button" variant="ghost" onClick={() => setIsLinkOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={isSubmitting}>
              Link Student
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
