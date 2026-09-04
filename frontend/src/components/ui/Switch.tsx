'use client';

import React from 'react';
import { cn } from '../../lib/utils';
import { Loader2 } from 'lucide-react';
import { formatLabelWithAsterisk } from './Label';

export interface SwitchProps {
  id?: string;
  name?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  isLoading?: boolean;
  label?: React.ReactNode;
  description?: string;
  showLabels?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  required?: boolean;
  isRequired?: boolean;
}

export const Switch: React.FC<SwitchProps> = ({
  id,
  name,
  checked,
  onChange,
  disabled = false,
  isLoading = false,
  label,
  description,
  showLabels = true,
  size = 'md',
  className,
  required,
  isRequired,
}) => {
  const switchId =
    id ||
    (typeof label === 'string'
      ? label.replace(/[*:]/g, '').trim().toLowerCase().replace(/[^a-z0-9]+/g, '-')
      : undefined);
  const isFieldRequired = Boolean(required || isRequired);
  const isDisabled = disabled || isLoading;

  const handleToggle = () => {
    if (!isDisabled) {
      onChange(!checked);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      handleToggle();
    }
  };

  // Dimensions configuration
  const sizes = {
    sm: {
      track: 'w-14 h-7 text-[10px]',
      thumb: 'w-5 h-5',
      translate: 'translate-x-7',
      translateOff: 'translate-x-1',
    },
    md: {
      track: 'w-16 h-8 text-[11px]',
      thumb: 'w-6 h-6',
      translate: 'translate-x-9',
      translateOff: 'translate-x-1',
    },
    lg: {
      track: 'w-20 h-9 text-xs',
      thumb: 'w-7 h-7',
      translate: 'translate-x-11',
      translateOff: 'translate-x-1',
    },
  };

  const currentSize = sizes[size];

  return (
    <div className={cn('inline-flex items-center gap-3 select-none', className)}>
      <button
        id={switchId}
        name={name}
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={isDisabled}
        onClick={handleToggle}
        onKeyDown={handleKeyDown}
        className={cn(
          'relative inline-flex items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:ring-offset-2 dark:focus:ring-offset-slate-900',
          currentSize.track,
          checked
            ? 'bg-emerald-600 dark:bg-emerald-600'
            : 'bg-slate-300 dark:bg-slate-700',
          isDisabled ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer shadow-inner'
        )}
      >
        {/* ON / OFF Text in Track */}
        {showLabels && (
          <span
            className={cn(
              'absolute font-bold tracking-wider uppercase transition-opacity duration-150',
              checked
                ? 'left-2 text-white opacity-100'
                : 'right-2 text-slate-600 dark:text-slate-300 opacity-100'
            )}
          >
            {checked ? 'ON' : 'OFF'}
          </span>
        )}

        {/* Sliding Thumb */}
        <span
          className={cn(
            'inline-flex items-center justify-center rounded-full bg-white shadow-md transition-transform duration-200 ease-in-out',
            currentSize.thumb,
            checked ? currentSize.translate : currentSize.translateOff
          )}
        >
          {isLoading ? (
            <Loader2 className="w-3.5 h-3.5 text-indigo-600 animate-spin" />
          ) : (
            <span
              className={cn(
                'w-2 h-2 rounded-full',
                checked ? 'bg-emerald-600' : 'bg-slate-400'
              )}
            />
          )}
        </span>
      </button>

      {/* Label and Description */}
      {(label || description) && (
        <div className="flex flex-col text-left">
          {label && (
            <label
              htmlFor={switchId}
              onClick={handleToggle}
              className={cn(
                'text-xs font-semibold text-slate-800 dark:text-slate-200',
                isDisabled ? 'cursor-not-allowed' : 'cursor-pointer'
              )}
            >
              {formatLabelWithAsterisk(label, isFieldRequired).content}
            </label>
          )}
          {description && (
            <span className="text-[11px] text-slate-500 dark:text-slate-400">
              {description}
            </span>
          )}
        </div>
      )}
    </div>
  );
};
