'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '../../lib/utils';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { toggleSidebar } from '../../store/slices/uiSlice';
import {
  LayoutDashboard,
  BookOpen,
  CheckSquare,
  FileText,
  GraduationCap,
  Calendar,
  Clock,
  BookMarked,
  Timer,
  HelpCircle,
  Layers,
  Target,
  BarChart3,
  Bot,
  Users,
  ShieldAlert,
  ChevronLeft,
  ChevronRight,
  Activity,
  X,
} from 'lucide-react';

export interface SidebarProps {
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ mobileOpen = false, onMobileClose }) => {
  const pathname = usePathname();
  const dispatch = useAppDispatch();
  const { sidebarOpen } = useAppSelector((state) => state.ui);
  const { user } = useAppSelector((state) => state.auth);

  const role = user?.role || 'STUDENT';

  const studentLinks = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/subjects', label: 'Subjects', icon: BookOpen },
    { href: '/tasks', label: 'Tasks', icon: CheckSquare },
    { href: '/assignments', label: 'Assignments', icon: FileText },
    { href: '/exams', label: 'Exams', icon: GraduationCap },
    { href: '/timetable', label: 'Timetable', icon: Calendar },
    { href: '/attendance', label: 'Attendance', icon: Clock },
    { href: '/notes', label: 'Notes', icon: BookMarked },
    { href: '/study', label: 'Study & Pomodoro', icon: Timer },
    { href: '/quizzes', label: 'Quizzes', icon: HelpCircle },
    { href: '/flashcards', label: 'Flashcards', icon: Layers },
    { href: '/goals', label: 'Goals', icon: Target },
    { href: '/analytics', label: 'Analytics', icon: BarChart3 },
    { href: '/ai', label: 'AI Tutor & Tools', icon: Bot },
  ];

  const parentLinks = [
    { href: '/parent/dashboard', label: 'Parent Dashboard', icon: LayoutDashboard },
    { href: '/parent/children', label: 'My Children', icon: Users },
    { href: '/parent/analytics', label: 'Academic Reports', icon: BarChart3 },
  ];

  const adminLinks = [
    { href: '/admin/dashboard', label: 'Admin Dashboard', icon: LayoutDashboard },
    { href: '/admin/users', label: 'Users Directory', icon: Users },
    { href: '/admin/system', label: 'System Analytics', icon: Activity },
  ];

  let links = studentLinks;
  if (role === 'PARENT') links = parentLinks;
  else if (role === 'ADMIN') links = adminLinks;

  const brandHomeHref =
    role === 'PARENT' ? '/parent/dashboard' : role === 'ADMIN' ? '/admin/dashboard' : '/dashboard';

  return (
    <>
      {/* Mobile Drawer Overlay (< md) */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex animate-in fade-in duration-200">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm"
            onClick={onMobileClose}
          />

          {/* Drawer Panel */}
          <aside className="relative w-72 max-w-[85vw] bg-white dark:bg-slate-900 h-full flex flex-col shadow-2xl border-r border-slate-200 dark:border-slate-800 z-10 animate-in slide-in-from-left duration-200">
            <div className="flex items-center justify-between px-5 h-16 border-b border-slate-100 dark:border-slate-800">
              <Link
                href={brandHomeHref}
                onClick={onMobileClose}
                className="flex items-center gap-2 overflow-hidden"
              >
                <img
                  src="/images/logo.png"
                  alt="StudyOS"
                  className="h-8 w-auto max-w-[135px] object-contain"
                />
              </Link>
              <button
                onClick={onMobileClose}
                aria-label="Close navigation"
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 dark:hover:text-slate-200 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Mobile Nav Links */}
            <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
              {links.map((item) => {
                const Icon = item.icon;
                const isActive =
                  pathname === item.href ||
                  (item.href !== '/dashboard' && pathname.startsWith(item.href));

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onMobileClose}
                    className={cn(
                      'flex items-center gap-3 px-3.5 py-3 rounded-xl text-sm font-semibold transition-all group',
                      isActive
                        ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400 font-bold shadow-xs'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800/60 dark:hover:text-slate-100'
                    )}
                  >
                    <Icon
                      className={cn(
                        'w-5 h-5 flex-shrink-0 transition-colors',
                        isActive
                          ? 'text-indigo-600 dark:text-indigo-400'
                          : 'text-slate-400 group-hover:text-slate-600 dark:text-slate-500 dark:group-hover:text-slate-300'
                      )}
                    />
                    <span className="truncate">{item.label}</span>
                  </Link>
                );
              })}
            </nav>

            {/* Mobile Drawer Footer */}
            <div className="p-4 m-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/40">
              <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                StudyOS Academic Pro
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                {role === 'STUDENT' ? 'Semester 6 • Spring 2026' : `Logged in as ${role}`}
              </p>
            </div>
          </aside>
        </div>
      )}

      {/* Desktop Sticky Sidebar (>= md) */}
      <aside
        className={cn(
          'hidden md:flex flex-col border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 transition-all duration-300 z-30 select-none h-screen sticky top-0',
          sidebarOpen ? 'w-64' : 'w-20'
        )}
      >
        {/* Brand Logo & Name */}
        <div className="flex items-center justify-between px-5 h-16 border-b border-slate-100 dark:border-slate-800/80">
          <Link href={brandHomeHref} className="flex items-center gap-2 overflow-hidden">
            {sidebarOpen ? (
              <img
                src="/images/logo.png"
                alt="StudyOS"
                className="h-8 w-auto max-w-[135px] object-contain"
              />
            ) : (
              <img
                src="/images/favicon.png"
                alt="StudyOS"
                className="w-9 h-9 rounded-xl object-contain shadow-sm"
              />
            )}
          </Link>
          <button
            onClick={() => dispatch(toggleSidebar())}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 dark:hover:text-slate-300 transition-colors"
          >
            {sidebarOpen ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </button>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {links.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all group',
                  isActive
                    ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400 font-bold shadow-xs'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800/60 dark:hover:text-slate-100'
                )}
                title={!sidebarOpen ? item.label : undefined}
              >
                <Icon
                  className={cn(
                    'w-5 h-5 flex-shrink-0 transition-colors',
                    isActive
                      ? 'text-indigo-600 dark:text-indigo-400'
                      : 'text-slate-400 group-hover:text-slate-600 dark:text-slate-500 dark:group-hover:text-slate-300'
                  )}
                />
                {sidebarOpen && <span className="truncate">{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Role Badge in Footer */}
        {sidebarOpen && (
          <div className="p-4 m-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/40">
            <p className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
              StudyOS Academic Pro
            </p>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
              Semester 6 • Spring 2026
            </p>
          </div>
        )}
      </aside>
    </>
  );
};
