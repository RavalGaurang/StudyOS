import * as bcrypt from 'bcryptjs';
import { Prisma, UserRole } from '@prisma/client';
import { prisma } from '../../config/database';
import {
  BadRequestError,
  ConflictError,
  NotFoundError,
} from '../../common/errors/AppError';
import {
  CreateUserInput,
  UpdateUserInput,
  UserQueryInput,
  UserResponseDto,
} from './user.types';

const USER_SELECT_FIELDS = {
  id: true,
  email: true,
  firstName: true,
  lastName: true,
  mobile: true,
  role: true,
  isActive: true,
  avatarUrl: true,
  isEmailVerified: true,
  createdAt: true,
  updatedAt: true,
  studentProfile: {
    select: {
      id: true,
      gradeLevel: true,
      schoolName: true,
    },
  },
  parentProfile: {
    select: {
      id: true,
      phoneNumber: true,
    },
  },
  teacherProfile: {
    select: {
      id: true,
      department: true,
    },
  },
  adminProfile: {
    select: {
      id: true,
    },
  },
} as const;

export class UserService {
  /**
   * Get paginated users with server-side searching, sorting, and filtering
   */
  async getUsers(query: UserQueryInput) {
    const page = Math.max(1, parseInt(query.page || '1', 10));
    const limit = Math.max(1, Math.min(100, parseInt(query.limit || '10', 10)));
    const skip = (page - 1) * limit;

    const where: Prisma.UserWhereInput = {};

    if (query.search && query.search.trim()) {
      const term = query.search.trim();
      where.OR = [
        { email: { contains: term, mode: 'insensitive' } },
        { firstName: { contains: term, mode: 'insensitive' } },
        { lastName: { contains: term, mode: 'insensitive' } },
        { mobile: { contains: term, mode: 'insensitive' } },
      ];
    }

    if (query.role) {
      where.role = query.role;
    }

    if (query.isActive !== undefined) {
      where.isActive = query.isActive === 'true';
    }

    const sortField = query.sortBy || 'createdAt';
    const sortOrder = query.sortOrder || 'desc';
    const orderBy: Prisma.UserOrderByWithRelationInput = {
      [sortField]: sortOrder,
    };

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: USER_SELECT_FIELDS,
        orderBy,
        skip,
        take: limit,
      }),
      prisma.user.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit) || 1;

    return {
      users: users as unknown as UserResponseDto[],
      meta: {
        page,
        limit,
        total,
        totalPages,
      },
    };
  }

  /**
   * Get single user by ID
   */
  async getUserById(userId: string): Promise<UserResponseDto> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: USER_SELECT_FIELDS,
    });

    if (!user) {
      throw new NotFoundError('User not found');
    }

    return user as unknown as UserResponseDto;
  }

  /**
   * Create new user with hashed password and associated role profile
   */
  async createUser(input: CreateUserInput): Promise<UserResponseDto> {
    const existing = await prisma.user.findUnique({
      where: { email: input.email.toLowerCase() },
    });

    if (existing) {
      throw new ConflictError('A user with this email address already exists');
    }

    const passwordHash = await bcrypt.hash(input.password, 10);
    const role = input.role || UserRole.STUDENT;

    const createdUser = await prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: {
          email: input.email.toLowerCase(),
          passwordHash,
          firstName: input.firstName.trim(),
          lastName: input.lastName.trim(),
          mobile: input.mobile ? input.mobile.trim() : null,
          role,
          isActive: input.isActive ?? true,
        },
      });

      // Automatically initialize corresponding profile
      if (role === UserRole.STUDENT) {
        await tx.studentProfile.create({
          data: { userId: newUser.id },
        });
      } else if (role === UserRole.PARENT) {
        await tx.parentProfile.create({
          data: {
            userId: newUser.id,
            phoneNumber: input.mobile || null,
          },
        });
      } else if (role === UserRole.TEACHER) {
        await tx.teacherProfile.create({
          data: { userId: newUser.id },
        });
      } else if (role === UserRole.ADMIN) {
        await tx.adminProfile.create({
          data: { userId: newUser.id },
        });
      }

      return tx.user.findUnique({
        where: { id: newUser.id },
        select: USER_SELECT_FIELDS,
      });
    });

    return createdUser as unknown as UserResponseDto;
  }

  /**
   * Update existing user profile fields
   */
  async updateUser(userId: string, input: UpdateUserInput): Promise<UserResponseDto> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundError('User not found');
    }

    if (input.email && input.email.toLowerCase() !== user.email.toLowerCase()) {
      const emailConflict = await prisma.user.findUnique({
        where: { email: input.email.toLowerCase() },
      });
      if (emailConflict) {
        throw new ConflictError('A user with this email address already exists');
      }
    }

    const updateData: Prisma.UserUpdateInput = {};
    if (input.firstName !== undefined) updateData.firstName = input.firstName.trim();
    if (input.lastName !== undefined) updateData.lastName = input.lastName.trim();
    if (input.email !== undefined) updateData.email = input.email.toLowerCase().trim();
    if (input.mobile !== undefined) updateData.mobile = input.mobile ? input.mobile.trim() : null;
    if (input.role !== undefined) updateData.role = input.role;
    if (input.isActive !== undefined) updateData.isActive = input.isActive;

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: USER_SELECT_FIELDS,
    });

    return updatedUser as unknown as UserResponseDto;
  }

  /**
   * Delete user and handle related records safely
   */
  async deleteUser(userId: string, currentAdminId?: string): Promise<void> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundError('User not found');
    }

    if (currentAdminId && currentAdminId === userId) {
      throw new BadRequestError('You cannot delete your own active administrator account');
    }

    await prisma.$transaction(async (tx) => {
      // Clean up relations that might not cascade
      await tx.refreshToken.deleteMany({ where: { userId } });
      await tx.notification.deleteMany({ where: { userId } });
      await tx.aiConversation.deleteMany({ where: { userId } });

      await tx.user.delete({
        where: { id: userId },
      });
    });
  }

  /**
   * Toggle or update user active status
   */
  async updateUserStatus(userId: string, isActive: boolean): Promise<UserResponseDto> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundError('User not found');
    }

    const updated = await prisma.user.update({
      where: { id: userId },
      data: { isActive },
      select: USER_SELECT_FIELDS,
    });

    // Revoke tokens if deactivated to prevent unauthenticated access
    if (!isActive) {
      await prisma.refreshToken.updateMany({
        where: { userId },
        data: { revokedAt: new Date() },
      });
    }

    return updated as unknown as UserResponseDto;
  }
}

export const userService = new UserService();
