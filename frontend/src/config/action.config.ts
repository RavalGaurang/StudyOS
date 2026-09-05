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
    DECKS: '/quizzes/flashcards/decks',
    DECK_BY_ID: (id: string) => `/quizzes/flashcards/decks/${id}`,
    CARD_BY_ID: (id: string) => `/quizzes/flashcards/cards/${id}`,
    REVIEW: (id: string) => `/quizzes/flashcards/cards/${id}/review`,
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
    BY_ID: (id: string) => `/attendance/${id}`,
    SUMMARY: '/attendance/summary',
  },

  // Assignments Endpoints
  ASSIGNMENTS: {
    BASE: '/assignments',
    BY_ID: (id: string) => `/assignments/${id}`,
  },

  // Study & Goals Endpoints
  STUDY: {
    SESSIONS: '/study/sessions',
    SESSION_BY_ID: (id: string) => `/study/sessions/${id}`,
    PLANS: '/study/plans',
    PLAN_BY_ID: (id: string) => `/study/plans/${id}`,
    GOALS: '/study/goals',
    GOAL_BY_ID: (id: string) => `/study/goals/${id}`,
  },

  // Notifications Endpoints
  NOTIFICATIONS: {
    BASE: '/notifications',
    BY_ID: (id: string) => `/notifications/${id}`,
    READ: (id: string) => `/notifications/${id}/read`,
    READ_ALL: '/notifications/read-all',
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

  // User Management Endpoints
  USERS: {
    BASE: '/users',
    BY_ID: (id: string) => `/users/${id}`,
    STATUS: (id: string) => `/users/${id}/status`,
  },
} as const;

// Alias export for intuitive imports
export const API_ENDPOINTS = ACTION_CONFIG;
export default ACTION_CONFIG;
