'use client';

import React from 'react';
import { cn } from '../../lib/utils';

export interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  children?: React.ReactNode;
  isRequired?: boolean;
  required?: boolean;
  className?: string;
}

/**
 * Parses label content and returns formatted ReactNode with a red asterisk
 * if either `required` / `isRequired` is true, or if the string ends with `*`.
 */
export function formatLabelWithAsterisk(
  label: React.ReactNode,
  required?: boolean
): { content: React.ReactNode; isRequired: boolean } {
  if (!label && label !== 0) {
    return { content: null, isRequired: Boolean(required) };
  }

  if (typeof label === 'string') {
    const trimmed = label.trim();
    // Match trailing asterisk optionally followed by colon, e.g. "Name *", "Name*", "Name *:"
    const match = trimmed.match(/^(.*?)\s*\*(\s*:)?$/);

    if (match) {
      const base = match[1];
      const colon = match[2] ? match[2].trim() : '';
      return {
        content: (
          <>
            {base}
            <span className="text-red-500 dark:text-red-400 font-bold ml-1" aria-hidden="true">
              *
            </span>
            {colon}
          </>
        ),
        isRequired: true,
      };
    }

    if (required) {
      return {
        content: (
          <>
            {trimmed}
            <span className="text-red-500 dark:text-red-400 font-bold ml-1" aria-hidden="true">
              *
            </span>
          </>
        ),
        isRequired: true,
      };
    }

    return { content: label, isRequired: false };
  }

  // If label is a JSX element / ReactNode and required is true
  if (required) {
    return {
      content: (
        <>
          {label}
          <span className="text-red-500 dark:text-red-400 font-bold ml-1" aria-hidden="true">
            *
          </span>
        </>
      ),
      isRequired: true,
    };
  }

  return { content: label, isRequired: false };
}

/**
 * Reusable accessible form Label component supporting red required asterisk.
 */
export const Label: React.FC<LabelProps> = ({
  children,
  isRequired,
  required,
  className,
  ...props
}) => {
  const { content } = formatLabelWithAsterisk(children, isRequired || required);

  if (!content) return null;

  return (
    <label
      className={cn('block text-xs font-semibold text-slate-700 dark:text-slate-300', className)}
      {...props}
    >
      {content}
    </label>
  );
};

Label.displayName = 'Label';
