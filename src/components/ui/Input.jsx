import { forwardRef } from 'react';
import { TextInput as MantineTextInput } from '@mantine/core';

const Input = forwardRef(({
  label,
  error,
  hint,
  required,
  className,
  ...props
}, ref) => {
  return (
    <MantineTextInput
      ref={ref}
      label={label}
      error={error}
      description={hint}
      required={required}
      className={className}
      {...props}
    />
  );
});

Input.displayName = 'Input';

export { Input };
export default Input;