'use client';

import React from 'react';
import { UserForm, UserFormProps, UserFormData } from './UserForm';

export type { UserFormData, UserFormProps as UserFormModalProps };
export const UserFormModal: React.FC<UserFormProps> = (props) => {
  return <UserForm {...props} />;
};

export default UserFormModal;
