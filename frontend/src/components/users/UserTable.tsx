'use client';

import React from 'react';
import { Table, Column } from '../ui/Table';
import { Avatar } from '../ui/Avatar';
import { Badge } from '../ui/Badge';
import { UserStatusSwitch } from './UserStatusSwitch';
import { User } from '@/types/user.types';
import { formatDate } from '@/lib/utils';
import { Edit2, Trash2, ShieldCheck, UserCheck } from 'lucide-react';
import { UserRole, USER_ROLES } from '@/enums/app.enum';

export interface UserTableProps {
  users: User[];
  isLoading: boolean;
  onEditUser: (user: User) => void;
  onDeleteUser: (user: User) => void;
}

export const UserTable: React.FC<UserTableProps> = ({
  users,
  isLoading,
  onEditUser,
  onDeleteUser,
}) => {
  const getRoleBadgeVariant = (role: UserRole) => {
    switch (role) {
      case USER_ROLES.ADMIN:
        return 'danger';
      case USER_ROLES.TEACHER:
        return 'info';
      case USER_ROLES.PARENT:
        return 'warning';
      case USER_ROLES.STUDENT:
      default:
        return 'primary';
    }
  };

  const columns: Column<User>[] = [
    {
      header: 'Name',
      accessor: (user) => (
        <div className="flex items-center gap-3">
          <Avatar
            name={`${user.firstName} ${user.lastName}`}
            src={user.avatarUrl}
            size="sm"
          />
          <div>
            <div className="flex items-center gap-1.5 font-bold text-slate-900 dark:text-slate-100 text-xs sm:text-sm">
              <span>
                {user.firstName} {user.lastName}
              </span>
              {user.isEmailVerified && (
                <span title="Email Verified" className="inline-flex items-center">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                </span>
              )}
            </div>
            <span className="text-[11px] text-slate-400 dark:text-slate-500">
              ID: {user.id.slice(0, 8)}...
            </span>
          </div>
        </div>
      ),
    },
    {
      header: 'Email',
      accessor: (user) => (
        <span className="text-xs text-slate-600 dark:text-slate-300 font-medium">
          {user.email}
        </span>
      ),
    },
    {
      header: 'Mobile',
      accessor: (user) => (
        <span className="text-xs text-slate-600 dark:text-slate-400">
          {user.mobile || '—'}
        </span>
      ),
    },
    {
      header: 'Role',
      accessor: (user) => (
        <Badge variant={getRoleBadgeVariant(user.role)}>
          {user.role}
        </Badge>
      ),
    },
    {
      header: 'Status',
      accessor: (user) => <UserStatusSwitch user={user} size="sm" />,
    },
    {
      header: 'Created At',
      accessor: (user) => (
        <span className="text-xs text-slate-400 dark:text-slate-500 whitespace-nowrap">
          {formatDate(user.createdAt)}
        </span>
      ),
    },
    {
      header: 'Actions',
      className: 'text-right',
      accessor: (user) => (
        <div className="flex items-center justify-end gap-1">
          <button
            type="button"
            title="Edit User"
            onClick={(e) => {
              e.stopPropagation();
              onEditUser(user);
            }}
            className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 dark:hover:text-indigo-400 transition-colors"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            type="button"
            title="Delete User"
            onClick={(e) => {
              e.stopPropagation();
              onDeleteUser(user);
            }}
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 dark:hover:text-rose-400 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <Table
      columns={columns}
      data={users}
      isLoading={isLoading}
      emptyMessage="No users found matching your search or filters."
    />
  );
};
