'use client';

import React, { useState, useEffect } from 'react';
import { analyticsService, StudentDashboardAnalytics } from '../../../services/analyticsService';
import { Card } from '../../../components/ui/Card';
import { LoadingState } from '../../../components/ui/LoadingState';
import { ErrorState } from '../../../components/ui/ErrorState';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import { Timer, CheckCircle2, Clock, Award, TrendingUp } from 'lucide-react';

export default function AnalyticsPage() {
  const [data, setData] = useState<StudentDashboardAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      const res = await analyticsService.getStudentDashboard();
      setData(res);
    } catch (err: any) {
      setError(err.message || 'Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAnalytics();
  }, []);

  if (loading) return <LoadingState message="Aggregating academic analytics & study metrics..." />;
  if (error || !data) return <ErrorState message={error || 'Failed to load analytics'} onRetry={loadAnalytics} />;

  const { summary } = data;

  const COLORS = ['#6366F1', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899', '#3B82F6'];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
          Academic Analytics & Performance
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Visual metrics for study consistency, subject distribution, task velocity, and attendance.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-indigo-500">
          <span className="text-xs font-bold text-slate-400 uppercase">Weekly Study</span>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-3xl font-black text-slate-900 dark:text-slate-100">
              {summary.weeklyStudyHours}h
            </span>
            <span className="text-xs text-slate-400">logged</span>
          </div>
        </Card>

        <Card className="border-l-4 border-l-purple-500">
          <span className="text-xs font-bold text-slate-400 uppercase">Monthly Study</span>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-3xl font-black text-slate-900 dark:text-slate-100">
              {summary.monthlyStudyHours}h
            </span>
            <span className="text-xs text-slate-400">total</span>
          </div>
        </Card>

        <Card className="border-l-4 border-l-emerald-500">
          <span className="text-xs font-bold text-slate-400 uppercase">Task Velocity</span>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-3xl font-black text-slate-900 dark:text-slate-100">
              {summary.taskCompletionRate}%
            </span>
            <span className="text-xs text-emerald-500 font-semibold">Completion</span>
          </div>
        </Card>

        <Card className="border-l-4 border-l-amber-500">
          <span className="text-xs font-bold text-slate-400 uppercase">Attendance Score</span>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-3xl font-black text-slate-900 dark:text-slate-100">
              {summary.attendancePercentage}%
            </span>
            <span className="text-xs text-amber-500 font-semibold">Average</span>
          </div>
        </Card>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Study Trend Bar Chart */}
        <Card title="7-Day Daily Study Trend (Hours)" subtitle="Time logged via Pomodoro focus blocks">
          <div className="h-72 w-full pt-4">
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
                <Bar dataKey="hours" fill="#6366F1" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Subject Study Hours Distribution */}
        <Card title="Subject Study Distribution (30 Days)" subtitle="Proportion of focus time per course">
          <div className="h-72 w-full pt-4">
            {data.subjectStudyDistribution.length === 0 ? (
              <p className="text-center text-xs text-slate-400 py-20">No session logs in the past 30 days</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data.subjectStudyDistribution}
                    dataKey="hours"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label={(entry: any) => `${entry.name} (${entry.hours ?? entry.value}h)`}
                  >
                    {data.subjectStudyDistribution.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.color || COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0F172A',
                      borderColor: '#1E293B',
                      borderRadius: '12px',
                      color: '#F8FAFC',
                      fontSize: '12px',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </Card>
      </div>

      {/* Detailed Syllabus Mastery Breakdown */}
      <Card title="Course Syllabus Completion" subtitle="Progress status across enrolled courses">
        <div className="space-y-4">
          {data.subjectProgress.map((sub) => (
            <div key={sub.id} className="space-y-1.5">
              <div className="flex items-center justify-between text-xs font-semibold">
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: sub.color }}
                  />
                  <span>{sub.name}</span>
                  {sub.code && <span className="text-slate-400">({sub.code})</span>}
                </div>
                <span>
                  {sub.progress}% ({sub.completedTopics} of {sub.totalTopics} Topics Completed)
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all"
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
    </div>
  );
}
