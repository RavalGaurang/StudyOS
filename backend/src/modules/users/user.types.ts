import { UserRole } from '@prisma/client';

export interface UserResponseDto {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  mobile: string | null;
  role: UserRole;
  isActive: boolean;
  avatarUrl?: string | null;
  isEmailVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
  studentProfile?: {
    id: string;
    gradeLevel?: string | null;
    schoolName?: string | null;
  } | null;
  parentProfile?: {
    id: string;
    phoneNumber?: string | null;
  } | null;
  teacherProfile?: {
    id: string;
    department?: string | null;
  } | null;
  adminProfile?: {
    id: string;
  } | null;
}

export interface CreateUserInput {
  firstName: string;
  lastName: string;
  email: string;
  mobile?: string;
  password: string;
  role?: UserRole;
  isActive?: boolean;
}

export interface UpdateUserInput {
  firstName?: string;
  lastName?: string;
  email?: string;
  mobile?: string;
  role?: UserRole;
  isActive?: boolean;
}

export interface UpdateUserStatusInput {
  isActive: boolean;
}

export interface UserQueryInput {
  page?: string;
  limit?: string;
  search?: string;
  role?: UserRole;
  isActive?: 'true' | 'false';
  sortBy?: 'createdAt' | 'email' | 'firstName' | 'lastName' | 'role';
  sortOrder?: 'asc' | 'desc';
}
