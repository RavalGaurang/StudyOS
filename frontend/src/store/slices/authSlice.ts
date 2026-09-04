/**
 * Authentication Redux Slice
 * Manages user authentication state, session restoration, and secure cookies.
 */

import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { User } from '@/types/auth.types';
import { API_STATUS, ApiStatus, STORAGE_KEYS } from '@/enums/app.enum';
import { authCookies } from '@/utils/cookieUtils';
import { setPending, setCompleted, setRejected } from '../helpers/stateHelper';

export interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  status: ApiStatus;
  error: string | null;
}

const getInitialAuthState = (): AuthState => ({
  user: null,
  accessToken: null,
  isAuthenticated: false,
  isLoading: true,
  status: API_STATUS.IDLE,
  error: null,
});

export const authSlice = createSlice({
  name: 'auth',
  initialState: getInitialAuthState(),
  reducers: {
    // Hydrates session on client mount to guarantee 100% SSR hydration consistency
    hydrateAuth: (state) => {
      if (typeof window !== 'undefined') {
        try {
          const cookieToken = authCookies.getToken();
          const storedUser = localStorage.getItem(STORAGE_KEYS.USER_DATA);

          if (cookieToken && storedUser) {
            state.user = JSON.parse(storedUser);
            state.accessToken = cookieToken;
            state.isAuthenticated = true;
            state.status = API_STATUS.COMPLETED;
          }
        } catch {
          // Graceful fallback on JSON parse error
        } finally {
          state.isLoading = false;
        }
      }
    },

    // Starts authentication request
    authPending: (state) => {
      setPending(state);
      state.isLoading = true;
    },

    // Successful login or registration
    setCredentials: (
      state,
      action: PayloadAction<{ user: User; accessToken: string }>
    ) => {
      const { user, accessToken } = action.payload;
      setCompleted(state);
      state.user = user;
      state.accessToken = accessToken;
      state.isAuthenticated = true;
      state.isLoading = false;

      // Persist in secure cookies and storage
      authCookies.setToken(accessToken);
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(user));
        localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, accessToken);
      }
    },

    // Updates user profile
    setUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
      state.isAuthenticated = true;
      state.isLoading = false;
      state.status = API_STATUS.COMPLETED;

      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(action.payload));
      }
    },

    // Sets loading state
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
      state.status = action.payload ? API_STATUS.PENDING : API_STATUS.IDLE;
    },

    // Sets authentication error
    setError: (state, action: PayloadAction<string | null>) => {
      if (action.payload) {
        setRejected(state, action.payload);
      } else {
        state.error = null;
        state.status = API_STATUS.IDLE;
      }
      state.isLoading = false;
    },

    // Logout and purge credentials
    logout: (state) => {
      state.user = null;
      state.accessToken = null;
      state.isAuthenticated = false;
      state.isLoading = false;
      state.status = API_STATUS.IDLE;
      state.error = null;

      // Purge from cookies and storage
      authCookies.clearToken();
      if (typeof window !== 'undefined') {
        localStorage.removeItem(STORAGE_KEYS.USER_DATA);
        localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
      }
    },
  },
});

export const {
  hydrateAuth,
  authPending,
  setCredentials,
  setUser,
  setLoading,
  setError,
  logout,
} = authSlice.actions;

export default authSlice.reducer;
