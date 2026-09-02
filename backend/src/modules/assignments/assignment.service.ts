import { prisma } from '../../config/database';
import { NotFoundError } from '../../common/errors/AppError';
import { CreateAssignmentInput, UpdateAssignmentInput } from './assignment.schema';
import { AssignmentStatus, Prisma } from '@prisma/client';

export class AssignmentService {
  async getStudentAssignments(studentId: string, subjectId?: string, status?: AssignmentStatus) {
    const where: Prisma.AssignmentWhereInput = { studentId };

    if (subjectId) where.subjectId = subjectId;
    if (status) where.status = status;

    return prisma.assignment.findMany({
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
      orderBy: { dueDate: 'asc' },
    });
  }

  async getAssignmentById(assignmentId: string, studentId: string) {
    const assignment = await prisma.assignment.findFirst({
      where: { id: assignmentId, studentId },
      include: {
        subject: true,
      },
    });

    if (!assignment) {
      throw new NotFoundError('Assignment not found or access denied');
    }

    return assignment;
  }

  async createAssignment(studentId: string, input: CreateAssignmentInput) {
    return prisma.assignment.create({
      data: {
        studentId,
        subjectId: input.subjectId,
        title: input.title,
        description: input.description,
        dueDate: new Date(input.dueDate),
        status: input.status,
        maxMarks: input.maxMarks,
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

  async updateAssignment(assignmentId: string, studentId: string, input: UpdateAssignmentInput) {
    const assignment = await prisma.assignment.findFirst({
      where: { id: assignmentId, studentId },
    });

    if (!assignment) {
      throw new NotFoundError('Assignment not found or access denied');
    }

    const data: Prisma.AssignmentUpdateInput = {
      ...(input.title && { title: input.title }),
      ...(input.description !== undefined && { description: input.description }),
      ...(input.subjectId && { subject: { connect: { id: input.subjectId } } }),
      ...(input.dueDate && { dueDate: new Date(input.dueDate) }),
      ...(input.status && { status: input.status }),
      ...(input.maxMarks !== undefined && { maxMarks: input.maxMarks }),
      ...(input.obtainedMarks !== undefined && { obtainedMarks: input.obtainedMarks }),
      ...(input.submissionNotes !== undefined && { submissionNotes: input.submissionNotes }),
    };

    return prisma.assignment.update({
      where: { id: assignmentId },
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

  async deleteAssignment(assignmentId: string, studentId: string) {
    const assignment = await prisma.assignment.findFirst({
      where: { id: assignmentId, studentId },
    });

    if (!assignment) {
      throw new NotFoundError('Assignment not found or access denied');
    }

    await prisma.assignment.delete({
      where: { id: assignmentId },
    });

    return { success: true };
  }
}

export const assignmentService = new AssignmentService();
