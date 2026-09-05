'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { callApiAction } from '@/store/actions/apiAction';
import {
  selectApiData,
  selectApiMeta,
  selectApiIsLoading,
  selectActionLoading,
} from '@/store/slices/apiSlice';
import { ACTION_CONFIG } from '@/config/action.config';
import { HTTP_METHODS } from '@/enums/app.enum';
import { UserFilterValues } from '@/components/users/UserFilters';
import { UserList } from '@/components/users/UserList';
import { UserForm } from '@/components/users/UserForm';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { User } from '@/types/user.types';

export default function AdminUsersPage() {
  const dispatch = useAppDispatch();

  // Redux Selectors from Unified API Architecture
  const rawUsers = useAppSelector((state) =>
    selectApiData<any>(state, 'users', 'list')
  );
  // Support both User[] or { users: User[] } response structures
  const users: User[] = Array.isArray(rawUsers)
    ? rawUsers
    : rawUsers?.users || [];

  const meta = useAppSelector((state) =>
    selectApiMeta(state, 'users', 'list')
  );

  // Filter & pagination local control
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState<UserFilterValues>({
    search: '',
    role: '',
    isActive: '',
  });

  const pagination = meta || {
    page: currentPage,
    limit: 10,
    total: users.length,
    totalPages: 1,
  };

  const loading = useAppSelector((state) =>
    selectApiIsLoading(state, 'users', 'list')
  );
  const actionLoading = useAppSelector((state) =>
    selectActionLoading(state, 'user-action')
  );

  // Modal states
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [deleteConfirmUser, setDeleteConfirmUser] = useState<User | null>(null);
  const [fetchingUserId, setFetchingUserId] = useState<string | null>(null);

  // Fetch users with current page and filters
  const loadUsers = useCallback(() => {
    const params: any = {
      page: currentPage,
      limit: 10,
    };
    if (filters.search) params.search = filters.search;
    if (filters.role) params.role = filters.role;
    if (filters.isActive) params.isActive = filters.isActive;

    dispatch(
      callApiAction({
        endpoint: ACTION_CONFIG.USERS.BASE,
        params,
        module: 'users',
        subKey: 'list',
        force: true,
      })
    );
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
    setEditingUserId(null);
    setFormModalOpen(true);
  };

  // Open Edit Modal - opens FormLayout immediately and fetches fresh user data via GET API
  const handleOpenEditModal = async (user: User) => {
    setEditingUserId(user.id);
    setEditingUser(null); // Will be populated from fresh server data
    setFormModalOpen(true); // Open FormLayout immediately so user sees it right away!
    setFetchingUserId(user.id);

    try {
      const resultAction = await dispatch(
        callApiAction({
          endpoint: ACTION_CONFIG.USERS.BY_ID(user.id),
          method: HTTP_METHODS.GET,
          module: 'users',
          subKey: 'detail',
          force: true,
          actionKey: `fetch-user-${user.id}`,
        })
      );

      if (callApiAction.fulfilled.match(resultAction)) {
        const payloadData = resultAction.payload?.data;
        const fetchedUser = (payloadData?.user || payloadData) as User;
        if (fetchedUser) {
          setEditingUser(fetchedUser);
        } else {
          setEditingUser(user);
        }
      } else {
        setEditingUser(user);
      }
    } catch {
      setEditingUser(user);
    } finally {
      setFetchingUserId(null);
    }
  };

  // Submit Add / Edit Form
  const handleFormSubmit = async (formData: any) => {
    if (editingUser) {
      // Update user
      const resultAction = await dispatch(
        callApiAction({
          endpoint: ACTION_CONFIG.USERS.BY_ID(editingUser.id),
          method: HTTP_METHODS.PUT,
          data: {
            firstName: formData.firstName,
            lastName: formData.lastName,
            email: formData.email,
            mobile: formData.mobile || undefined,
            role: formData.role,
            isActive: formData.isActive,
          },
          module: 'users',
          actionKey: 'user-action',
          showToast: { success: 'User updated successfully' },
        })
      );

      if (callApiAction.fulfilled.match(resultAction)) {
        setFormModalOpen(false);
        setEditingUser(null);
        loadUsers();
      }
    } else {
      // Create user
      const resultAction = await dispatch(
        callApiAction({
          endpoint: ACTION_CONFIG.USERS.BASE,
          method: HTTP_METHODS.POST,
          data: {
            firstName: formData.firstName,
            lastName: formData.lastName,
            email: formData.email,
            mobile: formData.mobile || undefined,
            password: formData.password,
            role: formData.role,
            isActive: formData.isActive,
          },
          module: 'users',
          actionKey: 'user-action',
          showToast: { success: 'User created successfully' },
        })
      );

      if (callApiAction.fulfilled.match(resultAction)) {
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

    // Delete user
    const resultAction = await dispatch(
      callApiAction({
        endpoint: ACTION_CONFIG.USERS.BY_ID(deleteConfirmUser.id),
        method: HTTP_METHODS.DELETE,
        module: 'users',
        actionKey: 'user-action',
        showToast: { success: 'User deleted successfully' },
      })
    );

    if (callApiAction.fulfilled.match(resultAction)) {
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
    <>
      <UserList
        users={users}
        isLoading={loading}
        pagination={pagination}
        onPageChange={(p) => setCurrentPage(p)}
        onEditUser={handleOpenEditModal}
        onDeleteUser={handleOpenDeleteConfirm}
        fetchingUserId={fetchingUserId}
        filters={filters}
        onFilterChange={handleFilterChange}
        onAddUser={handleOpenCreateModal}
      />

      {/* User Form using Reusable FormLayout (replaces Modal) */}
      <UserForm
        isOpen={formModalOpen}
        onClose={() => {
          setFormModalOpen(false);
          setEditingUser(null);
          setEditingUserId(null);
        }}
        user={editingUser}
        userId={editingUserId}
        onSubmit={handleFormSubmit}
        isLoading={actionLoading || Boolean(fetchingUserId)}
        size="sm"
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
    </>
  );
}
