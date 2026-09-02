import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.config';
import { UnauthorizedError } from '../common/errors/AppError';
import { AuthenticatedUser } from '../common/types';
import { prisma } from '../config/database';

interface JwtPayload {
  userId: string;
  email: string;
  role: any;
  iat: number;
  exp: number;
}

export async function authenticate(req: Request, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedError('Authentication token missing or invalid');
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      throw new UnauthorizedError('Authentication token missing');
    }

    let decoded: JwtPayload;
    try {
      decoded = jwt.verify(token, env.JWT_ACCESS_SECRET) as JwtPayload;
    } catch (err: any) {
      if (err.name === 'TokenExpiredError') {
        throw new UnauthorizedError('Authentication token expired');
      }
      throw new UnauthorizedError('Invalid authentication token');
    }

    // Verify user still exists and is active
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: {
        studentProfile: { select: { id: true } },
        parentProfile: { select: { id: true } },
        teacherProfile: { select: { id: true } },
        adminProfile: { select: { id: true } },
      },
    });

    if (!user || !user.isActive) {
      throw new UnauthorizedError('User account is inactive or no longer exists');
    }

    let profileId: string | undefined;
    if (user.studentProfile) profileId = user.studentProfile.id;
    else if (user.parentProfile) profileId = user.parentProfile.id;
    else if (user.teacherProfile) profileId = user.teacherProfile.id;
    else if (user.adminProfile) profileId = user.adminProfile.id;

    req.user = {
      id: user.id,
      email: user.email,
      role: user.role,
      firstName: user.firstName,
      lastName: user.lastName,
      profileId,
    };

    next();
  } catch (error) {
    next(error);
  }
}
