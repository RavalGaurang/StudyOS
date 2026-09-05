'use client';

import React, { useState, useEffect } from 'react';
import { timetableService } from '@/services/timetableService';
import { subjectService } from '@/services/subjectService';
import { TimetableEvent, Subject } from '@/types/academic.types';
import { TimetableList } from '@/components/timetable/TimetableList';
import { TimetableForm, TimetableFormValues } from '@/components/timetable/TimetableForm';
import { TimetableDetails } from '@/components/timetable/TimetableDetails';

export default function TimetablePage() {
  const [events, setEvents] = useState<TimetableEvent[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<TimetableEvent | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [fetchingEventId, setFetchingEventId] = useState<string | null>(null);
  const [mobileActiveDay, setMobileActiveDay] = useState<number | 'all'>('all');
  const [actionLoading, setActionLoading] = useState(false);

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

  // Open Details Modal - Only opens after GET API state is completed!
  const handleOpenEventDetails = async (id: string) => {
    setFetchingEventId(id);
    try {
      const ev = await timetableService.getEventById(id);
      if (ev) {
        setSelectedEvent(ev);
        setIsDetailsOpen(true);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setFetchingEventId(null);
    }
  };

  const handleCreateSubmit = async (values: TimetableFormValues) => {
    setActionLoading(true);
    try {
      await timetableService.createEvent({
        ...values,
        subjectId: values.subjectId || undefined,
      });
      setIsCreateOpen(false);
      loadData();
    } catch {
      // Error is caught and displayed by the global toast interceptor
    } finally {
      setActionLoading(false);
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

  return (
    <>
      <TimetableList
        events={events}
        loading={loading}
        mobileActiveDay={mobileActiveDay}
        onMobileActiveDayChange={setMobileActiveDay}
        onOpenCreate={() => setIsCreateOpen(true)}
        onOpenEventDetails={handleOpenEventDetails}
        onDeleteEvent={handleDelete}
        fetchingEventId={fetchingEventId}
      />

      {/* Timetable Create Form using FormLayout */}
      <TimetableForm
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        subjects={subjects}
        onSubmit={handleCreateSubmit}
        isLoading={actionLoading}
        size="lg"
      />

      {/* Timetable Details View using FormLayout */}
      <TimetableDetails
        isOpen={isDetailsOpen}
        onClose={() => {
          setIsDetailsOpen(false);
          setSelectedEvent(null);
        }}
        event={selectedEvent}
        onDelete={handleDelete}
      />
    </>
  );
}
