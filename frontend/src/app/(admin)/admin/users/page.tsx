'use client';

import React, { useState, useEffect } from 'react';
import { adminService } from '../../../../services/adminService';
import { Card } from '../../../../components/ui/Card';
import { Button } from '../../../../components/ui/Button';
import { Badge } from '../../../../components/ui/Badge';
import { Table } from '../../../../components/ui/Table';
import { Pagination } from '../../../../components/ui/Pagination';
import { LoadingState } from '../../../../components/ui/LoadingState';
import { Search } from 'lucide-react';
import { formatDate } from '../../../../lib/utils';

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [meta, setMeta] = useState({ page: 1, limit: 20, total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [page, setPage] = useState(1);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const params: any = { page: page.toString(), limit: '20' };
      if (search) params.search = search;
      if (roleFilter) params.role = roleFilter;

      const res = await adminService.getUsers(params);
      setUsers(res.users);
      setMeta(res.meta);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, [page, roleFilter]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    loadUsers();
  };

  const handleToggle = async (userId: string, currentStatus: boolean) => {
    try {
      await adminService.toggleUserStatus(userId, !currentStatus);
      loadUsers();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
          Users Directory & Access Control
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Manage registered students, parents, teachers, and system administrators.
        </p>
      </div>

      {/* Filter Bar */}
      <Card className="p-3">
        <div className="flex flex-col sm:flex-row items-center gap-3 justify-between">
          <form onSubmit={handleSearch} className="relative w-full sm:w-80">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name or email..."
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100"
            />
          </form>

          <select
            value={roleFilter}
            onChange={(e) => {
              setRoleFilter(e.target.value);
              setPage(1);
            }}
            className="w-full sm:w-auto px-3 py-1.5 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200"
          >
            <option value="">All Roles</option>
            <option value="STUDENT">Students</option>
            <option value="PARENT">Parents</option>
            <option value="TEACHER">Teachers</option>
            <option value="ADMIN">Admins</option>
          </select>
        </div>
      </Card>

      {/* Users Table */}
      <Card>
        {loading ? (
          <LoadingState message="Fetching users directory..." />
        ) : (
          <>
            <Table
              columns={[
                {
                  header: 'Name',
                  accessor: (row) => (
                    <div className="font-bold text-slate-900 dark:text-slate-100">
                      {row.firstName} {row.lastName}
                    </div>
                  ),
                },
                {
                  header: 'Email',
                  accessor: (row) => <span className="text-xs text-slate-500">{row.email}</span>,
                },
                {
                  header: 'Role',
                  accessor: (row) => (
                    <Badge
                      variant={
                        row.role === 'ADMIN'
                          ? 'danger'
                          : row.role === 'PARENT'
                          ? 'warning'
                          : row.role === 'TEACHER'
                          ? 'info'
                          : 'primary'
                      }
                    >
                      {row.role}
                    </Badge>
                  ),
                },
                {
                  header: 'Joined',
                  accessor: (row) => (
                    <span className="text-xs text-slate-400">{formatDate(row.createdAt)}</span>
                  ),
                },
                {
                  header: 'Status',
                  accessor: (row) => (
                    <Badge variant={row.isActive ? 'success' : 'danger'}>
                      {row.isActive ? 'Active' : 'Suspended'}
                    </Badge>
                  ),
                },
                {
                  header: 'Actions',
                  accessor: (row) => (
                    <button
                      onClick={() => handleToggle(row.id, row.isActive)}
                      className={`px-2 py-1 rounded text-xs font-bold ${
                        row.isActive
                          ? 'text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40'
                          : 'text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40'
                      }`}
                    >
                      {row.isActive ? 'Suspend' : 'Activate'}
                    </button>
                  ),
                },
              ]}
              data={users}
              emptyMessage="No users found"
            />

            <div className="px-4">
              <Pagination
                page={meta.page}
                totalPages={meta.totalPages}
                total={meta.total}
                onPageChange={(p) => setPage(p)}
              />
            </div>
          </>
        )}
      </Card>
    </div>
  );
}
