'use client';

import React from 'react';
import { Provider } from 'react-redux';
import { store } from '../../store/store';
import { ThemeProvider } from './ThemeProvider';
import { ToastProvider } from '../ui/Toast';

export const ReduxProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <Provider store={store}>
      <ThemeProvider>
        <ToastProvider>{children}</ToastProvider>
      </ThemeProvider>
    </Provider>
  );
};
