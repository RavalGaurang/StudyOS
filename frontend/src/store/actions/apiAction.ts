/**
 * Dynamic Common Redux Action for All REST APIs
 * Dispatches API calls dynamically with only mandatory parameters needed.
 * Built with production duplicate-call prevention, sub-key collision avoidance,
 * granular action loading, and sensitive field sanitization.
 */

import { createAsyncThunk } from '@reduxjs/toolkit';
import { apiService, getApiErrorMessage } from '@/lib/api/apiService';
import { API_STATUS, HTTP_METHODS, HttpMethod } from '@/enums/app.enum';
import { PaginationMeta } from '@/types/api.types';
import { toast } from '@/hooks/useToast';

export interface DynamicApiPayload<TData = any> {
  // Mandatory: API path/endpoint (e.g. ACTION_CONFIG.TASKS.BASE)
  endpoint: string;
  // Optional: HTTP method (defaults to GET)
  method?: HttpMethod;
  // Optional: Request payload for POST/PUT/PATCH
  data?: TData;
  // Optional: Query parameters
  params?: Record<string, any>;
  // Optional: Module identifier for state categorization (e.g. 'tasks', 'users')
  module?: string;
  // Optional: Sub-key for namespacing within a module (e.g. 'list', 'detail', 'stats')
  subKey?: string;
  // Optional: Unique action key for granular spinner tracking (e.g. 'status-toggle-123')
  actionKey?: string;
  // Optional: Custom headers
  headers?: Record<string, string>;
  // Optional: If true, forces dispatch even if already pending
  force?: boolean;
  // Optional: Toast notification configuration
  showToast?: boolean | { success?: string; error?: string | boolean };
}

export interface DynamicApiResponse<T = any> {
  module: string;
  subKey?: string;
  actionKey?: string;
  endpoint: string;
  data: T;
  meta?: PaginationMeta;
  message?: string;
}

const SENSITIVE_KEYS = new Set([
  'password',
  'confirmPassword',
  'oldPassword',
  'newPassword',
  'creditCard',
  'cvv',
  'token',
]);

/**
 * Sanitizes sensitive fields from any object to prevent leaking secrets in state logs
 */
export function sanitizePayload<T = any>(data: T): T {
  if (!data || typeof data !== 'object') return data;
  if (Array.isArray(data)) return data.map(sanitizePayload) as unknown as T;

  const sanitized: Record<string, any> = {};
  for (const [key, value] of Object.entries(data as Record<string, any>)) {
    if (SENSITIVE_KEYS.has(key)) {
      sanitized[key] = '***REDACTED***';
    } else if (typeof value === 'object' && value !== null) {
      sanitized[key] = sanitizePayload(value);
    } else {
      sanitized[key] = value;
    }
  }
  return sanitized as T;
}

/**
 * Helper to compute standardized module storage key
 */
export function getModuleStorageKey(module: string, subKey?: string): string {
  return subKey ? `${module}/${subKey}` : module;
}

/**
 * Common Dynamic Action for all REST APIs
 * Usage examples:
 *   dispatch(callApiAction({ endpoint: ACTION_CONFIG.TASKS.BASE, module: 'tasks' }))
 *   dispatch(callApiAction({ endpoint: ACTION_CONFIG.USERS.BASE, module: 'users', subKey: 'list' }))
 *   dispatch(callApiAction({ endpoint: ACTION_CONFIG.USERS.STATUS(id), method: HTTP_METHODS.PATCH, actionKey: `status-${id}` }))
 */
export const callApiAction = createAsyncThunk<
  DynamicApiResponse,
  DynamicApiPayload,
  {
    rejectValue: {
      module: string;
      subKey?: string;
      actionKey?: string;
      endpoint: string;
      error: string;
    };
  }
>(
  'api/callDynamicApi',
  async (payload, { rejectWithValue }) => {
    const {
      endpoint,
      method = HTTP_METHODS.GET,
      data,
      params,
      module = endpoint.replace(/^\//, '').split('/')[0] || 'common',
      subKey,
      actionKey,
      headers,
      showToast,
    } = payload;

    try {
      const response = await apiService.request({
        endpoint,
        method,
        data,
        params,
        headers,
      });

      if (showToast) {
        const successMsg =
          typeof showToast === 'object' && showToast.success
            ? showToast.success
            : response.message || 'Operation completed successfully';
        toast.success(successMsg);
      }

      return {
        module,
        subKey,
        actionKey,
        endpoint,
        data: response.data,
        meta: response.meta || (response as any)?.pagination,
        message: response.message,
      };
    } catch (error: any) {
      const errorMessage = getApiErrorMessage(error);

      if (showToast === true || (typeof showToast === 'object' && showToast.error !== false)) {
        const customError =
          typeof showToast === 'object' && typeof showToast.error === 'string'
            ? showToast.error
            : errorMessage;
        toast.error(customError);
      }

      return rejectWithValue({
        module,
        subKey,
        actionKey,
        endpoint,
        error: errorMessage,
      });
    }
  },
  {
    // Duplicate Call Prevention: Skips dispatch if module/subKey or actionKey is already pending
    condition: (payload, { getState }) => {
      if (payload.force) return true;

      const state = getState() as any;

      // Check actionKey lock if specified
      if (payload.actionKey && state.api?.actionLoading?.[payload.actionKey]) {
        return false;
      }

      // Check GET module status
      const method = payload.method || HTTP_METHODS.GET;
      if (method === HTTP_METHODS.GET) {
        const module =
          payload.module ||
          payload.endpoint.replace(/^\//, '').split('/')[0] ||
          'common';
        const storageKey = getModuleStorageKey(module, payload.subKey);
        const currentStatus = state.api?.modules?.[storageKey]?.status;

        if (currentStatus === API_STATUS.PENDING) {
          // Drops duplicate call automatically
          return false;
        }
      }
      return true;
    },
  }
);

// Shorter alias for rapid imports
export const callApi = callApiAction;
