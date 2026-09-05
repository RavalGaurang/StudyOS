'use client';

import React from 'react';
import { Task, Subject } from '@/types/academic.types';
import { PaginationMeta } from '@/types/api.types';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Pagination } from '../ui/Pagination';
import { LoadingState } from '../ui/LoadingState';
import { EmptyState } from '../ui/EmptyState';
import { formatDate } from '@/lib/utils';
import {
  CheckSquare,
  Plus,
  Search,
  Check,
  Trash2,
  Calendar,
  Edit2,
  Loader2,
} from 'lucide-react';

export interface TaskListProps {
  tasks: Task[];
  meta: PaginationMeta;
  loading: boolean;
  search: string;
  onSearchChange: (search: string) => void;
  onSearchSubmit: (e: React.FormEvent) => void;
  statusFilter: string;
  onStatusFilterChange: (status: string) => void;
  priorityFilter: string;
  onPriorityFilterChange: (priority: string) => void;
  dueFilter: string;
  onDueFilterChange: (due: string) => void;
  onPageChange: (page: number) => void;
  onToggleTask: (taskId: string) => void;
  onEditTask: (taskId: string) => void;
  onDeleteTask: (taskId: string) => void;
  fetchingTaskId?: string | null;
  onOpenCreate: () => void;
}

export const TaskList: React.FC<TaskListProps> = ({
  tasks,
  meta,
  loading,
  search,
  onSearchChange,
  onSearchSubmit,
  statusFilter,
  onStatusFilterChange,
  priorityFilter,
  onPriorityFilterChange,
  dueFilter,
  onDueFilterChange,
  onPageChange,
  onToggleTask,
  onEditTask,
  onDeleteTask,
  fetchingTaskId,
  onOpenCreate,
}) => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
            Productivity & Tasks
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Organize homework, problem sets, exam prep, and daily study items.
          </p>
        </div>

        <Button
          variant="primary"
          size="md"
          onClick={onOpenCreate}
          leftIcon={<Plus className="w-4 h-4" />}
          className="shadow-lg shadow-indigo-500/20"
        >
          Create Task
        </Button>
      </div>

      {/* Filter / Search Bar */}
      <Card className="p-3">
        <div className="flex flex-col md:flex-row items-center justify-between gap-3">
          <form onSubmit={onSearchSubmit} className="w-full md:w-72 relative">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search tasks..."
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100"
            />
          </form>

          <div className="grid grid-cols-3 gap-2 w-full md:flex md:w-auto md:items-center">
            {/* Due Filter */}
            <select
              value={dueFilter}
              onChange={(e) => onDueFilterChange(e.target.value)}
              className="w-full px-2.5 py-1.5 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200"
            >
              <option value="all">All Due</option>
              <option value="today">Today</option>
              <option value="upcoming">Upcoming</option>
              <option value="overdue">Overdue</option>
            </select>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => onStatusFilterChange(e.target.value)}
              className="w-full px-2.5 py-1.5 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200"
            >
              <option value="ALL">All Status</option>
              <option value="TODO">To-Do</option>
              <option value="IN_PROGRESS">Progress</option>
              <option value="COMPLETED">Completed</option>
            </select>

            {/* Priority Filter */}
            <select
              value={priorityFilter}
              onChange={(e) => onPriorityFilterChange(e.target.value)}
              className="w-full px-2.5 py-1.5 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200"
            >
              <option value="ALL">All Priority</option>
              <option value="URGENT">Urgent</option>
              <option value="HIGH">High</option>
              <option value="MEDIUM">Medium</option>
              <option value="LOW">Low</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Tasks List */}
      {loading ? (
        <LoadingState message="Fetching tasks..." />
      ) : tasks.length === 0 ? (
        <EmptyState
          title="No tasks match your filters"
          description="Create a task or clear your search criteria to view more items."
          action={
            <Button size="sm" variant="primary" onClick={onOpenCreate}>
              + Create Task
            </Button>
          }
        />
      ) : (
        <div className="space-y-2.5">
          {tasks.map((task) => (
            <Card
              key={task.id}
              className={`p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 transition-all ${
                task.status === 'COMPLETED' ? 'opacity-60 bg-slate-50/50 dark:bg-slate-900/30' : ''
              }`}
            >
              <div className="flex items-start sm:items-center gap-3 min-w-0 flex-1">
                <button
                  type="button"
                  onClick={() => onToggleTask(task.id)}
                  className={`w-5 h-5 mt-0.5 sm:mt-0 flex-shrink-0 rounded-md flex items-center justify-center border transition-all ${
                    task.status === 'COMPLETED'
                      ? 'bg-emerald-600 border-emerald-600 text-white'
                      : 'border-slate-300 dark:border-slate-600 hover:border-indigo-500'
                  }`}
                >
                  {task.status === 'COMPLETED' && <Check className="w-3.5 h-3.5" />}
                </button>

                <div className="min-w-0 flex-1">
                  <h4
                    className={`text-sm font-bold truncate ${
                      task.status === 'COMPLETED'
                        ? 'line-through text-slate-400 dark:text-slate-500'
                        : 'text-slate-900 dark:text-slate-100'
                    }`}
                  >
                    {task.title}
                  </h4>
                  {task.description && (
                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">
                      {task.description}
                    </p>
                  )}
                  <div className="flex flex-wrap items-center gap-2 mt-1 text-[11px] text-slate-400">
                    {task.subject && (
                      <span
                        className="font-bold px-1.5 py-0.2 rounded flex-shrink-0"
                        style={{
                          backgroundColor: `${task.subject.color}15`,
                          color: task.subject.color,
                        }}
                      >
                        {task.subject.name}
                      </span>
                    )}
                    {task.dueDate && (
                      <span className="flex items-center gap-1 flex-shrink-0">
                        <Calendar className="w-3 h-3" />
                        Due {formatDate(task.dueDate)}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-2.5 sm:gap-3 w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-slate-800/80">
                <Badge
                  variant={
                    task.priority === 'URGENT'
                      ? 'danger'
                      : task.priority === 'HIGH'
                      ? 'warning'
                      : 'neutral'
                  }
                  className="flex-shrink-0"
                >
                  {task.priority}
                </Badge>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => onEditTask(task.id)}
                    disabled={fetchingTaskId === task.id}
                    className="p-1.5 text-slate-400 hover:text-indigo-600 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-950/40 transition-colors disabled:opacity-50"
                    title="Edit task"
                  >
                    {fetchingTaskId === task.id ? (
                      <Loader2 className="w-4 h-4 animate-spin text-indigo-600 dark:text-indigo-400" />
                    ) : (
                      <Edit2 className="w-4 h-4" />
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => onDeleteTask(task.id)}
                    disabled={fetchingTaskId === task.id}
                    className="p-1.5 text-slate-400 hover:text-rose-500 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors disabled:opacity-50"
                    title="Delete task"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </Card>
          ))}

          <Pagination
            page={meta.page}
            totalPages={meta.totalPages}
            total={meta.total}
            onPageChange={onPageChange}
          />
        </div>
      )}
    </div>
  );
};

export default TaskList;
