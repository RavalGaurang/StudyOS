'use client';

import React from 'react';
import { TimetableEvent } from '@/types/academic.types';
import { FormLayout } from '../ui/FormLayout';
import { Button } from '../ui/Button';
import { Clock, MapPin, Calendar, Trash2 } from 'lucide-react';

export interface TimetableDetailsProps {
  isOpen: boolean;
  onClose: () => void;
  event: TimetableEvent | null;
  onDelete: (id: string) => void;
}

export const TimetableDetails: React.FC<TimetableDetailsProps> = ({
  isOpen,
  onClose,
  event,
  onDelete,
}) => {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  if (!event) return null;

  return (
    <FormLayout
      isOpen={isOpen}
      onClose={onClose}
      title={event.title}
      description="Detailed timetable scheduling and room information."
      icon={<Calendar className="w-5 h-5" />}
      size="md"
      footer={
        <div className="flex items-center justify-between w-full">
          <Button
            type="button"
            variant="danger"
            size="sm"
            onClick={() => {
              onDelete(event.id);
              onClose();
            }}
          >
            Delete Class
          </Button>
          <Button
            type="button"
            variant="primary"
            size="sm"
            onClick={onClose}
          >
            Close
          </Button>
        </div>
      }
    >
      <div className="space-y-4">
        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 space-y-2.5">
          <div className="flex justify-between items-center text-xs sm:text-sm">
            <span className="text-slate-500 dark:text-slate-400 font-medium">Subject:</span>
            <span className="font-bold text-slate-900 dark:text-slate-100">
              {event.subject?.name || 'General Session'}
            </span>
          </div>

          <div className="flex justify-between items-center text-xs sm:text-sm">
            <span className="text-slate-500 dark:text-slate-400 font-medium">Day:</span>
            <span className="font-bold text-slate-900 dark:text-slate-100">
              {days[event.dayOfWeek]}
            </span>
          </div>

          <div className="flex justify-between items-center text-xs sm:text-sm">
            <span className="text-slate-500 dark:text-slate-400 font-medium">Time:</span>
            <span className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              {event.startTime} - {event.endTime}
            </span>
          </div>

          {event.room && (
            <div className="flex justify-between items-center text-xs sm:text-sm">
              <span className="text-slate-500 dark:text-slate-400 font-medium">Room:</span>
              <span className="font-bold text-slate-900 dark:text-slate-100">
                {event.room}
              </span>
            </div>
          )}

          {event.location && (
            <div className="flex justify-between items-center text-xs sm:text-sm">
              <span className="text-slate-500 dark:text-slate-400 font-medium">Location:</span>
              <span className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                {event.location}
              </span>
            </div>
          )}
        </div>
      </div>
    </FormLayout>
  );
};

export default TimetableDetails;
