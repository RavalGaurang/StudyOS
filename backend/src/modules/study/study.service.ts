import { prisma } from '../../config/database';
import { NotFoundError } from '../../common/errors/AppError';
import {
  CreateStudySessionInput,
  CreateStudyPlanInput,
  UpdateStudyPlanItemInput,
  CreateGoalInput,
  UpdateGoalInput,
} from './study.schema';
import { Prisma } from '@prisma/client';

export class StudyService {
  // Study Sessions
  async getStudySessions(studentId: string, limit: number = 30) {
    const sessions = await prisma.studySession.findMany({
      where: { studentId },
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
        topic: {
          select: {
            id: true,
            title: true,
          },
        },
      },
      orderBy: { startedAt: 'desc' },
      take: limit,
    });

    const totalMinutesAgg = await prisma.studySession.aggregate({
      where: { studentId },
      _sum: { durationMinutes: true },
      _count: true,
    });

    const totalMinutes = totalMinutesAgg._sum.durationMinutes || 0;
    const totalHours = Math.round((totalMinutes / 60) * 10) / 10;

    return {
      sessions,
      totalSessions: totalMinutesAgg._count,
      totalMinutes,
      totalHours,
    };
  }

  async logStudySession(studentId: string, input: CreateStudySessionInput) {
    return prisma.studySession.create({
      data: {
        studentId,
        subjectId: input.subjectId || null,
        topicId: input.topicId || null,
        sessionType: input.sessionType,
        durationMinutes: input.durationMinutes,
        startedAt: new Date(input.startedAt),
        endedAt: new Date(input.endedAt),
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

  // Study Plans
  async getStudyPlans(studentId: string) {
    return prisma.studyPlan.findMany({
      where: { studentId },
      include: {
        items: {
          include: {
            subject: { select: { id: true, name: true, color: true } },
            unit: { select: { id: true, title: true } },
            topic: { select: { id: true, title: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async createStudyPlan(studentId: string, input: CreateStudyPlanInput) {
    return prisma.studyPlan.create({
      data: {
        studentId,
        title: input.title,
        description: input.description,
        startDate: new Date(input.startDate),
        endDate: new Date(input.endDate),
        targetHours: input.targetHours,
        items: {
          create: input.items.map((item) => ({
            subjectId: item.subjectId || null,
            unitId: item.unitId || null,
            topicId: item.topicId || null,
            plannedMinutes: item.plannedMinutes,
            targetDate: item.targetDate ? new Date(item.targetDate) : null,
          })),
        },
      },
      include: {
        items: true,
      },
    });
  }

  async updatePlanItem(itemId: string, studentId: string, input: UpdateStudyPlanItemInput) {
    const item = await prisma.studyPlanItem.findFirst({
      where: { id: itemId, studyPlan: { studentId } },
    });

    if (!item) {
      throw new NotFoundError('Study plan item not found or access denied');
    }

    return prisma.studyPlanItem.update({
      where: { id: itemId },
      data: input,
    });
  }

  // Goals
  async getGoals(studentId: string) {
    return prisma.goal.findMany({
      where: { studentId },
      orderBy: [{ status: 'asc' }, { targetDate: 'asc' }],
    });
  }

  async createGoal(studentId: string, input: CreateGoalInput) {
    return prisma.goal.create({
      data: {
        studentId,
        title: input.title,
        description: input.description,
        targetDate: new Date(input.targetDate),
        metricType: input.metricType,
        targetValue: input.targetValue,
        currentValue: input.currentValue || 0,
      },
    });
  }

  async updateGoal(goalId: string, studentId: string, input: UpdateGoalInput) {
    const goal = await prisma.goal.findFirst({
      where: { id: goalId, studentId },
    });

    if (!goal) {
      throw new NotFoundError('Goal not found or access denied');
    }

    const data: Prisma.GoalUpdateInput = {
      ...(input.title && { title: input.title }),
      ...(input.description !== undefined && { description: input.description }),
      ...(input.targetDate && { targetDate: new Date(input.targetDate) }),
      ...(input.targetValue !== undefined && { targetValue: input.targetValue }),
      ...(input.currentValue !== undefined && { currentValue: input.currentValue }),
      ...(input.status && { status: input.status }),
    };

    return prisma.goal.update({
      where: { id: goalId },
      data,
    });
  }

  async deleteGoal(goalId: string, studentId: string) {
    const goal = await prisma.goal.findFirst({
      where: { id: goalId, studentId },
    });

    if (!goal) {
      throw new NotFoundError('Goal not found or access denied');
    }

    await prisma.goal.delete({
      where: { id: goalId },
    });

    return { success: true };
  }
}

export const studyService = new StudyService();
