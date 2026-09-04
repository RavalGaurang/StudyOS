'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Search, X, Filter } from 'lucide-react';
import { USER_ROLES } from '@/enums/app.enum';

export interface UserFilterValues {
  search: string;
  role: string;
  isActive: string; // '' | 'true' | 'false'
}

export interface UserFiltersProps {
  initialValues?: UserFilterValues;
  onChange: (filters: UserFilterValues) => void;
  onAddUser?: () => void;
}

export const UserFilters: React.FC<UserFiltersProps> = ({
  initialValues = { search: '', role: '', isActive: '' },
  onChange,
  onAddUser,
}) => {
  const [search, setSearch] = useState(initialValues.search);
  const [role, setRole] = useState(initialValues.role);
  const [isActive, setIsActive] = useState(initialValues.isActive);

  // Debounced search effect (350ms)
  useEffect(() => {
    const handler = setTimeout(() => {
      onChange({ search, role, isActive });
    }, 350);

    return () => clearTimeout(handler);
  }, [search]);

  const handleRoleChange = (newRole: string) => {
    setRole(newRole);
    onChange({ search, role: newRole, isActive });
  };

  const handleStatusChange = (newStatus: string) => {
    setIsActive(newStatus);
    onChange({ search, role, isActive: newStatus });
  };

  const handleReset = () => {
    setSearch('');
    setRole('');
    setIsActive('');
    onChange({ search: '', role: '', isActive: '' });
  };

  const isFiltered = Boolean(search || role || isActive);

  return (
    <Card className="p-3 sm:p-4">
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
        {/* Left: Search input */}
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, email, or mobile..."
            className="w-full pl-9 pr-9 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch('')}
              className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Right: Dropdown Filters & Actions */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Role Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 hidden sm:inline">
              Role:
            </span>
            <select
              value={role}
              onChange={(e) => handleRoleChange(e.target.value)}
              className="px-3 py-2 text-xs font-medium rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
            >
              <option value="">All Roles</option>
              <option value={USER_ROLES.STUDENT}>Students</option>
              <option value={USER_ROLES.PARENT}>Parents</option>
              <option value={USER_ROLES.TEACHER}>Teachers</option>
              <option value={USER_ROLES.ADMIN}>Administrators</option>
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 hidden sm:inline">
              Status:
            </span>
            <select
              value={isActive}
              onChange={(e) => handleStatusChange(e.target.value)}
              className="px-3 py-2 text-xs font-medium rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
            >
              <option value="">All Statuses</option>
              <option value="true">Active Only</option>
              <option value="false">Inactive Only</option>
            </select>
          </div>

          {/* Reset Filters */}
          {isFiltered && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleReset}
              className="text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
              leftIcon={<X className="w-3.5 h-3.5" />}
            >
              Clear
            </Button>
          )}

          {/* Add User Button */}
          {onAddUser && (
            <Button
              type="button"
              variant="primary"
              size="md"
              onClick={onAddUser}
              className="ml-auto sm:ml-2 font-bold shadow-sm text-xs"
            >
              + Add User
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
};
