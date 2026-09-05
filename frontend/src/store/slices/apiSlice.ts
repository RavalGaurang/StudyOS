/**
 * Unified Reducer for All API Calls & Secure State Management
 * Dynamically tracks request data, status (PENDING, COMPLETED, REJECTED), errors,
 * sub-keys, granular action spinners, and secure authentication session lifecycle.
 */

import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import {
  callApiAction,
  DynamicApiResponse,
  getModuleStorageKey,
} from '../actions/apiAction';
import {
  AsyncState,
  createInitialAsyncState,
  setPending,
  setCompleted,
  setRejected,
} from '../helpers/stateHelper';
import { PaginationMeta } from '@/types/api.types';
import { API_STATUS, ApiStatus, STORAGE_KEYS } from '@/enums/app.enum';
import { User } from '@/types/auth.types';
import { authCookies } from '@/utils/cookieUtils';

export interface ModuleApiState<T = any> extends AsyncState<T> {
  endpoint?: string;
  meta?: PaginationMeta;
  lastUpdated?: number;
}

export interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  status: ApiStatus;
  error: string | null;
}

export interface ApiRootState {
  modules: Record<string, ModuleApiState>;
  actionLoading: Record<string, boolean>;
  auth: AuthState;
}

const getInitialAuthState = (): AuthState => ({
  user: null,
  accessToken: null,
  isAuthenticated: false,
  isLoading: true,
  status: API_STATUS.IDLE,
  error: null,
});

const initialState: ApiRootState = {
  modules: {},
  actionLoading: {},
  auth: getInitialAuthState(),
};

