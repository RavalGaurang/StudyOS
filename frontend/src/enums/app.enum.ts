/**
 * Global Application Enums
 * Defined in JSON / Object form for easy usage across the whole application.
 * Eliminates static / magic strings.
 */

export const APP_ENUMS = {
  // HTTP Methods for REST API calls
  HTTP_METHODS: {
    GET: 'GET',
    POST: 'POST',
    PUT: 'PUT',
    PATCH: 'PATCH',
    DELETE: 'DELETE',
  },

  // API Call Execution Status
  API_STATUS: {
    IDLE: 'IDLE',
    PENDING: 'PENDING',
    COMPLETED: 'COMPLETED',
    REJECTED: 'REJECTED',
  },

  // Cookie storage keys (High Security)
  COOKIE_KEYS: {
    ACCESS_TOKEN: 'studyos_access_token',
    USER_DATA: 'studyos_user',
    VISITED: 'studyos_visited',
  },

  // LocalStorage keys
  STORAGE_KEYS: {
    ACCESS_TOKEN: 'studyos_access_token',
    USER_DATA: 'studyos_user',
    THEME: 'studyos_theme',
  },

  // User Roles
  USER_ROLES: {
    STUDENT: 'STUDENT',
    PARENT: 'PARENT',
    TEACHER: 'TEACHER',
    ADMIN: 'ADMIN',
  },

  // Application Routes
  APP_ROUTES: {
    HOME: '/',
    LOGIN: '/login',
    REGISTER: '/register',
    FORGOT_PASSWORD: '/forgot-password',
    DASHBOARD: '/dashboard',
    PARENT_DASHBOARD: '/parent/dashboard',
    ADMIN_DASHBOARD: '/admin/dashboard',
  },

  // Content Types
  CONTENT_TYPES: {
    JSON: 'application/json',
    FORM_DATA: 'multipart/form-data',
  },
} as const;

// Convenient Type Exports derived from the JSON Enums
export type HttpMethod = (typeof APP_ENUMS.HTTP_METHODS)[keyof typeof APP_ENUMS.HTTP_METHODS];
export type ApiStatus = (typeof APP_ENUMS.API_STATUS)[keyof typeof APP_ENUMS.API_STATUS];
export type CookieKey = (typeof APP_ENUMS.COOKIE_KEYS)[keyof typeof APP_ENUMS.COOKIE_KEYS];
export type StorageKey = (typeof APP_ENUMS.STORAGE_KEYS)[keyof typeof APP_ENUMS.STORAGE_KEYS];
export type UserRole = (typeof APP_ENUMS.USER_ROLES)[keyof typeof APP_ENUMS.USER_ROLES];
export type AppRoute = (typeof APP_ENUMS.APP_ROUTES)[keyof typeof APP_ENUMS.APP_ROUTES];

// Direct named shortcuts for effortless imports
export const HTTP_METHODS = APP_ENUMS.HTTP_METHODS;
export const API_STATUS = APP_ENUMS.API_STATUS;
export const COOKIE_KEYS = APP_ENUMS.COOKIE_KEYS;
export const STORAGE_KEYS = APP_ENUMS.STORAGE_KEYS;
export const USER_ROLES = APP_ENUMS.USER_ROLES;
export const APP_ROUTES = APP_ENUMS.APP_ROUTES;
