import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AuthState, User } from '../../types/auth.types';

const getInitialState = (): AuthState => {
  if (typeof window !== 'undefined') {
    try {
      const storedUser = localStorage.getItem('studyos_user');
      const storedToken = localStorage.getItem('studyos_access_token');
      if (storedUser && storedToken) {
        return {
          user: JSON.parse(storedUser),
          accessToken: storedToken,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        };
      }
    } catch {
      // Fallback on parse error
    }
  }
  return {
    user: null,
    accessToken: null,
    isAuthenticated: false,
    isLoading: true,
    error: null,
  };
};

export const authSlice = createSlice({
  name: 'auth',
  initialState: getInitialState(),
  reducers: {
    setCredentials: (
      state,
      action: PayloadAction<{ user: User; accessToken: string }>
    ) => {
      state.user = action.payload.user;
      state.accessToken = action.payload.accessToken;
      state.isAuthenticated = true;
      state.isLoading = false;
      state.error = null;
      if (typeof window !== 'undefined') {
        localStorage.setItem('studyos_user', JSON.stringify(action.payload.user));
        localStorage.setItem('studyos_access_token', action.payload.accessToken);
      }
    },
    setUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
      state.isAuthenticated = true;
      state.isLoading = false;
      if (typeof window !== 'undefined') {
        localStorage.setItem('studyos_user', JSON.stringify(action.payload));
      }
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
      state.isLoading = false;
    },
    logout: (state) => {
      state.user = null;
      state.accessToken = null;
      state.isAuthenticated = false;
      state.isLoading = false;
      state.error = null;
      if (typeof window !== 'undefined') {
        localStorage.removeItem('studyos_user');
        localStorage.removeItem('studyos_access_token');
      }
    },
  },
});

export const { setCredentials, setUser, setLoading, setError, logout } = authSlice.actions;
export default authSlice.reducer;
