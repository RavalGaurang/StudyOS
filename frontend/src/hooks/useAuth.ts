'use client';

import { useEffect, useRef } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { setUser, setLoading, logout } from '../store/slices/authSlice';
import { authService } from '../services/authService';
import { getAccessToken } from '../lib/api/axios';

export function useAuth() {
  const dispatch = useAppDispatch();
  const { user, isAuthenticated, isLoading } = useAppSelector((state) => state.auth);
  const initialized = useRef(false);

  useEffect(() => {
    async function initAuth() {
      const token = getAccessToken();
      if (!token) {
        dispatch(setLoading(false));
        return;
      }

      try {
        const currentUser = await authService.getMe();
        dispatch(setUser(currentUser));
      } catch {
        // If getting user profile fails and cannot refresh, logout gracefully
        dispatch(logout());
      } finally {
        dispatch(setLoading(false));
      }
    }

    if (!initialized.current) {
      initialized.current = true;
      initAuth();
    }
  }, [dispatch]);

  return {
    user,
    isAuthenticated,
    isLoading,
    isStudent: user?.role === 'STUDENT',
    isParent: user?.role === 'PARENT',
    isAdmin: user?.role === 'ADMIN',
    isTeacher: user?.role === 'TEACHER',
  };
}
