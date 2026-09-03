'use client';

import React, { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import { setPomodoroModalOpen } from '../../../store/slices/uiSlice';
import { analyticsService, StudentDashboardAnalytics } from '../../../services/analyticsService';
import { taskService } from '../../../services/taskService';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { LoadingState } from '../../../components/ui/LoadingState';
import { ErrorState } from '../../../components/ui/ErrorState';
import { EmptyState } from '../../../components/ui/EmptyState';
import {
  Timer,
  CheckSquare,
  Clock,
  GraduationCap,
  Plus,
  Play,
  FileText,
  BookMarked,
  ArrowUpRight,
  TrendingUp,
  Sparkles,
  Calendar,
  Check,
} from 'lucide-react';
import Link from 'next/link';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { formatDate, getDaysRemaining } from '../../../lib/utils';

export default function DashboardPage() {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const [data, setData] = useState<StudentDashboardAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboard = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await analyticsService.getStudentDashboard();
      setData(res);
    } catch (err: any) {
      setError(err.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const handleToggleTask = async (taskId: string) => {
    try {
      await taskService.toggleStatus(taskId);
      // Refresh dashboard state
      fetchDashboard();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return <LoadingState message="Aggregating academic metrics & schedule..." />;
  }

  if (error || !data) {
    return <ErrorState message={error || 'Unable to load dashboard'} onRetry={fetchDashboard} />;
  }

  const { summary } = data;

  return (
    <div className="space-y-6">
      {/* 1. Welcome Banner & Quick Action Buttons */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 sm:p-6 rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-violet-700 text-white shadow-xl shadow-indigo-500/15 border border-indigo-400/30">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Welcome back, {user?.firstName}!
            </h1>
            <Sparkles className="w-5 h-5 text-amber-300 animate-pulse" />
          </div>
          <p className="text-xs sm:text-sm text-indigo-100 mt-1">
            You&apos;re on track with a {summary.taskCompletionRate}% task completion rate this week.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => dispatch(setPomodoroModalOpen(true))}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl bg-white text-indigo-700 hover:bg-indigo-50 shadow-md transition-all active:scale-[0.98]"
          >
            <Play className="w-3.5 h-3.5 fill-indigo-700 text-indigo-700" />
            <span>Start Focus Timer</span>
          </button>

          <Link href="/tasks">
            <button className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl bg-white/20 hover:bg-white/30 text-white border border-white/25 backdrop-blur-sm transition-all active:scale-[0.98]">
              <Plus className="w-3.5 h-3.5" />
              <span>Add Task</span>
            </button>
          </Link>

          <Link href="/notes">
            <button className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/20 backdrop-blur-sm transition-all active:scale-[0.98]">
              <BookMarked className="w-3.5 h-3.5" />
              <span>New Note</span>
            </button>
          </Link>
        </div>
      </div>

      {/* 2. Top Metric KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <Card className="p-3.5 sm:p-5 border-l-4 border-l-indigo-500">
          <div className="flex items-center justify-between">
            <span className="text-[11px] sm:text-xs font-bold uppercase text-slate-500 dark:text-slate-400">
              Study Time (Week)
            </span>
            <div className="p-1.5 sm:p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
              <Timer className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex flex-wrap items-baseline gap-1.5">
            <span className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100">
              {summary.weeklyStudyHours}h
            </span>
            <span className="text-[10px] sm:text-xs text-slate-400">({summary.monthlyStudyHours}h month)</span>
          </div>
        </Card>

        <Card className="p-3.5 sm:p-5 border-l-4 border-l-emerald-500">
          <div className="flex items-center justify-between">
            <span className="text-[11px] sm:text-xs font-bold uppercase text-slate-500 dark:text-slate-400">
              Attendance
            </span>
            <div className="p-1.5 sm:p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex flex-wrap items-baseline gap-1.5">
            <span className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100">
              {summary.attendancePercentage}%
            </span>
            <span className="text-[10px] sm:text-xs text-emerald-500 font-semibold">Healthy</span>
          </div>
        </Card>

        <Card className="p-3.5 sm:p-5 border-l-4 border-l-purple-500">
          <div className="flex items-center justify-between">
            <span className="text-[11px] sm:text-xs font-bold uppercase text-slate-500 dark:text-slate-400">
              Pending Tasks
            </span>
            <div className="p-1.5 sm:p-2 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400">
              <CheckSquare className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex flex-wrap items-baseline gap-1.5">
            <span className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100">
              {summary.pendingTasksCount}
            </span>
            <span className="text-[10px] sm:text-xs text-slate-400">({summary.completedTasksCount} done)</span>
          </div>
        </Card>

        <Card className="p-3.5 sm:p-5 border-l-4 border-l-amber-500">
          <div className="flex items-center justify-between">
            <span className="text-[11px] sm:text-xs font-bold uppercase text-slate-500 dark:text-slate-400">
              Upcoming Exams
            </span>
            <div className="p-1.5 sm:p-2 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400">
              <GraduationCap className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex flex-wrap items-baseline gap-1.5">
            <span className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100">
              {summary.upcomingExamsCount}
            </span>
            <span className="text-[10px] sm:text-xs text-slate-400">Next 30 days</span>
          </div>
        </Card>
      </div>

      {/* 3. Main Grid: Tasks & Schedule vs Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 Cols): Today's Tasks & Syllabus Progress */}
        <div className="lg:col-span-2 space-y-6">
          {/* Today's Tasks */}
          <Card
            title="Today's Priority Tasks"
            subtitle={`${data.todayTasks.length} tasks scheduled for today`}
            action={
              <Link href="/tasks">
                <Button variant="ghost" size="sm" rightIcon={<ArrowUpRight className="w-3.5 h-3.5" />}>
                  View All
                </Button>
              </Link>
            }
          >
            {data.todayTasks.length === 0 ? (
              <EmptyState
                title="No tasks scheduled today"
                description="You're all caught up! Create a new task or review your weekly goals."
                action={
                  <Link href="/tasks">
                    <Button size="sm" variant="outline">
                      + Create Task
                    </Button>
                  </Link>
                }
              />
            ) : (
              <div className="space-y-2">
                {data.todayTasks.map((t) => (
                  <div
                    key={t.id}
                    className="flex items-center justify-between p-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 hover:bg-slate-100/60 dark:hover:bg-slate-800/80 transition-all"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <button
                        onClick={() => handleToggleTask(t.id)}
                        className={`w-5 h-5 rounded-md flex items-center justify-center border transition-all ${
                          t.status === 'COMPLETED'
                            ? 'bg-emerald-600 border-emerald-600 text-white'
                            : 'border-slate-300 dark:border-slate-600 hover:border-indigo-500'
                        }`}
                      >
                        {t.status === 'COMPLETED' && <Check className="w-3.5 h-3.5" />}
                      </button>

                      <div className="min-w-0">
                        <p
                          className={`text-xs font-semibold truncate ${
                            t.status === 'COMPLETED'
                              ? 'line-through text-slate-400 dark:text-slate-500'
                              : 'text-slate-800 dark:text-slate-100'
                          }`}
                        >
                          {t.title}
                        </p>
                        {t.subject && (
                          <span
                            className="inline-block text-[10px] font-bold mt-0.5 px-1.5 py-0.2 rounded"
                            style={{
                              backgroundColor: `${t.subject.color}15`,
                              color: t.subject.color,
                            }}
                          >
                            {t.subject.name}
                          </span>
                        )}
                      </div>
                    </div>

                    <Badge
                      variant={
                        t.priority === 'URGENT'
                          ? 'danger'
                          : t.priority === 'HIGH'
                          ? 'warning'
                          : 'neutral'
                      }
                      className="flex-shrink-0"
                    >
                      {t.priority}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Subject Syllabus Progress Breakdown */}
          <Card
            title="Course Syllabus Progress"
            subtitle="Real-time completion percentage across active enrolled subjects"
            action={
              <Link href="/subjects">
                <Button variant="ghost" size="sm" rightIcon={<ArrowUpRight className="w-3.5 h-3.5" />}>
                  Manage
                </Button>
              </Link>
            }
          >
            <div className="space-y-4">
              {data.subjectProgress.map((sub) => (
                <div key={sub.id} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: sub.color }}
                      />
                      <span className="font-bold text-slate-800 dark:text-slate-200">
                        {sub.name}
                      </span>
                      {sub.code && (
                        <span className="text-[10px] text-slate-400">({sub.code})</span>
                      )}
                    </div>
                    <span className="font-extrabold text-slate-700 dark:text-slate-300">
                      {sub.progress}% ({sub.completedTopics}/{sub.totalTopics} Topics)
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${sub.progress}%`,
                        backgroundColor: sub.color,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* 7-Day Study Trend Chart */}
          <Card
            title="7-Day Focus & Study Time"
            subtitle="Daily logged hours from Pomodoro sessions"
          >
            <div className="h-64 w-full pt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.dailyStudyTrend}>
                  <XAxis dataKey="day" stroke="#94A3B8" fontSize={12} tickLine={false} />
                  <YAxis stroke="#94A3B8" fontSize={12} tickLine={false} unit="h" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0F172A',
                      borderColor: '#1E293B',
                      borderRadius: '12px',
                      color: '#F8FAFC',
                      fontSize: '12px',
                    }}
                  />
                  <Bar dataKey="hours" fill="#6366F1" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>

        {/* Right Column (1 Col): Upcoming Exams & Subject Time Distribution */}
        <div className="space-y-6">
          {/* Upcoming Exams Countdown */}
          <Card
            title="Upcoming Exams"
            subtitle="Important test dates & weightage"
            action={
              <Link href="/exams">
                <Button variant="ghost" size="sm">
                  View All
                </Button>
              </Link>
            }
          >
            {data.upcomingExams.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-6">No upcoming exams scheduled</p>
            ) : (
              <div className="space-y-3">
                {data.upcomingExams.map((exam) => {
                  const daysLeft = getDaysRemaining(exam.examDate);
                  return (
                    <div
                      key={exam.id}
                      className="p-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-800/30"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <h5 className="text-xs font-bold text-slate-900 dark:text-slate-100">
                          {exam.title}
                        </h5>
                        <Badge variant={daysLeft <= 7 ? 'danger' : 'warning'}>
                          {daysLeft <= 0 ? 'Today' : `in ${daysLeft} days`}
                        </Badge>
                      </div>

                      <div className="flex items-center justify-between mt-2 text-[11px] text-slate-500 dark:text-slate-400">
                        <span>{formatDate(exam.examDate)}</span>
                        {exam.weightagePercent && (
                          <span className="font-semibold text-indigo-500">
                            {exam.weightagePercent}% Weight
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>

          {/* Pending Assignments */}
          <Card
            title="Pending Assignments"
            subtitle="Due deliverables"
            action={
              <Link href="/assignments">
                <Button variant="ghost" size="sm">
                  View All
                </Button>
              </Link>
            }
          >
            {data.upcomingAssignments.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-6">No pending assignments</p>
            ) : (
              <div className="space-y-3">
                {data.upcomingAssignments.map((ass) => (
                  <div
                    key={ass.id}
                    className="p-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-800/30"
                  >
                    <h5 className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                      {ass.title}
                    </h5>
                    <div className="flex items-center justify-between mt-2 text-[11px] text-slate-500 dark:text-slate-400">
                      <span>Due {formatDate(ass.dueDate)}</span>
                      <Badge variant="info">{ass.status}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Active Goals */}
          <Card
            title="Active Academic Goals"
            action={
              <Link href="/goals">
                <Button variant="ghost" size="sm">
                  Goals
                </Button>
              </Link>
            }
          >
            <div className="space-y-3">
              {data.goals.map((g) => {
                const percent = Math.min(100, Math.round((g.currentValue / g.targetValue) * 100));
                return (
                  <div key={g.id} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold truncate text-slate-800 dark:text-slate-200">
                        {g.title}
                      </span>
                      <span className="font-bold text-indigo-500">{percent}%</span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-indigo-500"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
