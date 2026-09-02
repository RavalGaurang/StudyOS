import { prisma } from '../../config/database';
import { NotFoundError, ForbiddenError, ConflictError } from '../../common/errors/AppError';
import { analyticsService } from '../analytics/analytics.service';
import { LinkStudentInput } from './parent.schema';

export class ParentService {
  async getChildren(parentId: string) {
    const links = await prisma.parentStudent.findMany({
      where: { parentId, isApproved: true },
      include: {
        student: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                avatarUrl: true,
              },
            },
            subjects: {
              where: { isArchived: false },
              select: { id: true, name: true, color: true },
            },
            _count: {
              select: {
                tasks: { where: { status: 'COMPLETED' } },
                assignments: true,
                exams: true,
                studySessions: true,
              },
            },
          },
        },
      },
    });

    return links.map((link) => ({
      relationshipId: link.id,
      relationship: link.relationship,
      studentId: link.student.id,
      userId: link.student.user.id,
      firstName: link.student.user.firstName,
      lastName: link.student.user.lastName,
      email: link.student.user.email,
      avatarUrl: link.student.user.avatarUrl,
      gradeLevel: link.student.gradeLevel,
      schoolName: link.student.schoolName,
      subjectsCount: link.student.subjects.length,
      completedTasksCount: link.student._count.tasks,
      totalStudySessions: link.student._count.studySessions,
    }));
  }

  async verifyParentAccess(parentId: string, studentId: string) {
    const link = await prisma.parentStudent.findUnique({
      where: {
        parentId_studentId: {
          parentId,
          studentId,
        },
      },
    });

    if (!link || !link.isApproved) {
      throw new ForbiddenError('You do not have authorized access to view this student');
    }

    return link;
  }

  async getChildOverview(parentId: string, studentId: string) {
    await this.verifyParentAccess(parentId, studentId);
    return analyticsService.getStudentDashboardStats(studentId);
  }

  async linkStudent(parentId: string, input: LinkStudentInput) {
    const studentUser = await prisma.user.findUnique({
      where: { email: input.studentEmail },
      include: { studentProfile: true },
    });

    if (!studentUser || !studentUser.studentProfile) {
      throw new NotFoundError('No student account found with the provided email address');
    }

    const studentId = studentUser.studentProfile.id;

    const existingLink = await prisma.parentStudent.findUnique({
      where: {
        parentId_studentId: {
          parentId,
          studentId,
        },
      },
    });

    if (existingLink) {
      throw new ConflictError('A link request already exists for this student');
    }

    return prisma.parentStudent.create({
      data: {
        parentId,
        studentId,
        relationship: input.relationship,
        isApproved: true,
      },
      include: {
        student: {
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
                email: true,
              },
            },
          },
        },
      },
    });
  }
}

export const parentService = new ParentService();
