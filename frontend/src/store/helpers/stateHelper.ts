/**
 * Reusable Redux State Helpers
 * Universal functions to handle state pending, completed, rejected, and check statuses.
 */

import { API_STATUS, ApiStatus } from '@/enums/app.enum';

/**
 * Base status interface with status and optional error
 */
export interface BaseStatusState {
  status: ApiStatus;
  error?: string | null;
}

/**
 * Standard interface for asynchronous API state containing data
 */
export interface AsyncState<T = any> extends BaseStatusState {
  data: T | null;
  error: string | null;
}

/**
 * Creates a standard initial async state
 */
export const createInitialAsyncState = <T = any>(
  initialData: T | null = null
): AsyncState<T> => ({
  data: initialData,
  status: API_STATUS.IDLE,
  error: null,
});

/**
 * Reusable function to set state to PENDING
 */
export const setPending = (state: BaseStatusState): void => {
  state.status = API_STATUS.PENDING;
  state.error = null;
};

/**
 * Reusable function to set state to COMPLETED
 */
export const setCompleted = <T>(
  state: BaseStatusState & { data?: T | null },
  data?: T
): void => {
  state.status = API_STATUS.COMPLETED;
  if (data !== undefined && 'data' in state) {
    state.data = data;
  }
  state.error = null;
};

/**
 * Reusable function to set state to REJECTED
 */
export const setRejected = (
  state: BaseStatusState,
  error: string
): void => {
  state.status = API_STATUS.REJECTED;
  state.error = error;
};

/**
 * Status check helper functions for clean UI usage
 */
export const isIdle = (status?: ApiStatus | string | null): boolean =>
  status === API_STATUS.IDLE;

export const isPending = (status?: ApiStatus | string | null): boolean =>
  status === API_STATUS.PENDING;

export const isCompleted = (status?: ApiStatus | string | null): boolean =>
  status === API_STATUS.COMPLETED;

export const isRejected = (status?: ApiStatus | string | null): boolean =>
  status === API_STATUS.REJECTED;
