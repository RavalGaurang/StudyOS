'use client';

import React, { useState, useEffect } from 'react';
import { adminService, SystemStats } from '../../../../services/adminService';
import { Card } from '../../../../components/ui/Card';
import { Button } from '../../../../components/ui/Button';
import { Badge } from '../../../../components/ui/Badge';
import { Table } from '../../../../components/ui/Table';
import { LoadingState } from '../../../../components/ui/LoadingState';
import { ErrorState } from '../../../../components/ui/ErrorState';
import {
  Users,
  Shield,
  Activity,
  Server,
  BookOpen,
  CheckSquare,
  Timer,
  Check,
  Ban,
} from 'lucide-react';
import { formatDate } from '../../../../lib/utils';
import Link from 'next/link';

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<SystemStats | null>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    try {
      const [statRes, userRes] = await Promise.all([
        adminService.getStats(),
        adminService.getUsers({ limit: 10 }),
      ]);
      setStats(statRes);
      setUsers(userRes.users);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleToggleUser = async (userId: string, currentStatus: boolean) => {
    try {
      await adminService.toggleUserStatus(userId, !currentStatus);
      loadData();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <LoadingState message="Loading system administration metrics..." />;
  if (!stats) return <ErrorState message="Failed to load admin stats" onRetry={loadData} />;

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 sm:p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white shadow-xl border border-indigo-500/30">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              StudyOS System Administration
            </h1>
            <Shield className="w-5 h-5 text-indigo-400" />
          </div>
          <p className="text-xs text-slate-300 mt-1">
            Production multi-tenant platform metrics, user directory, and database status.
          </p>
        </div>

        <Link href="/admin/users">
          <Button variant="primary" size="sm" className="whitespace-nowrap">
            Manage All Users
          </Button>
        </Link>
      </div>

      {/* Metric KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <Card className="p-3.5 sm:p-5 border-l-4 border-l-indigo-500">
          <span className="text-[11px] sm:text-xs font-bold uppercase text-slate-400">Total Users</span>
          <div className="mt-2 flex flex-wrap items-baseline gap-1.5">
            <span className="text-xl sm:text-3xl font-black text-slate-900 dark:text-slate-100">
              {stats.totalUsers}
            </span>
            <span className="text-[10px] sm:text-xs text-slate-400">accounts</span>
          </div>
        </Card>

        <Card className="p-3.5 sm:p-5 border-l-4 border-l-emerald-500">
          <span className="text-[11px] sm:text-xs font-bold uppercase text-slate-400">Students Active</span>
          <div className="mt-2 flex flex-wrap items-baseline gap-1.5">
            <span className="text-xl sm:text-3xl font-black text-emerald-500">
              {stats.totalStudents}
            </span>
            <span className="text-[10px] sm:text-xs text-slate-400">enrolled</span>
          </div>
        </Card>

        <Card className="p-3.5 sm:p-5 border-l-4 border-l-amber-500">
          <span className="text-[11px] sm:text-xs font-bold uppercase text-slate-400">Total Study Hours</span>
          <div className="mt-2 flex flex-wrap items-baseline gap-1.5">
            <span className="text-xl sm:text-3xl font-black text-amber-500">
              {stats.totalStudyHours}h
            </span>
            <span className="text-[10px] sm:text-xs text-slate-400">logged</span>
          </div>
        </Card>

        <Card className="p-3.5 sm:p-5 border-l-4 border-l-purple-500">
          <span className="text-[11px] sm:text-xs font-bold uppercase text-slate-400">Total Tasks</span>
          <div className="mt-2 flex flex-wrap items-baseline gap-1.5">
            <span className="text-xl sm:text-3xl font-black text-purple-500">
              {stats.totalTasks}
            </span>
            <span className="text-[10px] sm:text-xs text-slate-400">created</span>
          </div>
        </Card>
      </div>

      {/* Users Table */}
      <Card
        title="Recently Registered Accounts"
        subtitle="Platform users and account statuses"
        action={
          <Link href="/admin/users">
            <Button variant="ghost" size="sm">
              View All Directory
            </Button>
          </Link>
        }
      >
        <Table
          columns={[
            {
              header: 'User',
              accessor: (row) => (
                <div>
                  <div className="font-bold text-slate-900 dark:text-slate-100">
                    {row.firstName} {row.lastName}
                  </div>
                  <div className="text-[11px] text-slate-400">{row.email}</div>
                </div>
              ),
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
              header: 'Joined Date',
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
                  onClick={() => handleToggleUser(row.id, row.isActive)}
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
      </Card>
    </div>
  );
}
