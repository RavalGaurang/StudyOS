'use client';

import React from 'react';
import { Goal } from '@/types/study.types';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { LoadingState } from '../ui/LoadingState';
import { EmptyState } from '../ui/EmptyState';
import { Target, Plus, Calendar, Trash2, Edit2, Loader2 } from 'lucide-react';
import { formatDate } from '@/lib/utils';

export interface GoalListProps {
  goals: Goal[];
  loading: boolean;
  onOpenCreate: () => void;
  onEditGoal: (goalId: string) => void;
  onDeleteGoal: (goalId: string) => void;
  fetchingGoalId?: string | null;
}

export const GoalList: React.FC<GoalListProps> = ({
  goals,
  loading,
  onOpenCreate,
  onEditGoal,
  onDeleteGoal,
  fetchingGoalId,
}) => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Target className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            <h1 className="text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
              Academic Goals & Targets
            </h1>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Track study hours, task milestones, and GPA score targets for the semester.
          </p>
        </div>

        <Button
          variant="primary"
          size="md"
          onClick={onOpenCreate}
          leftIcon={<Plus className="w-4 h-4" />}
          className="shadow-lg shadow-indigo-500/20"
        >
          Set New Goal
        </Button>
      </div>

      {loading ? (
        <LoadingState message="Loading study goals..." />
      ) : goals.length === 0 ? (
        <EmptyState
          title="No goals set"
          description="Establish target milestones to keep your academic momentum strong."
          action={
            <Button variant="primary" onClick={onOpenCreate}>
              + Set First Goal
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {goals.map((g) => {
            const percent = Math.min(100, Math.round((g.currentValue / g.targetValue) * 100));
            return (
              <Card key={g.id} className="p-5 flex flex-col justify-between space-y-4">
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <Badge variant="primary">{g.metricType.replace(/_/g, ' ')}</Badge>
                    <Badge variant={percent >= 100 ? 'success' : 'neutral'}>
                      {percent >= 100 ? 'Completed' : 'In Progress'}
                    </Badge>
                  </div>

                  <h3 className="font-bold text-base text-slate-900 dark:text-slate-100 mt-2">
                    {g.title}
                  </h3>
                  {g.description && (
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      {g.description}
                    </p>
                  )}

                  {/* Progress bar */}
                  <div className="space-y-1 mt-4">
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span className="text-slate-500">Progress</span>
                      <span className="text-indigo-500">
                        {g.currentValue} / {g.targetValue} ({percent}%)
                      </span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-indigo-500 transition-all"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-400">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" /> Target: {formatDate(g.targetDate)}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => onEditGoal(g.id)}
                      disabled={fetchingGoalId === g.id}
                      className="p-1 text-slate-400 hover:text-indigo-600 rounded transition-colors disabled:opacity-50"
                      title="Edit Goal"
                    >
                      {fetchingGoalId === g.id ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-600 dark:text-indigo-400" />
                      ) : (
                        <Edit2 className="w-3.5 h-3.5" />
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => onDeleteGoal(g.id)}
                      disabled={fetchingGoalId === g.id}
                      className="p-1 text-slate-400 hover:text-rose-500 rounded transition-colors disabled:opacity-50"
                      title="Delete Goal"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default GoalList;
