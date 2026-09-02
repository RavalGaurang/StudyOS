import { prisma } from '../../config/database';
import { TaskStatus, AttendanceStatus } from '@prisma/client';

export class AnalyticsService {
  async getStudentDashboardStats(studentId: string) {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
    
    // 7 days ago
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    // 30 days ago
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const [
      subjects,
      todayTasks,
      pendingTasksCount,
      completedTasksCount,
      upcomingAssignments,
      upcomingExams,
      recentSessions,
      allSessionsPast30Days,
      attendanceRecords,
      goals,
      recentNotes,
    ] = await Promise.all([
      // Subjects with unit/topic completion
      prisma.subject.findMany({
        where: { studentId, isArchived: false },
        include: {
          units: {
            include: { topics: true },
          },
        },
      }),
      // Today's Tasks
      prisma.task.findMany({
        where: {
          studentId,
          dueDate: { gte: startOfToday, lte: endOfToday },
        },
        include: { subject: { select: { name: true, color: true, code: true } } },
        orderBy: [{ status: 'asc' }, { priority: 'desc' }],
      }),
      // Pending tasks
      prisma.task.count({
        where: { studentId, status: { in: [TaskStatus.TODO, TaskStatus.IN_PROGRESS] } },
      }),
      // Completed tasks
      prisma.task.count({
        where: { studentId, status: TaskStatus.COMPLETED },
      }),
      // Upcoming assignments (next 14 days)
      prisma.assignment.findMany({
        where: {
          studentId,
          status: { not: 'GRADED' },
          dueDate: { gte: now },
        },
        include: { subject: { select: { name: true, color: true, code: true } } },
        orderBy: { dueDate: 'asc' },
        take: 5,
      }),
      // Upcoming exams
      prisma.exam.findMany({
        where: {
          studentId,
          examDate: { gte: now },
        },
        include: { subject: { select: { name: true, color: true, code: true } } },
        orderBy: { examDate: 'asc' },
        take: 5,
      }),
      // Recent study sessions (last 7 days)
      prisma.studySession.findMany({
        where: { studentId, startedAt: { gte: sevenDaysAgo } },
        include: { subject: { select: { name: true, color: true } } },
        orderBy: { startedAt: 'desc' },
      }),
      // Sessions last 30 days
      prisma.studySession.findMany({
        where: { studentId, startedAt: { gte: thirtyDaysAgo } },
        include: { subject: { select: { name: true, color: true } } },
      }),
      // Attendance records
      prisma.attendance.findMany({
        where: { studentId },
      }),
      // Active Goals
      prisma.goal.findMany({
        where: { studentId, status: 'IN_PROGRESS' },
        orderBy: { targetDate: 'asc' },
        take: 4,
      }),
      // Recent Notes
      prisma.note.findMany({
        where: { studentId, isArchived: false },
        include: { subject: { select: { name: true, color: true } } },
        orderBy: { updatedAt: 'desc' },
        take: 4,
      }),
    ]);

    // 1. Calculate 7-day daily study time trend
    const dailyStudyTrend: { day: string; date: string; minutes: number; hours: number }[] = [];
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    for (let i = 6; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const dayStart = new Date(d.getFullYear(), d.getMonth(), d.getDate());
      const dayEnd = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999);

      const daySessions = recentSessions.filter(
        (s) => s.startedAt >= dayStart && s.startedAt <= dayEnd
      );
      const minutes = daySessions.reduce((acc, s) => acc + s.durationMinutes, 0);

      dailyStudyTrend.push({
        day: dayNames[dayStart.getDay()],
        date: dayStart.toISOString().split('T')[0],
        minutes,
        hours: Math.round((minutes / 60) * 10) / 10,
      });
    }

    // 2. Weekly & Monthly Study totals
    const weeklyStudyMinutes = recentSessions.reduce((acc, s) => acc + s.durationMinutes, 0);
    const monthlyStudyMinutes = allSessionsPast30Days.reduce((acc, s) => acc + s.durationMinutes, 0);

    // 3. Subject-wise study hours breakdown
    const subjectStudyMap: Record<string, { name: string; color: string; minutes: number; hours: number }> = {};
    for (const session of allSessionsPast30Days) {
      const subName = session.subject?.name || 'General Study';
      const subColor = session.subject?.color || '#94A3B8';
      if (!subjectStudyMap[subName]) {
        subjectStudyMap[subName] = { name: subName, color: subColor, minutes: 0, hours: 0 };
      }
      subjectStudyMap[subName].minutes += session.durationMinutes;
    }
    const subjectStudyDistribution = Object.values(subjectStudyMap).map((item) => ({
      ...item,
      hours: Math.round((item.minutes / 60) * 10) / 10,
    }));

    // 4. Overall Attendance Calculation
    let presentCount = 0;
    let lateCount = 0;
    for (const att of attendanceRecords) {
      if (att.status === AttendanceStatus.PRESENT) presentCount++;
      if (att.status === AttendanceStatus.LATE) lateCount++;
    }
    const totalAttendance = attendanceRecords.length;
    const attendancePercentage =
      totalAttendance > 0 ? Math.round(((presentCount + lateCount) / totalAttendance) * 100) : 100;

    // 5. Subject Syllabus Progress
    const subjectProgress = subjects.map((sub) => {
      let totalTopics = 0;
      let completedTopics = 0;
      for (const unit of sub.units) {
        for (const topic of unit.topics) {
          totalTopics++;
          if (topic.isCompleted) completedTopics++;
        }
      }
      const progress = totalTopics > 0 ? Math.round((completedTopics / totalTopics) * 100) : 0;
      return {
        id: sub.id,
        name: sub.name,
        code: sub.code,
        color: sub.color,
        icon: sub.icon,
        targetGrade: sub.targetGrade,
        totalTopics,
        completedTopics,
        progress,
      };
    });

    return {
      summary: {
        weeklyStudyHours: Math.round((weeklyStudyMinutes / 60) * 10) / 10,
        monthlyStudyHours: Math.round((monthlyStudyMinutes / 60) * 10) / 10,
        pendingTasksCount,
        completedTasksCount,
        taskCompletionRate:
          pendingTasksCount + completedTasksCount > 0
            ? Math.round(
                (completedTasksCount / (pendingTasksCount + completedTasksCount)) * 100
              )
            : 0,
        attendancePercentage,
        upcomingExamsCount: upcomingExams.length,
        pendingAssignmentsCount: upcomingAssignments.length,
      },
      todayTasks,
      upcomingAssignments,
      upcomingExams,
      dailyStudyTrend,
      subjectStudyDistribution,
      subjectProgress,
      goals,
      recentNotes,
    };
  }

  async getAdminStats() {
    const [
      totalUsers,
      totalStudents,
      totalParents,
      totalTeachers,
      totalStudySessions,
      totalStudyMinutesAgg,
      totalQuizzes,
      totalQuizAttempts,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.studentProfile.count(),
      prisma.parentProfile.count(),
      prisma.teacherProfile.count(),
      prisma.studySession.count(),
      prisma.studySession.aggregate({ _sum: { durationMinutes: true } }),
      prisma.quiz.count(),
      prisma.quizAttempt.count(),
    ]);

    const totalStudyHours = Math.round(((totalStudyMinutesAgg._sum.durationMinutes || 0) / 60) * 10) / 10;

    return {
      totalUsers,
      totalStudents,
      totalParents,
      totalTeachers,
      totalStudySessions,
      totalStudyHours,
      totalQuizzes,
      totalQuizAttempts,
    };
  }
}

export const analyticsService = new AnalyticsService();
