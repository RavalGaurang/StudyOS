import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import * as bcrypt from 'bcryptjs';
import { prisma } from '../../config/database';
import { env } from '../../config/env.config';
import { ConflictError, UnauthorizedError, NotFoundError } from '../../common/errors/AppError';
import { RegisterInput, LoginInput } from './auth.schema';
import { UserRole } from '@prisma/client';

export class AuthService {
  // Hash raw refresh token with SHA-256 before database storage
  private hashToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
  }

  // Generate short-lived JWT access token
  private generateAccessToken(user: { id: string; email: string; role: UserRole }): string {
    return jwt.sign(
      {
        userId: user.id,
        email: user.email,
        role: user.role,
      },
      env.JWT_ACCESS_SECRET,
      { expiresIn: env.ACCESS_TOKEN_EXPIRES_IN as any }
    );
  }

  // Generate 64-character random refresh token
  private generateRefreshToken(): string {
    return crypto.randomBytes(40).toString('hex');
  }

  // Sanitize user object for responses
  private sanitizeUser(user: any) {
    let profile = null;
    let profileId = undefined;

    if (user.studentProfile) {
      profile = user.studentProfile;
      profileId = user.studentProfile.id;
    } else if (user.parentProfile) {
      profile = user.parentProfile;
      profileId = user.parentProfile.id;
    } else if (user.teacherProfile) {
      profile = user.teacherProfile;
      profileId = user.teacherProfile.id;
    } else if (user.adminProfile) {
      profile = user.adminProfile;
      profileId = user.adminProfile.id;
    }

    return {
      id: user.id,
      email: user.email,
      role: user.role,
      firstName: user.firstName,
      lastName: user.lastName,
      avatarUrl: user.avatarUrl,
      isActive: user.isActive,
      isEmailVerified: user.isEmailVerified,
      profileId,
      profile,
      createdAt: user.createdAt,
    };
  }

  async register(input: RegisterInput) {
    const existingUser = await prisma.user.findUnique({
      where: { email: input.email },
    });

    if (existingUser) {
      throw new ConflictError('An account with this email address already exists');
    }

    const passwordHash = await bcrypt.hash(input.password, 10);

    // Create user and profile atomically
    const user = await prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: {
          email: input.email,
          passwordHash,
          role: input.role,
          firstName: input.firstName,
          lastName: input.lastName,
        },
      });

      if (input.role === UserRole.STUDENT) {
        await tx.studentProfile.create({
          data: {
            userId: newUser.id,
            gradeLevel: input.gradeLevel,
            schoolName: input.schoolName,
          },
        });
      } else if (input.role === UserRole.PARENT) {
        await tx.parentProfile.create({
          data: {
            userId: newUser.id,
            phoneNumber: input.phoneNumber,
          },
        });
      } else if (input.role === UserRole.TEACHER) {
        await tx.teacherProfile.create({
          data: {
            userId: newUser.id,
          },
        });
      } else if (input.role === UserRole.ADMIN) {
        await tx.adminProfile.create({
          data: {
            userId: newUser.id,
          },
        });
      }

      return tx.user.findUnique({
        where: { id: newUser.id },
        include: {
          studentProfile: true,
          parentProfile: true,
          teacherProfile: true,
          adminProfile: true,
        },
      });
    });

    if (!user) throw new Error('User creation failed');

    const accessToken = this.generateAccessToken(user);
    const rawRefreshToken = this.generateRefreshToken();
    const tokenHash = this.hashToken(rawRefreshToken);

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await prisma.refreshToken.create({
      data: {
        userId: user.id,
        tokenHash,
        expiresAt,
      },
    });

    return {
      user: this.sanitizeUser(user),
      accessToken,
      rawRefreshToken,
    };
  }

  async login(input: LoginInput) {
    const user = await prisma.user.findUnique({
      where: { email: input.email },
      include: {
        studentProfile: true,
        parentProfile: true,
        teacherProfile: true,
        adminProfile: true,
      },
    });

    if (!user) {
      throw new UnauthorizedError('Invalid email or password');
    }

    if (!user.isActive) {
      throw new UnauthorizedError('Your account has been deactivated. Please contact support.');
    }

    const isPasswordValid = await bcrypt.compare(input.password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedError('Invalid email or password');
    }

    const accessToken = this.generateAccessToken(user);
    const rawRefreshToken = this.generateRefreshToken();
    const tokenHash = this.hashToken(rawRefreshToken);

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await prisma.refreshToken.create({
      data: {
        userId: user.id,
        tokenHash,
        expiresAt,
      },
    });

    return {
      user: this.sanitizeUser(user),
      accessToken,
      rawRefreshToken,
    };
  }

  async refreshTokens(rawRefreshToken: string) {
    if (!rawRefreshToken) {
      throw new UnauthorizedError('Refresh token missing');
    }

    const tokenHash = this.hashToken(rawRefreshToken);

    const storedToken = await prisma.refreshToken.findUnique({
      where: { tokenHash },
      include: {
        user: {
          include: {
            studentProfile: true,
            parentProfile: true,
            teacherProfile: true,
            adminProfile: true,
          },
        },
      },
    });

    if (!storedToken) {
      throw new UnauthorizedError('Invalid refresh token');
    }

    if (storedToken.revokedAt || storedToken.expiresAt < new Date()) {
      // Possible token reuse attack - invalidate all user sessions
      await prisma.refreshToken.updateMany({
        where: { userId: storedToken.userId },
        data: { revokedAt: new Date() },
      });
      throw new UnauthorizedError('Refresh token has expired or been revoked. Please log in again.');
    }

    const user = storedToken.user;
    if (!user.isActive) {
      throw new UnauthorizedError('User account is inactive');
    }

    // Token rotation: Revoke old token and issue new pair
    const newAccessToken = this.generateAccessToken(user);
    const newRawRefreshToken = this.generateRefreshToken();
    const newTokenHash = this.hashToken(newRawRefreshToken);

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await prisma.$transaction([
      prisma.refreshToken.update({
        where: { id: storedToken.id },
        data: {
          revokedAt: new Date(),
          replacedByToken: newTokenHash,
        },
      }),
      prisma.refreshToken.create({
        data: {
          userId: user.id,
          tokenHash: newTokenHash,
          expiresAt,
        },
      }),
    ]);

    return {
      user: this.sanitizeUser(user),
      accessToken: newAccessToken,
      rawRefreshToken: newRawRefreshToken,
    };
  }

  async logout(rawRefreshToken?: string) {
    if (rawRefreshToken) {
      const tokenHash = this.hashToken(rawRefreshToken);
      await prisma.refreshToken.updateMany({
        where: { tokenHash, revokedAt: null },
        data: { revokedAt: new Date() },
      });
    }
    return { success: true };
  }

  async getCurrentUser(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        studentProfile: true,
        parentProfile: {
          include: {
            studentLinks: {
              where: { isApproved: true },
              include: {
                student: {
                  include: {
                    user: {
                      select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        avatarUrl: true,
                        email: true,
                      },
                    },
                  },
                },
              },
            },
          },
        },
        teacherProfile: true,
        adminProfile: true,
      },
    });

    if (!user) {
      throw new NotFoundError('User not found');
    }

    return this.sanitizeUser(user);
  }
}

export const authService = new AuthService();
