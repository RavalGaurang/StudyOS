import React from 'react';
import { Control, Controller, FieldValues, Path } from 'react-hook-form';
import { Select, SelectProps } from './Select';

export interface FormSelectProps<T extends FieldValues>
  extends Omit<SelectProps, 'name' | 'defaultValue'> {
  name: Path<T>;
  control: Control<T>;
}

export function FormSelect<T extends FieldValues>({
  name,
  control,
  ...props
}: FormSelectProps<T>) {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) => (
        <Select
          {...props}
          name={field.name}
          onBlur={field.onBlur}
          value={field.value ?? ''}
          onChange={(e: any) => {
            const val = e?.target ? e.target.value : e?.value !== undefined ? e.value : e;
            field.onChange(val);
          }}
          error={error?.message}
        />
      )}
    />
  );
}
