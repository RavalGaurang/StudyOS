'use client';

import React from 'react';
import { Switch } from '../ui/Switch';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { updateUserStatus } from '@/store/slices/userSlice';
import { User } from '@/types/user.types';

export interface UserStatusSwitchProps {
  user: User;
  size?: 'sm' | 'md';
}

export const UserStatusSwitch: React.FC<UserStatusSwitchProps> = ({
  user,
  size = 'sm',
}) => {
  const dispatch = useAppDispatch();
  const statusLoading = useAppSelector((state) => state.users.statusLoading[user.id]);

  const handleToggle = async (newChecked: boolean) => {
    // Prevent multiple requests while currently loading
    if (statusLoading) return;

    // Dispatches action; userSlice reducer automatically displays global success toast
    await dispatch(updateUserStatus({ id: user.id, isActive: newChecked }));
  };

  return (
    <div className="flex items-center">
      <Switch
        id={`status-switch-${user.id}`}
        checked={user.isActive}
        onChange={handleToggle}
        isLoading={Boolean(statusLoading)}
        disabled={Boolean(statusLoading)}
        size={size}
      />
    </div>
  );
};
