'use client';

import React from 'react';
import { TimetableEvent } from '@/types/academic.types';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { LoadingState } from '../ui/LoadingState';
import { Plus, Clock, MapPin, Trash2, Loader2, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface TimetableListProps {
  events: TimetableEvent[];
  loading: boolean;
  mobileActiveDay: number | 'all';
  onMobileActiveDayChange: (day: number | 'all') => void;
  onOpenCreate: () => void;
  onOpenEventDetails: (id: string) => void;
  onDeleteEvent: (id: string) => void;
  fetchingEventId?: string | null;
}

export const TimetableList: React.FC<TimetableListProps> = ({
  events,
  loading,
  mobileActiveDay,
  onMobileActiveDayChange,
  onOpenCreate,
  onOpenEventDetails,
  onDeleteEvent,
  fetchingEventId,
}) => {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

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
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Calendar className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            <h1 className="text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
              Weekly Class Timetable
            </h1>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Weekly class schedule, lecture halls, and lab sessions.
          </p>
        </div>

        <Button
          variant="primary"
          size="md"
          onClick={onOpenCreate}
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
                onClick={() => onMobileActiveDayChange(d.idx as any)}
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
                      eventsByDay[dayIdx].map((ev) => {
                        const isFetchingThis = fetchingEventId === ev.id;
                        return (
                          <Card
                            key={ev.id}
                            onClick={() => !isFetchingThis && onOpenEventDetails(ev.id)}
                            className={cn(
                              'p-3 border-l-4 cursor-pointer hover:shadow-md transition-shadow relative',
                              isFetchingThis && 'opacity-75 pointer-events-none'
                            )}
                            style={{ borderLeftColor: ev.subject?.color || '#6366F1' }}
                          >
                            <div className="flex items-start justify-between gap-1">
                              <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 line-clamp-2">
                                {ev.title}
                              </h4>
                              <div className="flex items-center gap-1">
                                {isFetchingThis ? (
                                  <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-600 dark:text-indigo-400" />
                                ) : (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      onDeleteEvent(ev.id);
                                    }}
                                    className="text-slate-300 hover:text-rose-500 p-0.5 transition-colors"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                )}
                              </div>
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
                        );
                      })
                    )}
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default TimetableList;
