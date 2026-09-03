'use client';

import React, { useState, useEffect } from 'react';
import { taskService } from '../../../services/taskService';
import { subjectService } from '../../../services/subjectService';
import { Task, Subject } from '../../../types/academic.types';
import { PaginationMeta } from '../../../types/api.types';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { Modal } from '../../../components/ui/Modal';
import { FormInput } from '../../../components/ui/FormInput';
import { FormSelect } from '../../../components/ui/FormSelect';
import { FormTextarea } from '../../../components/ui/FormTextarea';
import { Pagination } from '../../../components/ui/Pagination';
import { ConfirmDialog } from '../../../components/ui/ConfirmDialog';
import { LoadingState } from '../../../components/ui/LoadingState';
import { EmptyState } from '../../../components/ui/EmptyState';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  CheckSquare,
  Plus,
  Search,
  Check,
  Trash2,
  Calendar,
  AlertCircle,
} from 'lucide-react';
import { formatDate } from '../../../lib/utils';

const taskFormSchema = z.object({
  title: z.string().min(1, 'Task title is required').max(200),
  description: z.string().max(2000).optional(),
  dueDate: z.string().optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).default('MEDIUM'),
  subjectId: z.string().optional(),
});

type TaskFormValues = z.infer<typeof taskFormSchema>;

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [meta, setMeta] = useState<PaginationMeta>({ page: 1, limit: 20, total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [priorityFilter, setPriorityFilter] = useState('ALL');
  const [dueFilter, setDueFilter] = useState('all');
  const [page, setPage] = useState(1);

  // Modals
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = useForm<TaskFormValues>({
    resolver: zodResolver(taskFormSchema) as any,
    defaultValues: {
      title: '',
      description: '',
      dueDate: new Date().toISOString().split('T')[0],
      priority: 'MEDIUM',
      subjectId: '',
    },
  });

  const loadTasks = async () => {
    setLoading(true);
    try {
      const params: any = {
        page: page.toString(),
        limit: '20',
        dueFilter,
      };
      if (search) params.search = search;
      if (statusFilter !== 'ALL') params.status = statusFilter;
      if (priorityFilter !== 'ALL') params.priority = priorityFilter;

      const [resTasks, resSubjects] = await Promise.all([
        taskService.getTasks(params),
        subjectService.getSubjects(),
      ]);

      setTasks(resTasks.tasks);
      setMeta(resTasks.meta);
      setSubjects(resSubjects);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTasks();
  }, [page, statusFilter, priorityFilter, dueFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    loadTasks();
  };

  const handleToggle = async (taskId: string) => {
    try {
      await taskService.toggleStatus(taskId);
      loadTasks();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async () => {
    if (!taskToDelete) return;
    try {
      await taskService.deleteTask(taskToDelete);
      setTaskToDelete(null);
      loadTasks();
    } catch (err) {
      console.error(err);
    }
  };

  const onSubmit = async (values: TaskFormValues) => {
    try {
      await taskService.createTask({
        ...values,
        subjectId: values.subjectId || undefined,
        dueDate: values.dueDate ? new Date(values.dueDate).toISOString() : undefined,
      });
      setIsCreateOpen(false);
      reset();
      loadTasks();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error creating task');
    }
  };

  const subjectOptions = [
    { value: '', label: '-- No Subject (General Task) --' },
    ...subjects.map((s) => ({ value: s.id, label: s.name })),
  ];

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
          onClick={() => setIsCreateOpen(true)}
          leftIcon={<Plus className="w-4 h-4" />}
          className="shadow-lg shadow-indigo-500/20"
        >
          Add Task
        </Button>
      </div>

      {/* Filter & Search Bar */}
      <Card className="p-4">
        <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
          <form onSubmit={handleSearchSubmit} className="w-full md:w-72 relative">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search tasks..."
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100"
            />
          </form>

          <div className="grid grid-cols-3 gap-2 w-full md:flex md:w-auto md:items-center">
            {/* Due Filter */}
            <select
              value={dueFilter}
              onChange={(e) => {
                setDueFilter(e.target.value);
                setPage(1);
              }}
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
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
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
              onChange={(e) => {
                setPriorityFilter(e.target.value);
                setPage(1);
              }}
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
            <Button size="sm" variant="primary" onClick={() => setIsCreateOpen(true)}>
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
                  onClick={() => handleToggle(task.id)}
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

                <button
                  onClick={() => setTaskToDelete(task.id)}
                  className="p-1.5 text-slate-400 hover:text-rose-500 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                  title="Delete task"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </Card>
          ))}

          <Pagination
            page={meta.page}
            totalPages={meta.totalPages}
            total={meta.total}
            onPageChange={(p) => setPage(p)}
          />
        </div>
      )}

      {/* Create Task Modal */}
      <Modal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Create New Task"
        description="Add a task with deadline, priority, and subject association."
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <FormInput
            name="title"
            label="Task Title"
            placeholder="e.g. Complete BCNF problem set 4"
            control={control}
          />

          <FormTextarea
            name="description"
            label="Description / Notes (Optional)"
            placeholder="Additional requirements or context..."
            control={control}
          />

          <div className="grid grid-cols-2 gap-3">
            <FormSelect
              name="subjectId"
              label="Subject (Optional)"
              options={subjectOptions}
              control={control}
            />

            <FormSelect
              name="priority"
              label="Priority Level"
              options={[
                { value: 'LOW', label: 'Low' },
                { value: 'MEDIUM', label: 'Medium' },
                { value: 'HIGH', label: 'High' },
                { value: 'URGENT', label: 'Urgent' },
              ]}
              control={control}
            />
          </div>

          <FormInput
            name="dueDate"
            label="Due Date"
            type="date"
            control={control}
          />

          <div className="flex justify-end gap-2 pt-3">
            <Button type="button" variant="ghost" onClick={() => setIsCreateOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={isSubmitting}>
              Create Task
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!taskToDelete}
        onClose={() => setTaskToDelete(null)}
        onConfirm={handleDelete}
        title="Delete Task"
        message="Are you sure you want to permanently delete this task?"
      />
    </div>
  );
}
