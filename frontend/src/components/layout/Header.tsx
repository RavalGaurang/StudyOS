'use client';

import React, { useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { setSearchModalOpen, setPomodoroModalOpen, setTheme } from '../../store/slices/uiSlice';
import { logout } from '../../store/slices/authSlice';
import { authService } from '../../services/authService';
import { Avatar } from '../ui/Avatar';
import { Search, Moon, Sun, Bell, Timer, LogOut, Menu } from 'lucide-react';
import { NotificationDropdown } from '../common/NotificationDropdown';
import { APP_ROUTES } from '@/enums/app.enum';

export const Header: React.FC<{ onMobileMenuToggle?: () => void }> = ({
  onMobileMenuToggle,
}) => {
  const dispatch = useAppDispatch();
  const { theme, activePomodoro } = useAppSelector((state) => state.ui);
  const { user } = useAppSelector((state) => state.auth);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    dispatch(setTheme(nextTheme));
    if (nextTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const handleLogout = async () => {
    await authService.logout();
    dispatch(logout());
    window.location.href = APP_ROUTES.LOGIN;
  };

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <header className="h-16 border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md sticky top-0 z-20 px-4 md:px-6 flex items-center justify-between">
      <div className="flex items-center gap-3">
        {onMobileMenuToggle && (
          <button
            onClick={onMobileMenuToggle}
            className="md:hidden p-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}

        {/* Global Search Trigger */}
        <button
          onClick={() => dispatch(setSearchModalOpen(true))}
          className="flex items-center gap-2 p-2 sm:px-3 sm:py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xs sm:w-64 transition-all"
          title="Search subjects, tasks, notes..."
        >
          <Search className="w-3.5 h-3.5 flex-shrink-0" />
          <span className="hidden sm:inline truncate">Search subjects, tasks, notes...</span>
          <kbd className="hidden sm:inline-block ml-auto px-1.5 py-0.5 text-[10px] font-semibold bg-white dark:bg-slate-700 rounded border border-slate-200 dark:border-slate-600 text-slate-500">
            Ctrl+K
          </kbd>
        </button>
      </div>

      <div className="flex items-center gap-1.5 sm:gap-3">
        {/* Floating Pomodoro Quick-Pill */}
        {user?.role === 'STUDENT' && (
          <button
            onClick={() => dispatch(setPomodoroModalOpen(true))}
            className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 rounded-full bg-indigo-50 border border-indigo-200/80 text-indigo-700 dark:bg-indigo-950/60 dark:border-indigo-800/80 dark:text-indigo-300 text-xs font-bold transition-transform hover:scale-105"
            title="Focus Timer"
          >
            <Timer className="w-4 h-4 text-indigo-600 dark:text-indigo-400 animate-pulse flex-shrink-0" />
            <span className="text-[11px] sm:text-xs">{formatTimer(activePomodoro.timeLeft)}</span>
          </button>
        )}

        {/* Dark / Light Mode Switcher */}
        <button
          onClick={toggleTheme}
          aria-label="Toggle theme"
          className="p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>

        {/* Notifications Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            aria-label="View notifications"
            className="relative p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-indigo-600 ring-2 ring-white dark:ring-slate-900" />
          </button>

          {showNotifications && (
            <NotificationDropdown onClose={() => setShowNotifications(false)} />
          )}
        </div>

        {/* User Avatar Menu */}
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2 p-1 rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <Avatar name={`${user?.firstName || 'User'} ${user?.lastName || ''}`} size="sm" />
          </button>

          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-56 max-w-[calc(100vw-2rem)] rounded-2xl border border-slate-200 bg-white p-2 shadow-xl dark:border-slate-800 dark:bg-slate-900 animate-in fade-in z-50">
              <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800">
                <p className="text-xs font-bold text-slate-900 dark:text-slate-100">
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">{user?.email}</p>
                <span className="inline-block mt-1 px-1.5 py-0.5 text-[9px] font-extrabold uppercase rounded bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                  {user?.role}
                </span>
              </div>
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2 px-3 py-2 mt-1 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
