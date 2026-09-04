import { UserRole } from '@/enums/app.enum';
import { PaginationMeta } from './api.types';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  mobile: string | null;
  role: UserRole;
  isActive: boolean;
  avatarUrl?: string | null;
  isEmailVerified?: boolean;
  createdAt?: string;
  updatedAt?: string;
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

export interface CreateUserPayload {
  firstName: string;
  lastName: string;
  email: string;
  mobile?: string;
  password: string;
  role: UserRole;
  isActive?: boolean;
}

export interface UpdateUserPayload {
  firstName?: string;
  lastName?: string;
  email?: string;
  mobile?: string;
  role?: UserRole;
  isActive?: boolean;
}

export interface UpdateUserStatusPayload {
  isActive: boolean;
}

export interface UserListParams {
  page?: number | string;
  limit?: number | string;
  search?: string;
  role?: UserRole | string;
  isActive?: boolean | string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface UserListResponse {
  users: User[];
  meta: PaginationMeta;
  pagination?: PaginationMeta;
}
