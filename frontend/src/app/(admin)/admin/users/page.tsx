'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  fetchUsers,
  createUser,
  updateUser,
  deleteUser,
  setSelectedUser,
} from '@/store/slices/userSlice';
import { UserFilters, UserFilterValues } from '@/components/users/UserFilters';
import { UserTable } from '@/components/users/UserTable';
import { UserFormModal } from '@/components/users/UserFormModal';
import { Pagination } from '@/components/ui/Pagination';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { Card } from '@/components/ui/Card';
import { User } from '@/types/user.types';
import { Users, UserPlus } from 'lucide-react';

export default function AdminUsersPage() {
  const dispatch = useAppDispatch();

  const { users, pagination, loading, actionLoading } = useAppSelector(
    (state) => state.users
  );

  // Filter & pagination local control
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState<UserFilterValues>({
    search: '',
    role: '',
    isActive: '',
  });

  // Modal states
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [deleteConfirmUser, setDeleteConfirmUser] = useState<User | null>(null);

  // Fetch users with current page and filters
  const loadUsers = useCallback(() => {
    const params: any = {
      page: currentPage,
      limit: 10,
    };
    if (filters.search) params.search = filters.search;
    if (filters.role) params.role = filters.role;
    if (filters.isActive) params.isActive = filters.isActive;

    dispatch(fetchUsers(params));
  }, [dispatch, currentPage, filters]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  // Handle filter changes from UserFilters component
  const handleFilterChange = (newFilters: UserFilterValues) => {
    setFilters(newFilters);
    setCurrentPage(1); // Reset to page 1 on filter changes
  };

  // Open Create Modal
  const handleOpenCreateModal = () => {
    setEditingUser(null);
    setFormModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEditModal = (user: User) => {
    setEditingUser(user);
    dispatch(setSelectedUser(user));
    setFormModalOpen(true);
  };

  // Submit Add / Edit Form
  const handleFormSubmit = async (formData: any) => {
    if (editingUser) {
      // Update user (Success toast dispatched directly by userSlice reducer)
      const resultAction = await dispatch(
        updateUser({
          id: editingUser.id,
          payload: {
            firstName: formData.firstName,
            lastName: formData.lastName,
            email: formData.email,
            mobile: formData.mobile || undefined,
            role: formData.role,
            isActive: formData.isActive,
          },
        })
      );

      if (updateUser.fulfilled.match(resultAction)) {
        setFormModalOpen(false);
        setEditingUser(null);
        loadUsers();
      }
    } else {
      // Create user (Success toast dispatched directly by userSlice reducer)
      const resultAction = await dispatch(
        createUser({
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          mobile: formData.mobile || undefined,
          password: formData.password,
          role: formData.role,
          isActive: formData.isActive,
        })
      );

      if (createUser.fulfilled.match(resultAction)) {
        setFormModalOpen(false);
        loadUsers();
      }
    }
  };

  // Open Delete Confirmation
  const handleOpenDeleteConfirm = (user: User) => {
    setDeleteConfirmUser(user);
  };

  // Execute Delete
  const handleConfirmDelete = async () => {
    if (!deleteConfirmUser) return;

    // Delete user (Success toast dispatched directly by userSlice reducer)
    const resultAction = await dispatch(deleteUser(deleteConfirmUser.id));

    if (deleteUser.fulfilled.match(resultAction)) {
      // Handle last item on last page condition
      if (users.length === 1 && currentPage > 1) {
        setCurrentPage((prev) => prev - 1);
      } else {
        loadUsers();
      }
    }
    setDeleteConfirmUser(null);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Page Header */}
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
          onClick={handleOpenCreateModal}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 text-xs sm:text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 rounded-xl shadow-sm hover:shadow transition-all"
        >
          <UserPlus className="w-4 h-4" />
          <span>Add User</span>
        </button>
      </div>

      {/* Filter Bar */}
      <UserFilters
        initialValues={filters}
        onChange={handleFilterChange}
      />

      {/* Users Table Card */}
      <Card className="p-0 overflow-hidden shadow-xs border border-slate-200 dark:border-slate-800">
        <UserTable
          users={users}
          isLoading={loading}
          onEditUser={handleOpenEditModal}
          onDeleteUser={handleOpenDeleteConfirm}
        />

        {/* Pagination synced with Redux */}
        {!loading && pagination.totalPages > 1 && (
          <div className="px-4 border-t border-slate-100 dark:border-slate-800/80">
            <Pagination
              page={pagination.page}
              totalPages={pagination.totalPages}
              total={pagination.total}
              onPageChange={(p) => setCurrentPage(p)}
            />
          </div>
        )}
      </Card>

      {/* Add / Edit User Form Modal */}
      <UserFormModal
        isOpen={formModalOpen}
        onClose={() => {
          setFormModalOpen(false);
          setEditingUser(null);
        }}
        user={editingUser}
        onSubmit={handleFormSubmit}
        isLoading={actionLoading}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={Boolean(deleteConfirmUser)}
        onClose={() => setDeleteConfirmUser(null)}
        onConfirm={handleConfirmDelete}
        title="Delete User Account?"
        message={
          deleteConfirmUser
            ? `Are you sure you want to delete ${deleteConfirmUser.firstName} ${deleteConfirmUser.lastName} (${deleteConfirmUser.email})? This action will revoke all sessions and remove linked profiles permanently.`
            : 'Are you sure you want to delete this user?'
        }
        confirmText="Delete User"
        cancelText="Cancel"
        variant="danger"
        isLoading={actionLoading}
      />
    </div>
  );
}
