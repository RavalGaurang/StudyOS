'use client';

import React, { useState, useEffect } from 'react';
import { taskService } from '@/services/taskService';
import { subjectService } from '@/services/subjectService';
import { Task, Subject } from '@/types/academic.types';
import { PaginationMeta } from '@/types/api.types';
import { TaskList } from '@/components/tasks/TaskList';
import { TaskForm, TaskFormValues } from '@/components/tasks/TaskForm';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';

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

  // Form & Action states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [fetchingTaskId, setFetchingTaskId] = useState<string | null>(null);
  const [taskToDelete, setTaskToDelete] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

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

  // Open Create Form
  const handleOpenCreate = () => {
    setEditingTask(null);
    setIsFormOpen(true);
  };

  // Open Edit Task Form - only opens after GET API state is completed!
  const handleOpenEditTask = async (id: string) => {
    setFetchingTaskId(id);
    try {
      const freshTask = await taskService.getTaskById(id);
      if (freshTask) {
        setEditingTask(freshTask);
        // Open FormLayout only after GET API state is complete!
        setIsFormOpen(true);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setFetchingTaskId(null);
    }
  };

  const handleFormSubmit = async (values: TaskFormValues) => {
    setActionLoading(true);
    try {
      if (editingTask) {
        await taskService.updateTask(editingTask.id, {
          ...values,
          dueDate: values.dueDate ? new Date(values.dueDate).toISOString() : null,
          subjectId: values.subjectId || undefined,
        });
      } else {
        await taskService.createTask({
          ...values,
          subjectId: values.subjectId || undefined,
          dueDate: values.dueDate ? new Date(values.dueDate).toISOString() : undefined,
        });
      }
      setIsFormOpen(false);
      setEditingTask(null);
      loadTasks();
    } catch {
      // Error handled by interceptor
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <>
      <TaskList
        tasks={tasks}
        meta={meta}
        loading={loading}
        search={search}
        onSearchChange={setSearch}
        onSearchSubmit={handleSearchSubmit}
        statusFilter={statusFilter}
        onStatusFilterChange={(s) => {
          setStatusFilter(s);
          setPage(1);
        }}
        priorityFilter={priorityFilter}
        onPriorityFilterChange={(p) => {
          setPriorityFilter(p);
          setPage(1);
        }}
        dueFilter={dueFilter}
        onDueFilterChange={(d) => {
          setDueFilter(d);
          setPage(1);
        }}
        onPageChange={(p) => setPage(p)}
        onToggleTask={handleToggle}
        onEditTask={handleOpenEditTask}
        onDeleteTask={(id) => setTaskToDelete(id)}
        fetchingTaskId={fetchingTaskId}
        onOpenCreate={handleOpenCreate}
      />

      {/* Task Form using Reusable FormLayout */}
      <TaskForm
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingTask(null);
        }}
        task={editingTask}
        subjects={subjects}
        onSubmit={handleFormSubmit}
        isLoading={actionLoading}
        size="md"
      />

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!taskToDelete}
        onClose={() => setTaskToDelete(null)}
        onConfirm={handleDelete}
        title="Delete Task"
        message="Are you sure you want to permanently delete this task?"
      />
    </>
  );
}
