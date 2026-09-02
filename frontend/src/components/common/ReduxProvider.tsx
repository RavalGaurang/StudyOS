'use client';

import React from 'react';
import { Provider } from 'react-redux';
import { store } from '../../store/store';
import { ThemeProvider } from './ThemeProvider';

export const ReduxProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <Provider store={store}>
      <ThemeProvider>{children}</ThemeProvider>
    </Provider>
  );
};
