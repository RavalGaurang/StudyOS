/**
 * Central API Action Configuration
 * Defines all API endpoint paths across the application in one place.
 * Never hardcode endpoint URLs inside components or services.
 */

export const ACTION_CONFIG = {
  // Authentication Endpoints
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    ME: '/auth/me',
    REFRESH: '/auth/refresh',
    LOGOUT: '/auth/logout',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password',
  },

  // Task Management Endpoints
  TASKS: {
    BASE: '/tasks',
    BY_ID: (id: string) => `/tasks/${id}`,
    TOGGLE: (id: string) => `/tasks/${id}/toggle`,
  },

  // Subjects Endpoints
  SUBJECTS: {
    BASE: '/subjects',
    BY_ID: (id: string) => `/subjects/${id}`,
    UNITS: (subjectId: string) => `/subjects/${subjectId}/units`,
    UNIT_BY_ID: (unitId: string) => `/subjects/units/${unitId}`,
    TOPICS: (unitId: string) => `/subjects/units/${unitId}/topics`,
    TOPIC_BY_ID: (topicId: string) => `/subjects/topics/${topicId}`,
  },

  // Exams Endpoints
  EXAMS: {
    BASE: '/exams',
    BY_ID: (id: string) => `/exams/${id}`,
  },

  // Notes Endpoints
  NOTES: {
    BASE: '/notes',
    BY_ID: (id: string) => `/notes/${id}`,
  },

  // Flashcards Endpoints
  FLASHCARDS: {
    BASE: '/flashcards',
    DECKS: '/flashcards/decks',
    REVIEW: '/flashcards/review',
  },

  // Quizzes Endpoints
  QUIZZES: {
    BASE: '/quizzes',
    BY_ID: (id: string) => `/quizzes/${id}`,
    SUBMIT: (id: string) => `/quizzes/${id}/submit`,
  },

  // Timetable Endpoints
  TIMETABLE: {
    BASE: '/timetable',
    BY_ID: (id: string) => `/timetable/${id}`,
  },

  // Attendance Endpoints
  ATTENDANCE: {
    BASE: '/attendance',
    SUMMARY: '/attendance/summary',
  },

  // Assignments Endpoints
  ASSIGNMENTS: {
    BASE: '/assignments',
    BY_ID: (id: string) => `/assignments/${id}`,
  },

  // AI Assistant Endpoints
  AI: {
    CHAT: '/ai/chat',
    EXPLAIN: '/ai/explain',
    STUDY_PLAN: '/ai/study-plan',
    QUIZ: '/ai/quiz',
  },

  // Analytics Endpoints
  ANALYTICS: {
    OVERVIEW: '/analytics/overview',
    STUDY_TIME: '/analytics/study-time',
    PERFORMANCE: '/analytics/performance',
  },

  // Parent Portal Endpoints
  PARENT: {
    CHILDREN: '/parent/children',
    CHILD_OVERVIEW: (childId: string) => `/parent/children/${childId}/overview`,
  },

  // Admin Portal Endpoints
  ADMIN: {
    STATS: '/admin/stats',
    USERS: '/admin/users',
    USER_ROLE: (userId: string) => `/admin/users/${userId}/role`,
  },
} as const;

// Alias export for intuitive imports
export const API_ENDPOINTS = ACTION_CONFIG;
export default ACTION_CONFIG;
