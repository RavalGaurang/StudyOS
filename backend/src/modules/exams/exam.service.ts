import { prisma } from '../../config/database';
import { NotFoundError } from '../../common/errors/AppError';
import { CreateExamInput, UpdateExamInput } from './exam.schema';
import { Prisma } from '@prisma/client';

export class ExamService {
  async getStudentExams(studentId: string, subjectId?: string, upcomingOnly?: boolean) {
    const where: Prisma.ExamWhereInput = { studentId };

    if (subjectId) where.subjectId = subjectId;
    if (upcomingOnly) {
      where.examDate = { gte: new Date() };
    }

    return prisma.exam.findMany({
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
      orderBy: { examDate: 'asc' },
    });
  }

  async getExamById(examId: string, studentId: string) {
    const exam = await prisma.exam.findFirst({
      where: { id: examId, studentId },
      include: {
        subject: true,
      },
    });

    if (!exam) {
      throw new NotFoundError('Exam not found or access denied');
    }

    return exam;
  }

  async createExam(studentId: string, input: CreateExamInput) {
    return prisma.exam.create({
      data: {
        studentId,
        subjectId: input.subjectId,
        title: input.title,
        examDate: new Date(input.examDate),
        durationMinutes: input.durationMinutes,
        maxMarks: input.maxMarks,
        weightagePercent: input.weightagePercent,
        roomLocation: input.roomLocation,
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

  async updateExam(examId: string, studentId: string, input: UpdateExamInput) {
    const exam = await prisma.exam.findFirst({
      where: { id: examId, studentId },
    });

    if (!exam) {
      throw new NotFoundError('Exam not found or access denied');
    }

    const data: Prisma.ExamUpdateInput = {
      ...(input.title && { title: input.title }),
      ...(input.subjectId && { subject: { connect: { id: input.subjectId } } }),
      ...(input.examDate && { examDate: new Date(input.examDate) }),
      ...(input.durationMinutes !== undefined && { durationMinutes: input.durationMinutes }),
      ...(input.maxMarks !== undefined && { maxMarks: input.maxMarks }),
      ...(input.obtainedMarks !== undefined && { obtainedMarks: input.obtainedMarks }),
      ...(input.weightagePercent !== undefined && { weightagePercent: input.weightagePercent }),
      ...(input.roomLocation !== undefined && { roomLocation: input.roomLocation }),
      ...(input.notes !== undefined && { notes: input.notes }),
    };

    return prisma.exam.update({
      where: { id: examId },
      data,
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

  async deleteExam(examId: string, studentId: string) {
    const exam = await prisma.exam.findFirst({
      where: { id: examId, studentId },
    });

    if (!exam) {
      throw new NotFoundError('Exam not found or access denied');
    }

    await prisma.exam.delete({
      where: { id: examId },
    });

    return { success: true };
  }
}

export const examService = new ExamService();
