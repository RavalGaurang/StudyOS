'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, BookOpen, CheckSquare, Timer, Bot, Users, BarChart3, Activity } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { setPomodoroModalOpen } from '../../store/slices/uiSlice';
import { cn } from '../../lib/utils';

export const MobileNav: React.FC = () => {
  const pathname = usePathname();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.api.auth);
  const role = user?.role || 'STUDENT';

  const studentLinks = [
    { href: '/dashboard', label: 'Home', icon: LayoutDashboard },
    { href: '/subjects', label: 'Subjects', icon: BookOpen },
    { href: '/tasks', label: 'Tasks', icon: CheckSquare },
    { href: '/ai', label: 'AI Tutor', icon: Bot },
  ];

  const parentLinks = [
    { href: '/parent/dashboard', label: 'Home', icon: LayoutDashboard },
    { href: '/parent/children', label: 'Children', icon: Users },
    { href: '/parent/analytics', label: 'Reports', icon: BarChart3 },
  ];

  const adminLinks = [
    { href: '/admin/dashboard', label: 'Home', icon: LayoutDashboard },
    { href: '/admin/users', label: 'Users', icon: Users },
    { href: '/admin/system', label: 'System', icon: Activity },
  ];

  let links = studentLinks;
  if (role === 'PARENT') links = parentLinks;
  else if (role === 'ADMIN') links = adminLinks;

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-lg border-t border-slate-200 dark:border-slate-800 px-2 py-1.5 flex items-center justify-around shadow-lg">
      {links.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'flex flex-col items-center gap-1 py-1 px-3 rounded-xl text-[10px] font-bold transition-all',
              isActive
                ? 'text-indigo-600 dark:text-indigo-400'
                : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100'
            )}
          >
            <Icon className="w-5 h-5" />
            <span>{item.label}</span>
          </Link>
        );
      })}

      {/* Center Pomodoro floating trigger */}
      <button
        onClick={() => dispatch(setPomodoroModalOpen(true))}
        className="flex flex-col items-center gap-1 py-1 px-3 text-indigo-600 dark:text-indigo-400 font-bold text-[10px]"
      >
        <div className="p-1.5 rounded-full bg-gradient-to-tr from-violet-600 via-indigo-600 to-blue-600 text-white shadow-md shadow-violet-500/30">
          <Timer className="w-4 h-4" />
        </div>
        <span>Focus</span>
      </button>
    </div>
  );
};
