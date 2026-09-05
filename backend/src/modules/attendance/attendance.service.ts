import { prisma } from '../../config/database';
import { NotFoundError } from '../../common/errors/AppError';
import { RecordAttendanceInput, UpdateAttendanceInput } from './attendance.schema';
import { AttendanceStatus, Prisma } from '@prisma/client';

export class AttendanceService {
  async getStudentAttendance(studentId: string, subjectId?: string, startDate?: string, endDate?: string) {
    const where: Prisma.AttendanceWhereInput = { studentId };

    if (subjectId) where.subjectId = subjectId;
    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date.gte = new Date(startDate);
      if (endDate) where.date.lte = new Date(endDate);
    }

    const [records, subjects] = await Promise.all([
      prisma.attendance.findMany({
        where,
        include: {
          subject: {
            select: {
              id: true,
              name: true,
              code: true,
              color: true,
              icon: true,
            },
          },
        },
        orderBy: { date: 'desc' },
      }),
      prisma.subject.findMany({
        where: { studentId, isArchived: false },
        select: { id: true, name: true, code: true, color: true },
      }),
    ]);

    // Calculate dynamic aggregate statistics
    let totalClasses = 0;
    let presentCount = 0;
    let absentCount = 0;
    let lateCount = 0;
    let excusedCount = 0;

    const subjectStatsMap: Record<
      string,
      {
        subjectId: string;
        subjectName: string;
        subjectCode: string | null;
        color: string;
        total: number;
        present: number;
        absent: number;
        late: number;
        excused: number;
        percentage: number;
      }
    > = {};

    for (const sub of subjects) {
      subjectStatsMap[sub.id] = {
        subjectId: sub.id,
        subjectName: sub.name,
        subjectCode: sub.code,
        color: sub.color,
        total: 0,
        present: 0,
        absent: 0,
        late: 0,
        excused: 0,
        percentage: 100,
      };
    }

    for (const rec of records) {
      totalClasses += 1;
      if (rec.status === AttendanceStatus.PRESENT) presentCount += 1;
      else if (rec.status === AttendanceStatus.ABSENT) absentCount += 1;
      else if (rec.status === AttendanceStatus.LATE) lateCount += 1;
      else if (rec.status === AttendanceStatus.EXCUSED) excusedCount += 1;

      if (subjectStatsMap[rec.subjectId]) {
        const stat = subjectStatsMap[rec.subjectId];
        stat.total += 1;
        if (rec.status === AttendanceStatus.PRESENT) stat.present += 1;
        else if (rec.status === AttendanceStatus.ABSENT) stat.absent += 1;
        else if (rec.status === AttendanceStatus.LATE) stat.late += 1;
        else if (rec.status === AttendanceStatus.EXCUSED) stat.excused += 1;
      }
    }

    // Calculate percentage per subject (Present + Late * 0.5 or standard Present/Total)
    // Standard formula: ((Present + Late) / Total) * 100
    const subjectBreakdown = Object.values(subjectStatsMap).map((stat) => {
      const attended = stat.present + stat.late;
      const percentage = stat.total > 0 ? Math.round((attended / stat.total) * 100) : 100;
      return {
        ...stat,
        percentage,
      };
    });

    const attendedOverall = presentCount + lateCount;
    const overallPercentage =
      totalClasses > 0 ? Math.round((attendedOverall / totalClasses) * 100) : 100;

    return {
      records,
      metrics: {
        totalClasses,
        presentCount,
        absentCount,
        lateCount,
        excusedCount,
        overallPercentage,
      },
      subjectBreakdown,
    };
  }

  async recordAttendance(studentId: string, input: RecordAttendanceInput) {
    const attendanceDate = new Date(input.date);

    // Upsert record so marking again on same day updates status
    return prisma.attendance.upsert({
      where: {
        studentId_subjectId_date: {
          studentId,
          subjectId: input.subjectId,
          date: attendanceDate,
        },
      },
      update: {
        status: input.status,
        notes: input.notes,
      },
      create: {
        studentId,
        subjectId: input.subjectId,
        date: attendanceDate,
        status: input.status,
        notes: input.notes,
      },
      include: {
        subject: {
          select: {
            id: true,
            name: true,
            code: true,
            color: true,
            icon: true,
          },
        },
      },
    });
  }

  async updateAttendance(attendanceId: string, studentId: string, input: UpdateAttendanceInput) {
    const record = await prisma.attendance.findFirst({
      where: { id: attendanceId, studentId },
    });

    if (!record) {
      throw new NotFoundError('Attendance record not found or access denied');
    }

    return prisma.attendance.update({
      where: { id: attendanceId },
      data: input,
      include: {
        subject: {
          select: {
            id: true,
            name: true,
            code: true,
            color: true,
            icon: true,
          },
        },
      },
    });
  }

  async deleteAttendance(attendanceId: string, studentId: string) {
    const record = await prisma.attendance.findFirst({
      where: { id: attendanceId, studentId },
    });

    if (!record) {
      throw new NotFoundError('Attendance record not found or access denied');
    }

    await prisma.attendance.delete({
      where: { id: attendanceId },
    });

    return { success: true };
  }

  async getAttendanceById(attendanceId: string, studentId: string) {
    const record = await prisma.attendance.findFirst({
      where: { id: attendanceId, studentId },
      include: {
        subject: {
          select: {
            id: true,
            name: true,
            code: true,
            color: true,
            icon: true,
          },
        },
      },
    });

    if (!record) {
      throw new NotFoundError('Attendance record not found or access denied');
    }

    return record;
  }

  async getAttendanceSummary(studentId: string, subjectId?: string, startDate?: string, endDate?: string) {
    const { metrics, subjectBreakdown } = await this.getStudentAttendance(studentId, subjectId, startDate, endDate);
    return { metrics, subjectBreakdown };
  }
}

export const attendanceService = new AttendanceService();
