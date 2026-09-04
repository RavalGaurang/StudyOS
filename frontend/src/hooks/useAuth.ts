'use client';

import { useEffect, useRef } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { setUser, setLoading, logout } from '../store/slices/authSlice';
import { authService } from '../services/authService';
import { getAccessToken } from '../lib/api/axios';
import { USER_ROLES } from '@/enums/app.enum';
import { User } from '@/types/auth.types';

// Module-level in-flight promise to prevent concurrent calls across multiple useAuth instances
let inFlightMePromise: Promise<User> | null = null;

/**
 * useAuth Hook
 * Synchronizes authentication status with secure cookies and Redux store.
 * Guaranteed to never execute duplicate API calls in production.
 */
export function useAuth() {
  const dispatch = useAppDispatch();
  const { user, isAuthenticated, isLoading, status } = useAppSelector((state) => state.auth);
  const initialized = useRef(false);

  useEffect(() => {
    // If user is already loaded and authenticated, avoid duplicate network calls
    if (user && isAuthenticated) {
      dispatch(setLoading(false));
      return;
    }

    const token = getAccessToken();
    if (!token) {
      dispatch(setLoading(false));
      return;
    }

    if (initialized.current) {
      return;
    }
    initialized.current = true;

    async function initAuth() {
      try {
        if (!inFlightMePromise) {
          inFlightMePromise = authService.getMe().finally(() => {
            inFlightMePromise = null;
          });
        }
        const currentUser = await inFlightMePromise;
        dispatch(setUser(currentUser));
      } catch {
        // If getting user profile fails and cannot refresh, logout gracefully
        dispatch(logout());
      } finally {
        dispatch(setLoading(false));
      }
    }

    initAuth();
  }, [dispatch, user, isAuthenticated]);

  return {
    user,
    isAuthenticated,
    isLoading,
    status,
    isStudent: user?.role === USER_ROLES.STUDENT,
    isParent: user?.role === USER_ROLES.PARENT,
    isAdmin: user?.role === USER_ROLES.ADMIN,
    isTeacher: user?.role === USER_ROLES.TEACHER,
  };
}
