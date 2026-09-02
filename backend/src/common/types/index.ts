import { Request } from 'express';
import { UserRole } from '@prisma/client';

export interface AuthenticatedUser {
  id: string;
  email: string;
  role: UserRole;
  firstName: string;
  lastName: string;
  profileId?: string; // studentProfile.id, parentProfile.id, etc.
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
      correlationId?: string;
    }
  }
}

export interface PaginationQuery {
  page?: string;
  limit?: string;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}
