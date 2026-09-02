export type UserRole = 'STUDENT' | 'PARENT' | 'TEACHER' | 'ADMIN';

export interface StudentProfile {
  id: string;
  userId: string;
  gradeLevel?: string;
  targetGpa?: number;
  schoolName?: string;
  bio?: string;
}

export interface ParentProfile {
  id: string;
  userId: string;
  phoneNumber?: string;
  studentLinks?: {
    id: string;
    studentId: string;
    relationship: string;
    student: {
      user: {
        firstName: string;
        lastName: string;
        email: string;
        avatarUrl?: string;
      };
    };
  }[];
}

export interface User {
  id: string;
  email: string;
  role: UserRole;
  firstName: string;
  lastName: string;
  avatarUrl?: string;
  isActive: boolean;
  isEmailVerified: boolean;
  profileId?: string;
  profile?: StudentProfile | ParentProfile | any;
  createdAt?: string;
}

export interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}
