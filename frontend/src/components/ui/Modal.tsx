'use client';

import React from 'react';
import { FormLayout, FormLayoutSize } from './FormLayout';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  children: React.ReactNode;
  icon?: React.ReactNode;
  isLoading?: boolean;
  footer?: React.ReactNode;
}

/**
 * Modal is now powered by FormLayout across the entire project,
 * providing responsive sizing (sm, md, lg, full), backdrop-blur,
 * and unified loading states.
 */
export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title = '',
  description,
  size = 'md',
  children,
  icon,
  isLoading = false,
  footer,
}) => {
  const mappedSize: FormLayoutSize = size === 'xl' ? 'lg' : (size as FormLayoutSize);

  return (
    <FormLayout
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      description={description}
      size={mappedSize}
      icon={icon}
      isLoading={isLoading}
      footer={footer}
    >
      {children}
    </FormLayout>
  );
};

export default Modal;
