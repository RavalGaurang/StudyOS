'use client';

import React, { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { setPomodoroModalOpen, updatePomodoro, resetPomodoro } from '../../store/slices/uiSlice';
import { FormLayout } from '../ui/FormLayout';
import { Button } from '../ui/Button';
import { Play, Pause, RotateCcw, Check, Sparkles } from 'lucide-react';
import { subjectService } from '../../services/subjectService';
import { studyService } from '../../services/studyService';
import { Subject } from '../../types/academic.types';

export const PomodoroModal: React.FC = () => {
  const dispatch = useAppDispatch();
  const { pomodoroModalOpen, activePomodoro } = useAppSelector((state) => state.ui);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('');
  const [sessionNotes, setSessionNotes] = useState('');
  const [startTime, setStartTime] = useState<Date | null>(null);

  useEffect(() => {
    if (pomodoroModalOpen) {
      subjectService.getSubjects().then(setSubjects).catch(console.error);
    }
  }, [pomodoroModalOpen]);

  // Timer Tick Engine
  useEffect(() => {
    let interval: any = null;
    if (activePomodoro.isRunning && activePomodoro.timeLeft > 0) {
      interval = setInterval(() => {
        dispatch(updatePomodoro({ timeLeft: activePomodoro.timeLeft - 1 }));
      }, 1000);
    } else if (activePomodoro.isRunning && activePomodoro.timeLeft === 0) {
      // Completed session!
      handleSessionComplete();
    }
    return () => clearInterval(interval);
  }, [activePomodoro.isRunning, activePomodoro.timeLeft, dispatch]);

  const handleStart = () => {
    if (!startTime) setStartTime(new Date());
    dispatch(updatePomodoro({ isRunning: true }));
  };

  const handlePause = () => {
    dispatch(updatePomodoro({ isRunning: false }));
  };

  const handleReset = (duration: number = 25, mode: 'WORK' | 'SHORT_BREAK' | 'LONG_BREAK' = 'WORK') => {
    dispatch(resetPomodoro({ mode, durationMinutes: duration }));
    setStartTime(null);
  };

  const handleSessionComplete = async () => {
    dispatch(updatePomodoro({ isRunning: false }));
    const ended = new Date();
    const started = startTime || new Date(ended.getTime() - 25 * 60 * 1000);
    const durationMinutes = Math.max(1, Math.round((ended.getTime() - started.getTime()) / (1000 * 60)));

    try {
      await studyService.logSession({
        subjectId: selectedSubjectId || undefined,
        sessionType: activePomodoro.mode === 'WORK' ? 'POMODORO_25_5' : 'CUSTOM',
        durationMinutes,
        startedAt: started.toISOString(),
        endedAt: ended.toISOString(),
        notes: sessionNotes || 'Completed Pomodoro study session',
      });
      alert('🎉 Great work! Study session recorded successfully.');
    } catch (err) {
      console.error(err);
    }
    handleReset(5, 'SHORT_BREAK');
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <FormLayout
      isOpen={pomodoroModalOpen}
      onClose={() => dispatch(setPomodoroModalOpen(false))}
      title="Study Timer & Pomodoro Focus"
      size="md"
    >
      <div className="flex flex-col items-center text-center space-y-6">
        {/* Preset Modes */}
        <div className="flex items-center gap-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
          <button
            onClick={() => handleReset(25, 'WORK')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activePomodoro.mode === 'WORK' && activePomodoro.timeLeft <= 25 * 60
                ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-xs'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            25/5 Pomodoro
          </button>
          <button
            onClick={() => handleReset(50, 'WORK')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activePomodoro.mode === 'WORK' && activePomodoro.timeLeft > 25 * 60
                ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-xs'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            50/10 Deep Work
          </button>
          <button
            onClick={() => handleReset(5, 'SHORT_BREAK')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activePomodoro.mode === 'SHORT_BREAK'
                ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-300 shadow-xs'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            5m Break
          </button>
        </div>

        {/* Big Circular Timer Display */}
        <div className="relative flex items-center justify-center w-56 h-56 rounded-full border-4 border-indigo-100 dark:border-indigo-950 bg-gradient-to-b from-indigo-50/50 to-white dark:from-slate-800 dark:to-slate-900 shadow-inner">
          <div className="flex flex-col items-center">
            <span className="text-5xl font-black tracking-tight text-slate-900 dark:text-slate-100 tabular-nums">
              {formatTime(activePomodoro.timeLeft)}
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 mt-2">
              {activePomodoro.mode === 'WORK' ? 'Deep Focus' : 'Short Break'}
            </span>
          </div>
        </div>

        {/* Subject Selection */}
        <div className="w-full space-y-2 text-left">
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
            Link Focus Session to Subject (Optional)
          </label>
          <select
            value={selectedSubjectId}
            onChange={(e) => setSelectedSubjectId(e.target.value)}
            className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200"
          >
            <option value="">-- General Study Session --</option>
            {subjects.map((sub) => (
              <option key={sub.id} value={sub.id}>
                {sub.name} {sub.code ? `(${sub.code})` : ''}
              </option>
            ))}
          </select>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3 w-full">
          {activePomodoro.isRunning ? (
            <Button
              variant="secondary"
              size="lg"
              className="flex-1 font-bold"
              onClick={handlePause}
              leftIcon={<Pause className="w-5 h-5" />}
            >
              Pause Session
            </Button>
          ) : (
            <Button
              variant="primary"
              size="lg"
              className="flex-1 font-bold shadow-lg shadow-indigo-500/20"
              onClick={handleStart}
              leftIcon={<Play className="w-5 h-5" />}
            >
              Start Focus Session
            </Button>
          )}

          <Button
            variant="outline"
            size="lg"
            onClick={() => handleReset(25, 'WORK')}
            title="Reset timer"
          >
            <RotateCcw className="w-4 h-4" />
          </Button>

          {activePomodoro.isRunning && (
            <Button
              variant="success"
              size="lg"
              onClick={handleSessionComplete}
              title="Mark completed early"
            >
              <Check className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>
    </FormLayout>
  );
};
