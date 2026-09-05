'use client';

import React, { useState, useEffect } from 'react';
import { studyService } from '@/services/studyService';
import { Goal } from '@/types/study.types';
import { GoalList } from '@/components/goals/GoalList';
import { GoalForm, GoalFormValues } from '@/components/goals/GoalForm';

export default function GoalsPage() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);

  // Form states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [fetchingGoalId, setFetchingGoalId] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const loadGoals = async () => {
    setLoading(true);
    try {
      const data = await studyService.getGoals();
      setGoals(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadGoals();
  }, []);

  // Open Create Form
  const handleOpenCreate = () => {
    setEditingGoal(null);
    setIsFormOpen(true);
  };

  // Open Edit Goal Form - only opens after GET API state is completed!
  const handleOpenEditGoal = async (id: string) => {
    setFetchingGoalId(id);
    try {
      const freshGoal = await studyService.getGoalById(id);
      if (freshGoal) {
        setEditingGoal(freshGoal);
        // Open FormLayout only after GET API state is complete!
        setIsFormOpen(true);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setFetchingGoalId(null);
    }
  };

  const handleFormSubmit = async (values: GoalFormValues) => {
    setActionLoading(true);
    try {
      if (editingGoal) {
        await studyService.updateGoal(editingGoal.id, {
          ...values,
          targetDate: new Date(values.targetDate).toISOString(),
        });
      } else {
        await studyService.createGoal({
          ...values,
          targetDate: new Date(values.targetDate).toISOString(),
        });
      }
      setIsFormOpen(false);
      setEditingGoal(null);
      loadGoals();
    } catch {
      // Error handled by interceptor
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await studyService.deleteGoal(id);
      loadGoals();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <>
      <GoalList
        goals={goals}
        loading={loading}
        onOpenCreate={handleOpenCreate}
        onEditGoal={handleOpenEditGoal}
        onDeleteGoal={handleDelete}
        fetchingGoalId={fetchingGoalId}
      />

      {/* Goal Form using Reusable FormLayout */}
      <GoalForm
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingGoal(null);
        }}
        goal={editingGoal}
        onSubmit={handleFormSubmit}
        isLoading={actionLoading}
        size="md"
      />
    </>
  );
}
