'use client';

import React from 'react';
import { Switch } from '../ui/Switch';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { callApiAction } from '@/store/actions/apiAction';
import { selectActionLoading, updateItemInList } from '@/store/slices/apiSlice';
import { ACTION_CONFIG } from '@/config/action.config';
import { HTTP_METHODS } from '@/enums/app.enum';
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
  const actionKey = `user-status-${user.id}`;
  const statusLoading = useAppSelector((state) =>
    selectActionLoading(state, actionKey)
  );

  const handleToggle = async (newChecked: boolean) => {
    // Prevent multiple requests while currently loading
    if (statusLoading) return;

    const resultAction = await dispatch(
      callApiAction({
        endpoint: ACTION_CONFIG.USERS.STATUS(user.id),
        method: HTTP_METHODS.PATCH,
        data: { isActive: newChecked },
        module: 'users',
        actionKey,
        showToast: {
          success: `User status changed to ${newChecked ? 'active' : 'inactive'}`,
        },
      })
    );

    if (callApiAction.fulfilled.match(resultAction)) {
      // Optimistically update the user's status in the cached users list
      dispatch(
        updateItemInList({
          module: 'users',
          subKey: 'list',
          id: user.id,
          changes: { isActive: newChecked },
        })
      );
    }
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
