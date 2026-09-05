import { prisma } from '../../config/database';
import { NotFoundError } from '../../common/errors/AppError';
import { UserQueryInput } from './admin.schema';
import { Prisma } from '@prisma/client';

export class AdminService {
  async getUsers(query: UserQueryInput) {
    const page = Math.max(1, parseInt(query.page || '1', 10));
    const limit = Math.max(1, Math.min(100, parseInt(query.limit || '20', 10)));
    const skip = (page - 1) * limit;

    const where: Prisma.UserWhereInput = {};

    if (query.search) {
      where.OR = [
        { email: { contains: query.search, mode: 'insensitive' } },
        { firstName: { contains: query.search, mode: 'insensitive' } },
        { lastName: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    if (query.role) {
      where.role = query.role;
    }

    if (query.isActive !== undefined) {
      where.isActive = query.isActive === 'true';
    }

    const orderBy: Prisma.UserOrderByWithRelationInput = {
      [query.sortBy || 'createdAt']: query.sortOrder || 'desc',
    };

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          email: true,
          role: true,
          firstName: true,
          lastName: true,
          avatarUrl: true,
          isActive: true,
          isEmailVerified: true,
          createdAt: true,
          studentProfile: { select: { id: true, gradeLevel: true, schoolName: true } },
          parentProfile: { select: { id: true, phoneNumber: true } },
          teacherProfile: { select: { id: true, department: true } },
        },
        orderBy,
        skip,
        take: limit,
      }),
      prisma.user.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      users,
      meta: {
        page,
        limit,
        total,
        totalPages,
      },
    };
  }

  async toggleUserStatus(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundError('User not found');
    }

    const updated = await prisma.user.update({
      where: { id: userId },
      data: { isActive: !user.isActive },
      select: {
        id: true,
        email: true,
        isActive: true,
      },
    });

    // If deactivated, revoke all refresh tokens
    if (!updated.isActive) {
      await prisma.refreshToken.updateMany({
        where: { userId: user.id },
        data: { revokedAt: new Date() },
      });
    }

    return updated;
  }

  async getStats() {
    const [
      totalUsers,
      totalStudents,
      totalParents,
      totalTeachers,
      totalSubjects,
      totalTasks,
      totalStudySessions,
      studySessions,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { role: 'STUDENT' } }),
      prisma.user.count({ where: { role: 'PARENT' } }),
      prisma.user.count({ where: { role: 'TEACHER' } }),
      prisma.subject.count(),
      prisma.task.count(),
      prisma.studySession.count(),
      prisma.studySession.findMany({ select: { durationMinutes: true } }),
    ]);

    const totalMinutes = studySessions.reduce((acc, s) => acc + (s.durationMinutes || 0), 0);
    const totalStudyHours = Math.round((totalMinutes / 60) * 10) / 10;

    return {
      totalUsers,
      totalStudents,
      totalParents,
      totalTeachers,
      totalSubjects,
      totalTasks,
      totalStudySessions,
      totalStudyHours,
    };
  }
}

export const adminService = new AdminService();
