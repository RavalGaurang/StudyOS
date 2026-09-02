import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface UiState {
  sidebarOpen: boolean;
  theme: 'light' | 'dark' | 'system';
  searchModalOpen: boolean;
  pomodoroModalOpen: boolean;
  activePomodoro: {
    isRunning: boolean;
    timeLeft: number; // in seconds
    mode: 'WORK' | 'SHORT_BREAK' | 'LONG_BREAK';
    subjectId: string | null;
    subjectName: string | null;
  };
}

const initialState: UiState = {
  sidebarOpen: true,
  theme: 'light',
  searchModalOpen: false,
  pomodoroModalOpen: false,
  activePomodoro: {
    isRunning: false,
    timeLeft: 25 * 60,
    mode: 'WORK',
    subjectId: null,
    subjectName: null,
  },
};

export const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen;
    },
    setSidebarOpen: (state, action: PayloadAction<boolean>) => {
      state.sidebarOpen = action.payload;
    },
    setTheme: (state, action: PayloadAction<'light' | 'dark' | 'system'>) => {
      state.theme = action.payload;
    },
    setSearchModalOpen: (state, action: PayloadAction<boolean>) => {
      state.searchModalOpen = action.payload;
    },
    setPomodoroModalOpen: (state, action: PayloadAction<boolean>) => {
      state.pomodoroModalOpen = action.payload;
    },
    updatePomodoro: (state, action: PayloadAction<Partial<UiState['activePomodoro']>>) => {
      state.activePomodoro = { ...state.activePomodoro, ...action.payload };
    },
    resetPomodoro: (state, action: PayloadAction<{ mode: 'WORK' | 'SHORT_BREAK' | 'LONG_BREAK'; durationMinutes: number }>) => {
      state.activePomodoro.mode = action.payload.mode;
      state.activePomodoro.timeLeft = action.payload.durationMinutes * 60;
      state.activePomodoro.isRunning = false;
    },
  },
});

export const {
  toggleSidebar,
  setSidebarOpen,
  setTheme,
  setSearchModalOpen,
  setPomodoroModalOpen,
  updatePomodoro,
  resetPomodoro,
} = uiSlice.actions;

export default uiSlice.reducer;
