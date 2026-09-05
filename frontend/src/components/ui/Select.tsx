'use client';

import React from 'react';
import ReactSelect, { StylesConfig, Props as ReactSelectProps } from 'react-select';
import { cn } from '../../lib/utils';
import { Label } from './Label';

export interface SelectOption {
  value: string | number;
  label: string;
}

export interface SelectProps {
  name?: string;
  id?: string;
  label?: React.ReactNode;
  required?: boolean;
  isRequired?: boolean;
  error?: string;
  helperText?: string;
  options: SelectOption[];
  value?: string | number | SelectOption | null;
  defaultValue?: string | number | SelectOption | null;
  placeholder?: string;
  disabled?: boolean;
  isSearchable?: boolean;
  isClearable?: boolean;
  isMulti?: boolean;
  className?: string;
  onChange?: (event: any) => void;
  onBlur?: (event: any) => void;
}

export const Select = React.forwardRef<any, SelectProps>(
  (
    {
      name,
      id,
      label,
      required,
      isRequired,
      error,
      helperText,
      options,
      value,
      defaultValue,
      placeholder = 'Select an option...',
      disabled = false,
      isSearchable = true,
      isClearable = false,
      isMulti = false,
      className,
      onChange,
      onBlur,
    },
    ref
  ) => {
    const isFieldRequired = Boolean(required || isRequired);
    const inputId =
      id ||
      (typeof label === 'string'
        ? label.replace(/[*:]/g, '').trim().toLowerCase().replace(/[^a-z0-9]+/g, '-')
        : undefined);

    // Map string/number value to SelectOption object
    const getOptionFromValue = (rawVal: any) => {
      if (rawVal === null || rawVal === undefined || rawVal === '') return null;
      // If an event object or target object was passed accidentally, extract inner value
      let val = rawVal?.target?.value !== undefined ? rawVal.target.value : (rawVal?.target ? rawVal.target : rawVal);
      if (typeof val === 'object' && val !== null && 'value' in val && !('label' in val)) {
        val = val.value;
      }
      if (typeof val === 'object' && val !== null && 'value' in val && 'label' in val) {
        return val;
      }
      const found = options.find((opt) => String(opt.value) === String(val));
      if (found) return found;
      return {
        value: typeof val === 'object' ? (val?.value ?? '') : val,
        label: typeof val === 'object' ? String(val?.label || val?.value || '') : String(val),
      };
    };

    const selectedValue = Array.isArray(value)
      ? value.map(getOptionFromValue).filter(Boolean)
      : getOptionFromValue(value);

    const defaultSelectedValue = Array.isArray(defaultValue)
      ? defaultValue.map(getOptionFromValue).filter(Boolean)
      : getOptionFromValue(defaultValue);

    const customStyles: StylesConfig<any, boolean> = {
      control: (provided, state) => ({
        ...provided,
        backgroundColor: 'var(--select-bg, #ffffff)',
        borderColor: error
          ? '#F43F5E'
          : state.isFocused
          ? '#6366F1'
          : '#CBD5E1',
        borderRadius: '0.5rem',
        padding: '1px 2px',
        fontSize: '0.875rem',
        boxShadow: state.isFocused ? '0 0 0 2px rgba(99, 102, 241, 0.2)' : 'none',
        '&:hover': {
          borderColor: state.isFocused ? '#6366F1' : '#94A3B8',
        },
        cursor: 'pointer',
        minHeight: '38px',
      }),
      menu: (provided) => ({
        ...provided,
        backgroundColor: 'var(--select-menu-bg, #ffffff)',
        borderRadius: '0.75rem',
        border: '1px solid var(--select-border, #E2E8F0)',
        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
        zIndex: 9999,
        overflow: 'hidden',
      }),
      menuList: (provided) => ({
        ...provided,
        padding: '4px',
      }),
      option: (provided, state) => ({
        ...provided,
        backgroundColor: state.isSelected
          ? '#6366F1'
          : state.isFocused
          ? 'var(--select-option-hover, #F1F5F9)'
          : 'transparent',
        color: state.isSelected
          ? '#ffffff'
          : 'var(--select-text, #1E293B)',
        borderRadius: '0.375rem',
        fontSize: '0.8125rem',
        fontWeight: state.isSelected ? 600 : 500,
        padding: '8px 12px',
        cursor: 'pointer',
        '&:active': {
          backgroundColor: '#4F46E5',
          color: '#ffffff',
        },
      }),
      singleValue: (provided) => ({
        ...provided,
        color: 'var(--select-text, #0F172A)',
        fontSize: '0.875rem',
        fontWeight: 500,
      }),
      input: (provided) => ({
        ...provided,
        color: 'var(--select-text, #0F172A)',
      }),
      placeholder: (provided) => ({
        ...provided,
        color: '#94A3B8',
        fontSize: '0.875rem',
      }),
      dropdownIndicator: (provided, state) => ({
        ...provided,
        color: state.isFocused ? '#6366F1' : '#94A3B8',
        '&:hover': {
          color: '#6366F1',
        },
      }),
      indicatorSeparator: () => ({
        display: 'none',
      }),
    };

    const handleChange = (selectedOption: any) => {
      if (!onChange) return;
      if (isMulti) {
        const values = selectedOption ? selectedOption.map((opt: any) => opt.value) : [];
        onChange({ target: { name, value: values }, value: values });
      } else {
        const val = selectedOption ? selectedOption.value : '';
        onChange({ target: { name, value: val }, value: val });
      }
    };

    return (
      <div className={cn('w-full space-y-1.5 studyos-select-container', className)}>
        {label && (
          <Label htmlFor={inputId} required={isFieldRequired}>
            {label}
          </Label>
        )}
        <div className="relative">
          <ReactSelect
            ref={ref}
            inputId={inputId}
            name={name}
            value={value !== undefined ? selectedValue : undefined}
            defaultValue={defaultSelectedValue}
            options={options}
            styles={customStyles}
            placeholder={placeholder}
            isDisabled={disabled}
            isSearchable={isSearchable}
            isClearable={isClearable}
            isMulti={isMulti}
            onChange={handleChange}
            onBlur={onBlur}
            classNamePrefix="studyos-select"
          />
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

Select.displayName = 'Select';
