'use client';

import React from 'react';
import { User } from '@/types/user.types';
import { UserFilters, UserFilterValues } from './UserFilters';
import { UserTable } from './UserTable';
import { Pagination } from '../ui/Pagination';
import { Card } from '../ui/Card';
import { Users, UserPlus } from 'lucide-react';

export interface UserListProps {
  users: User[];
  isLoading: boolean;
  pagination: {
    page: number;
    totalPages: number;
    total: number;
  };
  onPageChange: (page: number) => void;
  onEditUser: (user: User) => void;
  onDeleteUser: (user: User) => void;
  fetchingUserId?: string | null;
  filters: UserFilterValues;
  onFilterChange: (filters: UserFilterValues) => void;
  onAddUser: () => void;
}

export const UserList: React.FC<UserListProps> = ({
  users,
  isLoading,
  pagination,
  onPageChange,
  onEditUser,
  onDeleteUser,
  fetchingUserId,
  filters,
  onFilterChange,
  onAddUser,
}) => {
  return (
    <div className="space-y-6 pb-12">
      {/* Module Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
              <Users className="w-5 h-5" />
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
              User Management
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Manage system accounts, assign academic roles, configure status toggles, and provision new users.
          </p>
        </div>

        <button
          type="button"
          onClick={onAddUser}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 text-xs sm:text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 rounded-xl shadow-sm hover:shadow transition-all"
        >
          <UserPlus className="w-4 h-4" />
          <span>Add User</span>
        </button>
      </div>

      {/* Filter Bar */}
      <UserFilters
        initialValues={filters}
        onChange={onFilterChange}
      />

      {/* Users Table Card */}
      <Card className="p-0 overflow-hidden shadow-xs border border-slate-200 dark:border-slate-800">
        <UserTable
          users={users}
          isLoading={isLoading}
          fetchingUserId={fetchingUserId}
          onEditUser={onEditUser}
          onDeleteUser={onDeleteUser}
        />

        {/* Pagination synced with Redux */}
        {!isLoading && pagination.totalPages > 1 && (
          <div className="px-4 border-t border-slate-100 dark:border-slate-800/80">
            <Pagination
              page={pagination.page}
              totalPages={pagination.totalPages}
              total={pagination.total}
              onPageChange={onPageChange}
            />
          </div>
        )}
      </Card>
    </div>
  );
};

export default UserList;
