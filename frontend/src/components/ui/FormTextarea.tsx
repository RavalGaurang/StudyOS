import React from 'react';
import { Control, Controller, FieldValues, Path } from 'react-hook-form';
import { Textarea, TextareaProps } from './Textarea';

export interface FormTextareaProps<T extends FieldValues>
  extends Omit<TextareaProps, 'name' | 'defaultValue'> {
  name: Path<T>;
  control: Control<T>;
}

export function FormTextarea<T extends FieldValues>({
  name,
  control,
  ...props
}: FormTextareaProps<T>) {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) => (
        <Textarea
          {...props}
          {...field}
          value={field.value ?? ''}
          error={error?.message}
        />
      )}
    />
  );
}
