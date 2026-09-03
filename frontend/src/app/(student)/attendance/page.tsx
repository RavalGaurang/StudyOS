'use client';

import React, { useState, useEffect } from 'react';
import { attendanceService, AttendanceAnalyticsResponse } from '../../../services/attendanceService';
import { subjectService } from '../../../services/subjectService';
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
import { Plus, CheckCircle2, XCircle, Clock, AlertTriangle, Calendar } from 'lucide-react';
import { formatDate } from '../../../lib/utils';

const attendanceSchema = z.object({
  subjectId: z.string().min(1, 'Please select a subject'),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Format YYYY-MM-DD'),
  status: z.enum(['PRESENT', 'ABSENT', 'LATE', 'EXCUSED']).default('PRESENT'),
  notes: z.string().max(500).optional(),
});

type AttendanceFormValues = z.infer<typeof attendanceSchema>;

export default function AttendancePage() {
  const [data, setData] = useState<AttendanceAnalyticsResponse | null>(null);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRecordOpen, setIsRecordOpen] = useState(false);

  const {
    control,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = useForm<AttendanceFormValues>({
    resolver: zodResolver(attendanceSchema) as any,
    defaultValues: {
      subjectId: '',
      date: new Date().toISOString().split('T')[0],
      status: 'PRESENT',
      notes: '',
    },
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const [attRes, subRes] = await Promise.all([
        attendanceService.getAttendance(),
        subjectService.getSubjects(),
      ]);
      setData(attRes);
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

  const onSubmit = async (values: AttendanceFormValues) => {
    try {
      await attendanceService.recordAttendance(values);
      setIsRecordOpen(false);
      reset();
      loadData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error recording attendance');
    }
  };

  const subjectOptions = subjects.map((s) => ({ value: s.id, label: s.name }));

  if (loading) return <LoadingState message="Calculating attendance metrics..." />;

  const metrics = data?.metrics || {
    totalClasses: 0,
    presentCount: 0,
    absentCount: 0,
    lateCount: 0,
    excusedCount: 0,
    overallPercentage: 100,
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
            Academic Attendance Tracking
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Real-time calculation of overall and subject-level attendance percentages.
          </p>
        </div>

        <Button
          variant="primary"
          size="md"
          onClick={() => setIsRecordOpen(true)}
          leftIcon={<Plus className="w-4 h-4" />}
          className="shadow-lg shadow-indigo-500/20"
        >
          Mark Class Attendance
        </Button>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-indigo-500">
          <span className="text-xs font-bold uppercase text-slate-500 dark:text-slate-400">
            Overall Attendance
          </span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900 dark:text-slate-100">
              {metrics.overallPercentage}%
            </span>
            <span
              className={`text-xs font-bold ${
                metrics.overallPercentage >= 85 ? 'text-emerald-500' : 'text-rose-500'
              }`}
            >
              {metrics.overallPercentage >= 85 ? 'Healthy' : 'Below 85%'}
            </span>
          </div>
        </Card>

        <Card className="border-l-4 border-l-emerald-500">
          <span className="text-xs font-bold uppercase text-slate-500 dark:text-slate-400">
            Classes Present
          </span>
          <div className="mt-2">
            <span className="text-3xl font-black text-slate-900 dark:text-slate-100">
              {metrics.presentCount}
            </span>
            <span className="text-xs text-slate-400 block mt-0.5">
              out of {metrics.totalClasses} total
            </span>
          </div>
        </Card>

        <Card className="border-l-4 border-l-rose-500">
          <span className="text-xs font-bold uppercase text-slate-500 dark:text-slate-400">
            Classes Absent
          </span>
          <div className="mt-2">
            <span className="text-3xl font-black text-rose-500">
              {metrics.absentCount}
            </span>
            <span className="text-xs text-slate-400 block mt-0.5">unexcused absences</span>
          </div>
        </Card>

        <Card className="border-l-4 border-l-amber-500">
          <span className="text-xs font-bold uppercase text-slate-500 dark:text-slate-400">
            Late / Excused
          </span>
          <div className="mt-2">
            <span className="text-3xl font-black text-amber-500">
              {metrics.lateCount + metrics.excusedCount}
            </span>
            <span className="text-xs text-slate-400 block mt-0.5">
              ({metrics.lateCount} late, {metrics.excusedCount} excused)
            </span>
          </div>
        </Card>
      </div>

      {/* Subject-Wise Breakdown Cards */}
      <div className="space-y-3">
        <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
          Subject-Wise Attendance Breakdown
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {data?.subjectBreakdown.map((item) => (
            <Card key={item.subjectId} className="p-4 space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <div
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: item.color }}
                    />
                    <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                      {item.subjectName}
                    </h3>
                  </div>
                  {item.subjectCode && (
                    <span className="text-[10px] text-slate-400 font-semibold block mt-0.5">
                      {item.subjectCode}
                    </span>
                  )}
                </div>

                <Badge variant={item.percentage >= 85 ? 'success' : 'danger'}>
                  {item.percentage}%
                </Badge>
              </div>

              {/* Progress bar */}
              <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: `${item.percentage}%`,
                    backgroundColor: item.color,
                  }}
                />
              </div>

              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
                <span className="text-emerald-500 font-semibold">{item.present} Present</span>
                <span className="text-rose-500 font-semibold">{item.absent} Absent</span>
                <span>{item.total} Total</span>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Attendance History Log Table */}
      <Card title="Attendance Record History" subtitle="Recent log of marked class sessions">
        <Table
          columns={[
            {
              header: 'Date',
              accessor: (row) => (
                <div className="flex items-center gap-2">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <span className="font-semibold">{formatDate(row.date)}</span>
                </div>
              ),
            },
            {
              header: 'Subject',
              accessor: (row) => (
                <div className="flex items-center gap-2">
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: row.subject?.color || '#3B82F6' }}
                  />
                  <span>{row.subject?.name || 'Unknown'}</span>
                </div>
              ),
            },
            {
              header: 'Status',
              accessor: (row) => (
                <Badge
                  variant={
                    row.status === 'PRESENT'
                      ? 'success'
                      : row.status === 'ABSENT'
                      ? 'danger'
                      : row.status === 'LATE'
                      ? 'warning'
                      : 'info'
                  }
                >
                  {row.status}
                </Badge>
              ),
            },
            {
              header: 'Notes',
              accessor: (row) => (
                <span className="text-xs text-slate-400">{row.notes || '—'}</span>
              ),
            },
          ]}
          data={data?.records || []}
          emptyMessage="No attendance records logged yet"
        />
      </Card>

      {/* Modal: Mark Attendance */}
      <Modal
        isOpen={isRecordOpen}
        onClose={() => setIsRecordOpen(false)}
        title="Mark Class Attendance"
        description="Record your attendance for a specific lecture or lab session."
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <FormSelect
            name="subjectId"
            label="Subject"
            options={subjectOptions}
            control={control}
          />

          <FormInput
            name="date"
            label="Class Date"
            type="date"
            control={control}
          />

          <FormSelect
            name="status"
            label="Attendance Status"
            options={[
              { value: 'PRESENT', label: 'Present (Attended)' },
              { value: 'ABSENT', label: 'Absent' },
              { value: 'LATE', label: 'Late Arrival' },
              { value: 'EXCUSED', label: 'Excused Leave / Medical' },
            ]}
            control={control}
          />

          <FormTextarea
            name="notes"
            label="Notes (Optional)"
            placeholder="e.g. Attended lecture online or covered chapter 4..."
            control={control}
          />

          <div className="flex justify-end gap-2 pt-3">
            <Button type="button" variant="ghost" onClick={() => setIsRecordOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={isSubmitting}>
              Save Record
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
