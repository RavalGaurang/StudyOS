/**
 * Dynamic Common Redux Action for All REST APIs
 * Dispatches API calls dynamically with only mandatory parameters needed.
 * Built with production duplicate-call prevention.
 */

import { createAsyncThunk } from '@reduxjs/toolkit';
import { apiService, getApiErrorMessage } from '@/lib/api/apiService';
import { API_STATUS, HTTP_METHODS, HttpMethod } from '@/enums/app.enum';
import { PaginationMeta } from '@/types/api.types';

export interface DynamicApiPayload<TData = any> {
  // Mandatory: API path/endpoint (e.g. ACTION_CONFIG.TASKS.BASE)
  endpoint: string;
  // Optional: HTTP method (defaults to GET)
  method?: HttpMethod;
  // Optional: Request payload for POST/PUT/PATCH
  data?: TData;
  // Optional: Query parameters
  params?: Record<string, any>;
  // Optional: Module identifier for state categorization (e.g. 'tasks', 'subjects')
  module?: string;
  // Optional: Custom headers
  headers?: Record<string, string>;
  // Optional: If true, forces dispatch even if already pending
  force?: boolean;
}

export interface DynamicApiResponse<T = any> {
  module: string;
  endpoint: string;
  data: T;
  meta?: PaginationMeta;
  message?: string;
}

/**
 * Common Dynamic Action for all REST APIs
 * Usage example:
 *   dispatch(callApiAction({ endpoint: ACTION_CONFIG.TASKS.BASE, module: 'tasks' }))
 *   dispatch(callApiAction({ endpoint: ACTION_CONFIG.TASKS.BASE, method: HTTP_METHODS.POST, data: newTask, module: 'tasks' }))
 */
export const callApiAction = createAsyncThunk<
  DynamicApiResponse,
  DynamicApiPayload,
  { rejectValue: { module: string; endpoint: string; error: string } }
>(
  'api/callDynamicApi',
  async (payload, { rejectWithValue }) => {
    const {
      endpoint,
      method = HTTP_METHODS.GET,
      data,
      params,
      module = endpoint.replace(/^\//, '').split('/')[0] || 'common',
      headers,
    } = payload;

    try {
      const response = await apiService.request({
        endpoint,
        method,
        data,
        params,
        headers,
      });

      return {
        module,
        endpoint,
        data: response.data,
        meta: response.meta,
        message: response.message,
      };
    } catch (error: any) {
      const errorMessage = getApiErrorMessage(error);
      return rejectWithValue({
        module,
        endpoint,
        error: errorMessage,
      });
    }
  },
  {
    // Duplicate Call Prevention: Skips dispatch if module is already PENDING
    condition: (payload, { getState }) => {
      if (payload.force) return true;

      const method = payload.method || HTTP_METHODS.GET;
      if (method === HTTP_METHODS.GET) {
        const state = getState() as any;
        const module =
          payload.module ||
          payload.endpoint.replace(/^\//, '').split('/')[0] ||
          'common';
        const currentStatus = state.api?.modules?.[module]?.status;

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
