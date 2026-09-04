'use client';

import React, { useState, InputHTMLAttributes } from 'react';
import { cn } from '../../lib/utils';
import { Eye, EyeOff } from 'lucide-react';
import { Label } from './Label';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: React.ReactNode;
  isRequired?: boolean;
  error?: string;
  helperText?: string;
  leftElement?: React.ReactNode;
  rightElement?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      label,
      error,
      helperText,
      leftElement,
      rightElement,
      id,
      type,
      required,
      isRequired,
      ...props
    },
    ref
  ) => {
    const [showPassword, setShowPassword] = useState(false);
    const isFieldRequired = Boolean(required || isRequired);
    const inputId =
      id ||
      (typeof label === 'string'
        ? label.replace(/[*:]/g, '').trim().toLowerCase().replace(/[^a-z0-9]+/g, '-')
        : undefined);

    const isPasswordType = type === 'password';
    const computedType = isPasswordType ? (showPassword ? 'text' : 'password') : type;

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <Label htmlFor={inputId} required={isFieldRequired}>
            {label}
          </Label>
        )}
        <div className="relative flex items-center">
          {leftElement && (
            <div className="absolute left-3 flex items-center pointer-events-none text-slate-400">
              {leftElement}
            </div>
          )}
          <input
            ref={ref}
            id={inputId}
            type={computedType}
            className={cn(
              'w-full px-3 py-2 text-sm rounded-lg border bg-white text-slate-900 placeholder-slate-400 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-slate-50 disabled:text-slate-500 dark:bg-slate-900 dark:border-slate-700 dark:text-slate-100 dark:placeholder-slate-500 dark:focus:ring-indigo-500 dark:focus:border-indigo-500',
              error
                ? 'border-rose-500 focus:ring-rose-500 focus:border-rose-500 dark:border-rose-500'
                : 'border-slate-300 dark:border-slate-700',
              leftElement && 'pl-9',
              (rightElement || isPasswordType) && 'pr-10',
              className
            )}
            {...props}
          />
          {isPasswordType ? (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              className="absolute right-3 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 focus:outline-none transition-colors"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          ) : rightElement ? (
            <div className="absolute right-3 flex items-center text-slate-400">
              {rightElement}
            </div>
          ) : null}
        </div>
        {error ? (
          <p className="text-xs text-rose-500 dark:text-rose-400 font-medium">{error}</p>
        ) : helperText ? (
          <p className="text-xs text-slate-500 dark:text-slate-400">{helperText}</p>
        ) : null}
      </div>
    );
  }
);

Input.displayName = 'Input';
