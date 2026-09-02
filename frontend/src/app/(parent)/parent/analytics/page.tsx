'use client';

import React, { useState, useEffect } from 'react';
import { parentService, ChildSummary } from '../../../../services/parentService';
import { StudentDashboardAnalytics } from '../../../../services/analyticsService';
import { Card } from '../../../../components/ui/Card';
import { LoadingState } from '../../../../components/ui/LoadingState';
import { EmptyState } from '../../../../components/ui/EmptyState';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export default function ParentAnalyticsPage() {
  const [children, setChildren] = useState<ChildSummary[]>([]);
  const [selectedChildId, setSelectedChildId] = useState<string>('');
  const [childData, setChildData] = useState<StudentDashboardAnalytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    parentService.getChildren().then((kids) => {
      setChildren(kids);
      if (kids.length > 0) setSelectedChildId(kids[0].studentId);
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    if (!selectedChildId) return;
    parentService.getChildOverview(selectedChildId).then(setChildData);
  }, [selectedChildId]);

  if (loading) return <LoadingState message="Loading academic reports..." />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
            Academic Performance & Study Reports
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Detailed learning metrics and historical attendance records for your child.
          </p>
        </div>

        {children.length > 0 && (
          <select
            value={selectedChildId}
            onChange={(e) => setSelectedChildId(e.target.value)}
            className="px-3 py-2 text-xs font-bold rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100"
          >
            {children.map((k) => (
              <option key={k.studentId} value={k.studentId}>
                {k.firstName} {k.lastName}
              </option>
            ))}
          </select>
        )}
      </div>

      {childData && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card title="7-Day Focus & Study Consistency" subtitle="Hours logged per day">
              <div className="h-64 w-full pt-4">
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

            <Card title="Course Syllabus Completion" subtitle="Curriculum progression breakdown">
              <div className="space-y-4 pt-2">
                {childData.subjectProgress.map((sub) => (
                  <div key={sub.id} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <span>{sub.name}</span>
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
          </div>
        </div>
      )}
    </div>
  );
}