export const apiSlice = createSlice({
  name: 'api',
  initialState,
  reducers: {
    // Manually clear specific module data & status
    clearModuleState: (
      state,
      action: PayloadAction<{ module: string; subKey?: string } | string>
    ) => {
      const storageKey =
        typeof action.payload === 'string'
          ? action.payload
          : getModuleStorageKey(action.payload.module, action.payload.subKey);
      delete state.modules[storageKey];
    },

    // Reset all API states and action loadings
    resetAllApiStates: (state) => {
      state.modules = {};
      state.actionLoading = {};
    },

    // Hydrate authentication session from cookies & localStorage on client mount
    hydrateAuth: (state) => {
      if (state.auth.isAuthenticated && state.auth.user) {
        state.auth.isLoading = false;
        return;
      }

      if (typeof window !== 'undefined') {
        try {
          const cookieToken = authCookies.getToken();
          const storedUser = localStorage.getItem(STORAGE_KEYS.USER_DATA);

          if (cookieToken && storedUser) {
            state.auth.user = JSON.parse(storedUser);
            state.auth.accessToken = cookieToken;
            state.auth.isAuthenticated = true;
            state.auth.status = API_STATUS.COMPLETED;
          }
        } catch {
          // Graceful fallback on JSON parse error
        } finally {
          state.auth.isLoading = false;
        }
      }
    },

    // Sets authenticated user credentials and stores token in secure cookies & localStorage
    setCredentials: (
      state,
      action: PayloadAction<{ user: User; accessToken: string }>
    ) => {
      const { user, accessToken } = action.payload;
      state.auth.user = user;
      state.auth.accessToken = accessToken;
      state.auth.isAuthenticated = true;
      state.auth.isLoading = false;
      state.auth.status = API_STATUS.COMPLETED;
      state.auth.error = null;

      authCookies.setToken(accessToken);
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(user));
        localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, accessToken);
      }
    },

    // Updates user profile
    setUser: (state, action: PayloadAction<User>) => {
      state.auth.user = action.payload;
      state.auth.isAuthenticated = true;
      state.auth.isLoading = false;
      state.auth.status = API_STATUS.COMPLETED;

      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(action.payload));
      }
    },

    // Sets auth loading
    setAuthLoading: (state, action: PayloadAction<boolean>) => {
      state.auth.isLoading = action.payload;
      state.auth.status = action.payload ? API_STATUS.PENDING : API_STATUS.IDLE;
    },

    // Sets auth error
    setAuthError: (state, action: PayloadAction<string | null>) => {
      state.auth.error = action.payload;
      state.auth.status = action.payload ? API_STATUS.REJECTED : API_STATUS.IDLE;
      state.auth.isLoading = false;
    },

    // Comprehensive Secure Logout:
    // Purges cookies, clears localStorage, resets auth, and completely wipes all cached module states
    secureLogout: (state) => {
      state.auth = {
        ...getInitialAuthState(),
        isLoading: false,
      };
      state.modules = {};
      state.actionLoading = {};

      authCookies.clearToken();
      if (typeof window !== 'undefined') {
        localStorage.removeItem(STORAGE_KEYS.USER_DATA);
        localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
      }
    },

    // Manual action loading setter
    setActionLoading: (
      state,
      action: PayloadAction<{ key: string; loading: boolean }>
    ) => {
      if (action.payload.loading) {
        state.actionLoading[action.payload.key] = true;
      } else {
        delete state.actionLoading[action.payload.key];
      }
    },

    // Helper to optimistically update an item in a cached list
    updateItemInList: (
      state,
      action: PayloadAction<{
        module: string;
        subKey?: string;
        id: string;
        idKey?: string;
        changes: Record<string, any>;
      }>
    ) => {
      const storageKey = getModuleStorageKey(action.payload.module, action.payload.subKey);
      const data = state.modules[storageKey]?.data;
      const idKey = action.payload.idKey || 'id';
      if (Array.isArray(data)) {
        const item = data.find((x: any) => x && x[idKey] === action.payload.id);
        if (item) {
          Object.assign(item, action.payload.changes);
        }
      }
    },

    // Helper to optimistically remove an item from a cached list
    removeItemFromList: (
      state,
      action: PayloadAction<{
        module: string;
        subKey?: string;
        id: string;
        idKey?: string;
      }>
    ) => {
      const storageKey = getModuleStorageKey(action.payload.module, action.payload.subKey);
      const data = state.modules[storageKey]?.data;
      const idKey = action.payload.idKey || 'id';
      if (Array.isArray(data)) {
        state.modules[storageKey].data = data.filter(
          (x: any) => x && x[idKey] !== action.payload.id
        );
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // 1. PENDING State Case
      .addCase(callApiAction.pending, (state, action) => {
        const {
          endpoint,
          module = endpoint.replace(/^\//, '').split('/')[0] || 'common',
          subKey,
          actionKey,
        } = action.meta.arg;

        const storageKey = getModuleStorageKey(module, subKey);

        if (!state.modules[storageKey]) {
          state.modules[storageKey] = createInitialAsyncState();
        }

        setPending(state.modules[storageKey]);
        state.modules[storageKey].endpoint = endpoint;

        if (actionKey) {
          state.actionLoading[actionKey] = true;
        }
      })

      // 2. COMPLETED State Case
      .addCase(
        callApiAction.fulfilled,
        (state, action: PayloadAction<DynamicApiResponse>) => {
          const { module, subKey, actionKey, data, meta, endpoint } =
            action.payload;
          const storageKey = getModuleStorageKey(module, subKey);

          if (!state.modules[storageKey]) {
            state.modules[storageKey] = createInitialAsyncState();
          }

          setCompleted(state.modules[storageKey], data);
          state.modules[storageKey].endpoint = endpoint;
          state.modules[storageKey].meta = meta;
          state.modules[storageKey].lastUpdated = Date.now();

          if (actionKey) {
            delete state.actionLoading[actionKey];
          }
        }
      )

      // 3. REJECTED State Case
      .addCase(callApiAction.rejected, (state, action) => {
        const {
          endpoint,
          module = endpoint.replace(/^\//, '').split('/')[0] || 'common',
          subKey,
          actionKey,
        } = action.meta.arg;

        const storageKey = getModuleStorageKey(module, subKey);

        if (!state.modules[storageKey]) {
          state.modules[storageKey] = createInitialAsyncState();
        }

        const errorMessage =
          action.payload?.error ||
          action.error.message ||
          'An error occurred during API request';

        setRejected(state.modules[storageKey], errorMessage);
        state.modules[storageKey].endpoint =
          action.payload?.endpoint || endpoint;
        state.modules[storageKey].lastUpdated = Date.now();

        if (actionKey) {
          delete state.actionLoading[actionKey];
        }
      });
  },
});

export const {
  clearModuleState,
  resetAllApiStates,
  hydrateAuth,
  setCredentials,
  setUser,
  setAuthLoading,
  setAuthError,
  secureLogout,
  setActionLoading,
  updateItemInList,
  removeItemFromList,
} = apiSlice.actions;

// Backward-compatibility alias
export const logout = secureLogout;

// Selectors
export const selectApiModule = (
  state: { api: ApiRootState },
  module: string,
  subKey?: string
): ModuleApiState => {
  const key = getModuleStorageKey(module, subKey);
  return state.api.modules[key] || createInitialAsyncState();
};

export const selectApiData = <T = any>(
  state: { api: ApiRootState },
  module: string,
  subKey?: string
): T | null => {
  const key = getModuleStorageKey(module, subKey);
  return (state.api.modules[key]?.data as T) || null;
};

export const selectApiMeta = (
  state: { api: ApiRootState },
  module: string,
  subKey?: string
): PaginationMeta | undefined => {
  const key = getModuleStorageKey(module, subKey);
  return state.api.modules[key]?.meta;
};

export const selectApiStatus = (
  state: { api: ApiRootState },
  module: string,
  subKey?: string
): ApiStatus => {
  const key = getModuleStorageKey(module, subKey);
  return state.api.modules[key]?.status || API_STATUS.IDLE;
};

export const selectApiIsLoading = (
  state: { api: ApiRootState },
  module: string,
  subKey?: string
): boolean => {
  const key = getModuleStorageKey(module, subKey);
  return state.api.modules[key]?.status === API_STATUS.PENDING;
};

export const selectApiError = (
  state: { api: ApiRootState },
  module: string,
  subKey?: string
): string | null => {
  const key = getModuleStorageKey(module, subKey);
  return state.api.modules[key]?.error || null;
};

export const selectActionLoading = (
  state: { api: ApiRootState },
  actionKey: string
): boolean => {
  return Boolean(state.api.actionLoading?.[actionKey]);
};

// Auth Selectors
export const selectAuth = (state: { api: ApiRootState }): AuthState =>
  state.api.auth;
export const selectAuthUser = (state: { api: ApiRootState }): User | null =>
  state.api.auth?.user || null;
export const selectIsAuthenticated = (state: { api: ApiRootState }): boolean =>
  Boolean(state.api.auth?.isAuthenticated);
export const selectAuthLoading = (state: { api: ApiRootState }): boolean =>
  Boolean(state.api.auth?.isLoading);
export const selectAuthError = (state: { api: ApiRootState }): string | null =>
  state.api.auth?.error || null;

export default apiSlice.reducer;
