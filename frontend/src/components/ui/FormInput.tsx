import React from 'react';
import { Control, Controller, FieldValues, Path } from 'react-hook-form';
import { Input, InputProps } from './Input';

export interface FormInputProps<T extends FieldValues>
  extends Omit<InputProps, 'name' | 'defaultValue'> {
  name: Path<T>;
  control: Control<T>;
}

export function FormInput<T extends FieldValues>({
  name,
  control,
  ...props
}: FormInputProps<T>) {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) => (
        <Input
          {...props}
          {...field}
          value={field.value ?? ''}
          error={error?.message}
        />
      )}
    />
  );
}
