'use client';

import React, { useState, useEffect } from 'react';
import { timetableService } from '../../../services/timetableService';
import { subjectService } from '../../../services/subjectService';
import { TimetableEvent, Subject } from '../../../types/academic.types';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { Modal } from '../../../components/ui/Modal';
import { FormInput } from '../../../components/ui/FormInput';
import { FormSelect } from '../../../components/ui/FormSelect';
import { LoadingState } from '../../../components/ui/LoadingState';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Calendar, Clock, MapPin, Trash2 } from 'lucide-react';
import { cn } from '../../../lib/utils';

const timetableSchema = z.object({
  title: z.string().min(1, 'Title is required').max(150),
  subjectId: z.string().optional(),
  dayOfWeek: z.coerce.number().min(0).max(6),
  startTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Format HH:mm'),
  endTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Format HH:mm'),
  room: z.string().optional(),
  location: z.string().optional(),
});

type TimetableFormValues = z.infer<typeof timetableSchema>;

export default function TimetablePage() {
  const [events, setEvents] = useState<TimetableEvent[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [mobileActiveDay, setMobileActiveDay] = useState<number | 'all'>('all');

  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  const {
    control,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = useForm<TimetableFormValues>({
    resolver: zodResolver(timetableSchema) as any,
    defaultValues: {
      title: '',
      subjectId: '',
      dayOfWeek: 1,
      startTime: '09:00',
      endTime: '10:30',
      room: 'LH-101',
      location: 'Science Block',
    },
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const [evRes, subRes] = await Promise.all([
        timetableService.getTimetable(),
        subjectService.getSubjects(),
      ]);
      setEvents(evRes);
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

  const onSubmit = async (values: TimetableFormValues) => {
    try {
      await timetableService.createEvent({
        ...values,
        subjectId: values.subjectId || undefined,
      });
      setIsCreateOpen(false);
      reset();
      loadData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error saving event');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await timetableService.deleteEvent(id);
      loadData();
    } catch (err) {
      console.error(err);
    }
  };

  const subjectOptions = [
    { value: '', label: '-- General Session / No Subject --' },
    ...subjects.map((s) => ({ value: s.id, label: s.name })),
  ];

  // Group events by day of week
  const eventsByDay: Record<number, TimetableEvent[]> = {
    1: [], // Monday
    2: [], // Tuesday
    3: [], // Wednesday
    4: [], // Thursday
    5: [], // Friday
    6: [], // Saturday
    0: [], // Sunday
  };

  for (const ev of events) {
    if (eventsByDay[ev.dayOfWeek]) {
      eventsByDay[ev.dayOfWeek].push(ev);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
            Weekly Class Timetable
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Weekly class schedule, lecture halls, and lab sessions.
          </p>
        </div>

        <Button
          variant="primary"
          size="md"
          onClick={() => setIsCreateOpen(true)}
          leftIcon={<Plus className="w-4 h-4" />}
          className="shadow-lg shadow-indigo-500/20"
        >
          Add Class / Event
        </Button>
      </div>

      {loading ? (
        <LoadingState message="Loading timetable schedule..." />
      ) : (
        <div className="space-y-4">
          {/* Mobile Day Selector Bar (< md) */}
          <div className="md:hidden flex items-center gap-1.5 overflow-x-auto pb-1">
            {[
              { idx: 'all', label: 'All Days' },
              { idx: 1, label: 'Mon' },
              { idx: 2, label: 'Tue' },
              { idx: 3, label: 'Wed' },
              { idx: 4, label: 'Thu' },
              { idx: 5, label: 'Fri' },
            ].map((d) => (
              <button
                key={String(d.idx)}
                onClick={() => setMobileActiveDay(d.idx as any)}
                className={cn(
                  'px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex-shrink-0',
                  mobileActiveDay === d.idx
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                )}
              >
                {d.label}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {[1, 2, 3, 4, 5]
              .filter((d) => mobileActiveDay === 'all' || mobileActiveDay === d)
              .map((dayIdx) => (
                <div key={dayIdx} className="space-y-3">
                  <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-center">
                    <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      {days[dayIdx]}
                    </h3>
                  </div>

                  <div className="space-y-2">
                    {eventsByDay[dayIdx].length === 0 ? (
                      <p className="text-center text-[11px] text-slate-400 py-6 italic">No classes</p>
                    ) : (
                      eventsByDay[dayIdx].map((ev) => (
                        <Card
                          key={ev.id}
                          className="p-3 border-l-4"
                          style={{ borderLeftColor: ev.subject?.color || '#6366F1' }}
                        >
                          <div className="flex items-start justify-between gap-1">
                            <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 line-clamp-2">
                              {ev.title}
                            </h4>
                            <button
                              onClick={() => handleDelete(ev.id)}
                              className="text-slate-300 hover:text-rose-500 p-0.5 transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          <div className="space-y-1 mt-2 text-[11px] text-slate-500 dark:text-slate-400">
                            <div className="flex items-center gap-1 font-semibold text-slate-700 dark:text-slate-300">
                              <Clock className="w-3 h-3 text-slate-400 flex-shrink-0" />
                              <span>
                                {ev.startTime} - {ev.endTime}
                              </span>
                            </div>

                            {ev.room && (
                              <div className="flex items-center gap-1">
                                <MapPin className="w-3 h-3 text-slate-400 flex-shrink-0" />
                                <span className="truncate">
                                  {ev.room} {ev.location ? `• ${ev.location}` : ''}
                                </span>
                              </div>
                            )}
                          </div>
                        </Card>
                      ))
                    )}
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Modal: Add Timetable Event */}
      <Modal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Add Timetable Class"
        description="Schedule a recurring weekly lecture, tutorial, or lab session."
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <FormInput
            name="title"
            label="Class / Session Title"
            placeholder="e.g. Operating Systems Lecture"
            control={control}
          />

          <FormSelect
            name="subjectId"
            label="Subject (Optional)"
            options={subjectOptions}
            control={control}
          />

          <FormSelect
            name="dayOfWeek"
            label="Day of Week"
            options={[
              { value: 1, label: 'Monday' },
              { value: 2, label: 'Tuesday' },
              { value: 3, label: 'Wednesday' },
              { value: 4, label: 'Thursday' },
              { value: 5, label: 'Friday' },
              { value: 6, label: 'Saturday' },
              { value: 0, label: 'Sunday' },
            ]}
            control={control}
          />

          <div className="grid grid-cols-2 gap-3">
            <FormInput
              name="startTime"
              label="Start Time (HH:mm)"
              placeholder="09:00"
              control={control}
            />

            <FormInput
              name="endTime"
              label="End Time (HH:mm)"
              placeholder="10:30"
              control={control}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <FormInput
              name="room"
              label="Room Number"
              placeholder="e.g. LH-101"
              control={control}
            />

            <FormInput
              name="location"
              label="Building / Campus"
              placeholder="e.g. Engineering Wing"
              control={control}
            />
          </div>

          <div className="flex justify-end gap-2 pt-3">
            <Button type="button" variant="ghost" onClick={() => setIsCreateOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={isSubmitting}>
              Save to Timetable
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
