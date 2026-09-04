'use client';

import React, { useState, useEffect } from 'react';
import { studyService } from '../../../services/studyService';
import { subjectService } from '../../../services/subjectService';
import { StudySession, StudyPlan } from '../../../types/study.types';
import { Subject } from '../../../types/academic.types';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { Modal } from '../../../components/ui/Modal';
import { Table } from '../../../components/ui/Table';
import { FormInput } from '../../../components/ui/FormInput';
import { FormSelect } from '../../../components/ui/FormSelect';
import { FormTextarea } from '../../../components/ui/FormTextarea';
import { LoadingState } from '../../../components/ui/LoadingState';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Timer,
  Play,
  Pause,
  RotateCcw,
  CheckCircle2,
  Calendar,
  Plus,
  Clock,
  BookOpen,
} from 'lucide-react';
import { formatDate } from '../../../lib/utils';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import { updatePomodoro, resetPomodoro } from '../../../store/slices/uiSlice';

const manualSessionSchema = z.object({
  subjectId: z.string().optional(),
  durationMinutes: z.coerce.number().positive(),
  sessionType: z.enum(['POMODORO_25_5', 'POMODORO_50_10', 'CUSTOM']).default('CUSTOM'),
  notes: z.string().optional(),
});

type ManualSessionValues = z.infer<typeof manualSessionSchema>;

