/**
 * Unified Reducer for All API Calls
 * Dynamically tracks request data, status (PENDING, COMPLETED, REJECTED), and errors per module.
 */

import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { callApiAction, DynamicApiResponse } from '../actions/apiAction';
import {
  AsyncState,
  createInitialAsyncState,
  setPending,
  setCompleted,
  setRejected,
} from '../helpers/stateHelper';
import { PaginationMeta } from '@/types/api.types';
import { API_STATUS } from '@/enums/app.enum';

export interface ModuleApiState<T = any> extends AsyncState<T> {
  endpoint?: string;
  meta?: PaginationMeta;
  lastUpdated?: number;
}

export interface ApiRootState {
  modules: Record<string, ModuleApiState>;
}

const initialState: ApiRootState = {
  modules: {},
};

export const apiSlice = createSlice({
  name: 'api',
  initialState,
  reducers: {
    // Manually clear specific module data & status
    clearModuleState: (state, action: PayloadAction<string>) => {
      delete state.modules[action.payload];
    },
    // Reset all API states
    resetAllApiStates: (state) => {
      state.modules = {};
    },
  },
  extraReducers: (builder) => {
    builder
      // 1. PENDING State Case
      .addCase(callApiAction.pending, (state, action) => {
        const module =
          action.meta.arg.module ||
          action.meta.arg.endpoint.replace(/^\//, '').split('/')[0] ||
          'common';

        if (!state.modules[module]) {
          state.modules[module] = createInitialAsyncState();
        }

        setPending(state.modules[module]);
        state.modules[module].endpoint = action.meta.arg.endpoint;
      })

      // 2. COMPLETED State Case
      .addCase(callApiAction.fulfilled, (state, action: PayloadAction<DynamicApiResponse>) => {
        const { module, data, meta, endpoint } = action.payload;

        if (!state.modules[module]) {
          state.modules[module] = createInitialAsyncState();
        }

        setCompleted(state.modules[module], data);
        state.modules[module].endpoint = endpoint;
        state.modules[module].meta = meta;
        state.modules[module].lastUpdated = Date.now();
      })

      // 3. REJECTED State Case
      .addCase(callApiAction.rejected, (state, action) => {
        const module =
          action.payload?.module ||
          action.meta.arg.module ||
          action.meta.arg.endpoint.replace(/^\//, '').split('/')[0] ||
          'common';

        if (!state.modules[module]) {
          state.modules[module] = createInitialAsyncState();
        }

        const errorMessage =
          action.payload?.error || action.error.message || 'An error occurred during API request';

        setRejected(state.modules[module], errorMessage);
        state.modules[module].endpoint = action.payload?.endpoint || action.meta.arg.endpoint;
        state.modules[module].lastUpdated = Date.now();
      });
  },
});

export const { clearModuleState, resetAllApiStates } = apiSlice.actions;

// Reusable Selectors for any component
export const selectApiModule = (state: { api: ApiRootState }, module: string) =>
  state.api.modules[module] || createInitialAsyncState();

export const selectApiData = <T = any>(state: { api: ApiRootState }, module: string): T | null =>
  (state.api.modules[module]?.data as T) || null;

export const selectApiStatus = (state: { api: ApiRootState }, module: string) =>
  state.api.modules[module]?.status || API_STATUS.IDLE;

export const selectApiIsLoading = (state: { api: ApiRootState }, module: string): boolean =>
  state.api.modules[module]?.status === API_STATUS.PENDING;

export const selectApiError = (state: { api: ApiRootState }, module: string): string | null =>
  state.api.modules[module]?.error || null;

export default apiSlice.reducer;
