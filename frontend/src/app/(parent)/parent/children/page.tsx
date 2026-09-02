'use client';

import React, { useState, useEffect } from 'react';
import { parentService, ChildSummary } from '../../../../services/parentService';
import { Card } from '../../../../components/ui/Card';
import { Button } from '../../../../components/ui/Button';
import { Badge } from '../../../../components/ui/Badge';
import { Avatar } from '../../../../components/ui/Avatar';
import { LoadingState } from '../../../../components/ui/LoadingState';
import { EmptyState } from '../../../../components/ui/EmptyState';
import { Users, BookOpen, CheckSquare, Timer, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function ParentChildrenPage() {
  const [children, setChildren] = useState<ChildSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    parentService.getChildren().then(setChildren).finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingState message="Loading linked student profiles..." />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
          Linked Student Profiles
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Students authorized under your guardian account.
        </p>
      </div>

      {children.length === 0 ? (
        <EmptyState
          title="No linked student accounts"
          description="Go to the parent dashboard to connect your child's student account."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {children.map((child) => (
            <Card key={child.studentId} className="p-6 space-y-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <Avatar name={`${child.firstName} ${child.lastName}`} size="lg" />
                  <div>
                    <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">
                      {child.firstName} {child.lastName}
                    </h3>
                    <p className="text-xs text-slate-400">{child.email}</p>
                    <Badge variant="primary" className="mt-1">
                      Relationship: {child.relationship}
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300 space-y-1">
                <p>
                  <span className="font-semibold text-slate-400">School/University: </span>
                  {child.schoolName || 'Institute of Advanced Technology'}
                </p>
                <p>
                  <span className="font-semibold text-slate-400">Grade Level: </span>
                  {child.gradeLevel || 'Undergraduate'}
                </p>
              </div>

              <div className="grid grid-cols-3 gap-2 pt-2 text-center text-xs">
                <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/30">
                  <div className="font-black text-slate-900 dark:text-slate-100">
                    {child.subjectsCount}
                  </div>
                  <span className="text-[10px] text-slate-400">Subjects</span>
                </div>

                <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/30">
                  <div className="font-black text-emerald-500">{child.completedTasksCount}</div>
                  <span className="text-[10px] text-slate-400">Tasks Done</span>
                </div>

                <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/30">
                  <div className="font-black text-indigo-500">{child.totalStudySessions}</div>
                  <span className="text-[10px] text-slate-400">Study Sessions</span>
                </div>
              </div>

              <Link href="/parent/dashboard" className="block pt-2">
                <Button variant="outline" size="sm" className="w-full font-bold" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
                  View Academic Progress Overview
                </Button>
              </Link>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