export default function StudyPage() {
  const dispatch = useAppDispatch();
  const { activePomodoro } = useAppSelector((state) => state.ui);

  const [sessions, setSessions] = useState<StudySession[]>([]);
  const [plans, setPlans] = useState<StudyPlan[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [stats, setStats] = useState({ totalSessions: 0, totalHours: 0 });
  const [loading, setLoading] = useState(true);
  const [isManualOpen, setIsManualOpen] = useState(false);

  const {
    control,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = useForm<ManualSessionValues>({
    resolver: zodResolver(manualSessionSchema) as any,
    defaultValues: {
      subjectId: '',
      durationMinutes: 45,
      sessionType: 'CUSTOM',
      notes: '',
    },
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const [sessionRes, planRes, subRes] = await Promise.all([
        studyService.getSessions(20),
        studyService.getPlans(),
        subjectService.getSubjects(),
      ]);
      setSessions(sessionRes.sessions);
      setStats({
        totalSessions: sessionRes.totalSessions,
        totalHours: sessionRes.totalHours,
      });
      setPlans(planRes);
      setSubjects(subRes);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Timer Tick
  useEffect(() => {
    let interval: any = null;
    if (activePomodoro.isRunning && activePomodoro.timeLeft > 0) {
      interval = setInterval(() => {
        dispatch(updatePomodoro({ timeLeft: activePomodoro.timeLeft - 1 }));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [activePomodoro.isRunning, activePomodoro.timeLeft, dispatch]);

  const handleStart = () => dispatch(updatePomodoro({ isRunning: true }));
  const handlePause = () => dispatch(updatePomodoro({ isRunning: false }));
  const handleResetTimer = (mins: number, mode: 'WORK' | 'SHORT_BREAK' | 'LONG_BREAK' = 'WORK') => {
    dispatch(resetPomodoro({ mode, durationMinutes: mins }));
  };

  const onManualSubmit = async (values: ManualSessionValues) => {
    try {
      const now = new Date();
      const startedAt = new Date(now.getTime() - values.durationMinutes * 60 * 1000);
      await studyService.logSession({
        subjectId: values.subjectId || undefined,
        durationMinutes: values.durationMinutes,
        sessionType: values.sessionType,
        startedAt: startedAt.toISOString(),
        endedAt: now.toISOString(),
        notes: values.notes || 'Manually logged study session',
      });
      setIsManualOpen(false);
      reset();
      loadData();
    } catch {
      // Error is caught and displayed by the global toast interceptor
    }
  };

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const subjectOptions = [
    { value: '', label: '-- General Focus Session --' },
    ...subjects.map((s) => ({ value: s.id, label: s.name })),
  ];

  if (loading) return <LoadingState message="Loading study sessions and planner..." />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
            Study Hub & Focus Engine
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Pomodoro focus intervals, study planners, and deep work duration tracking.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="md"
            onClick={() => setIsManualOpen(true)}
            leftIcon={<Plus className="w-4 h-4" />}
          >
            Log Manual Time
          </Button>
        </div>
      </div>

      {/* Hero: Interactive Pomodoro Desk */}
      <Card className="p-5 sm:p-8 bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-950 border-indigo-500/30 text-center flex flex-col items-center">
        {/* Preset selectors */}
        <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2 p-1.5 bg-slate-800/80 border border-slate-700/80 rounded-2xl mb-6 sm:mb-8">
          <button
            onClick={() => handleResetTimer(25, 'WORK')}
            className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl text-xs font-bold transition-all ${
              activePomodoro.mode === 'WORK' && activePomodoro.timeLeft <= 25 * 60
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            25/5 Pomodoro
          </button>
          <button
            onClick={() => handleResetTimer(50, 'WORK')}
            className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl text-xs font-bold transition-all ${
              activePomodoro.mode === 'WORK' && activePomodoro.timeLeft > 25 * 60
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            50/10 Deep Work
          </button>
          <button
            onClick={() => handleResetTimer(5, 'SHORT_BREAK')}
            className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl text-xs font-bold transition-all ${
              activePomodoro.mode === 'SHORT_BREAK'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            5m Break
          </button>
        </div>

        {/* Responsive Digital Clock */}
        <div className="relative flex items-center justify-center w-52 h-52 sm:w-64 sm:h-64 rounded-full border-4 border-indigo-500/30 bg-slate-900/90 shadow-2xl mb-6 sm:mb-8">
          <div className="flex flex-col items-center">
            <span className="text-5xl sm:text-6xl font-black text-white tracking-tighter tabular-nums">
              {formatTimer(activePomodoro.timeLeft)}
            </span>
            <span className="text-[11px] sm:text-xs font-extrabold uppercase tracking-widest text-indigo-400 mt-2">
              {activePomodoro.mode === 'WORK' ? 'Deep Work Interval' : 'Rest & Recharge'}
            </span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-wrap items-center justify-center gap-3">
          {activePomodoro.isRunning ? (
            <button
              className="inline-flex items-center gap-2 px-6 sm:px-8 py-2.5 font-bold text-sm rounded-xl bg-slate-800 hover:bg-slate-700 text-white border border-slate-600 shadow-md transition-all active:scale-[0.98]"
              onClick={handlePause}
            >
              <Pause className="w-5 h-5" />
              <span>Pause Focus</span>
            </button>
          ) : (
            <button
              className="inline-flex items-center gap-2 px-6 sm:px-8 py-2.5 font-bold text-sm rounded-xl bg-gradient-to-r from-violet-600 via-indigo-600 to-blue-600 hover:from-violet-500 hover:via-indigo-500 hover:to-blue-500 text-white shadow-xl shadow-indigo-600/30 transition-all active:scale-[0.98]"
              onClick={handleStart}
            >
              <Play className="w-5 h-5 fill-white" />
              <span>Start Focus Session</span>
            </button>
          )}

          <button
            onClick={() => handleResetTimer(25, 'WORK')}
            title="Reset timer"
            className="p-2.5 rounded-xl border border-slate-700 bg-slate-800/80 hover:bg-slate-700 text-slate-200 hover:text-white transition-all active:scale-[0.98]"
          >
            <RotateCcw className="w-5 h-5" />
          </button>
        </div>
      </Card>

      {/* Study Stats & History */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1 space-y-4">
          <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">
            Study Analytics Overview
          </h3>
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 space-y-1">
            <span className="text-xs font-bold text-slate-400">Total Logged Time</span>
            <div className="text-3xl font-black text-indigo-500">{stats.totalHours} Hours</div>
            <span className="text-[11px] text-slate-500 block">Across {stats.totalSessions} study sessions</span>
          </div>

          <div className="space-y-3 pt-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Active Study Plans
            </h4>
            {plans.length === 0 ? (
              <p className="text-xs text-slate-400 italic">No structured study plans active</p>
            ) : (
              plans.map((p) => (
                <div key={p.id} className="p-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-800/30">
                  <h5 className="text-xs font-bold text-slate-900 dark:text-slate-100">{p.title}</h5>
                  <p className="text-[11px] text-slate-400 mt-0.5">Target: {p.targetHours} Hours</p>
                </div>
              ))
            )}
          </div>
        </Card>

        <Card className="lg:col-span-2" title="Recent Study Sessions Log" subtitle="History of focused pomodoro blocks">
          <Table
            columns={[
              {
                header: 'Date & Time',
                accessor: (row) => (
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span className="font-semibold">{formatDate(row.startedAt)}</span>
                  </div>
                ),
              },
              {
                header: 'Subject',
                accessor: (row) => (
                  <div className="flex items-center gap-2">
                    <div
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: row.subject?.color || '#94A3B8' }}
                    />
                    <span>{row.subject?.name || 'General Study'}</span>
                  </div>
                ),
              },
              {
                header: 'Duration',
                accessor: (row) => (
                  <Badge variant="primary">{row.durationMinutes} Mins</Badge>
                ),
              },
              {
                header: 'Session Notes',
                accessor: (row) => (
                  <span className="text-xs text-slate-400 truncate max-w-xs block">
                    {row.notes || '—'}
                  </span>
                ),
              },
            ]}
            data={sessions}
            emptyMessage="No study sessions recorded yet"
          />
        </Card>
      </div>

      {/* Modal: Log Manual Session */}
      <Modal
        isOpen={isManualOpen}
        onClose={() => setIsManualOpen(false)}
        title="Log Completed Study Session"
        description="Record study time spent offline or via physical textbooks."
      >
        <form onSubmit={handleSubmit(onManualSubmit)} className="space-y-4">
          <FormSelect
            name="subjectId"
            label="Subject"
            required
            options={subjectOptions}
            control={control}
          />

          <FormInput
            name="durationMinutes"
            label="Duration (Minutes)"
            type="number"
            required
            control={control}
          />

          <FormSelect
            name="sessionType"
            label="Session Type"
            required
            options={[
              { value: 'CUSTOM', label: 'Custom Study Session' },
              { value: 'POMODORO_25_5', label: '25m Pomodoro' },
              { value: 'POMODORO_50_10', label: '50m Deep Work' },
            ]}
            control={control}
          />

          <FormTextarea
            name="notes"
            label="What did you study?"
            placeholder="Chapters covered, problem sets practiced..."
            control={control}
          />

          <div className="flex justify-end gap-2 pt-3">
            <Button type="button" variant="ghost" onClick={() => setIsManualOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={isSubmitting}>
              Save Session Log
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
