export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
export type AssignmentStatus = 'PENDING' | 'IN_PROGRESS' | 'SUBMITTED' | 'GRADED';
export type AttendanceStatus = 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED';

export interface SubjectSummary {
  id: string;
  name: string;
  code?: string;
  color: string;
  icon: string;
}

export interface Topic {
  id: string;
  unitId: string;
  title: string;
  orderIndex: number;
  isCompleted: boolean;
  completedAt?: string;
}

export interface Unit {
  id: string;
  subjectId: string;
  title: string;
  orderIndex: number;
  description?: string;
  topics: Topic[];
}

export interface Subject {
  id: string;
  studentId: string;
  name: string;
  code?: string;
  color: string;
  icon: string;
  targetGrade?: string;
  creditHours?: number;
  isArchived: boolean;
  units: Unit[];
  totalUnits?: number;
  totalTopics?: number;
  completedTopics?: number;
  syllabusProgress?: number;
  createdAt: string;
}

export interface Task {
  id: string;
  studentId: string;
  subjectId?: string | null;
  title: string;
  description?: string | null;
  dueDate?: string | null;
  priority: TaskPriority;
  status: TaskStatus;
  completedAt?: string | null;
  subject?: SubjectSummary | null;
  createdAt: string;
}

export interface Assignment {
  id: string;
  studentId: string;
  subjectId: string;
  title: string;
  description?: string | null;
  dueDate: string;
  status: AssignmentStatus;
  maxMarks?: number;
  obtainedMarks?: number | null;
  submissionNotes?: string | null;
  subject?: SubjectSummary;
  createdAt: string;
}

export interface Exam {
  id: string;
  studentId: string;
  subjectId: string;
  title: string;
  examDate: string;
  durationMinutes?: number;
  maxMarks?: number;
  obtainedMarks?: number | null;
  weightagePercent?: number | null;
  roomLocation?: string | null;
  notes?: string | null;
  subject?: SubjectSummary;
  createdAt: string;
}

export interface AttendanceRecord {
  id: string;
  studentId: string;
  subjectId: string;
  date: string;
  status: AttendanceStatus;
  notes?: string | null;
  subject?: SubjectSummary;
}

export interface TimetableEvent {
  id: string;
  studentId: string;
  subjectId?: string | null;
  title: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  room?: string | null;
  location?: string | null;
  color?: string | null;
  recurrence?: string | null;
  subject?: SubjectSummary | null;
}
