import { forwardRef } from 'react';
import { TextInput as MantineTextInput } from '@mantine/core';

const Input = forwardRef(({
  label,
  error,
  hint,
  required,
  className,
  leftIcon,
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
      leftSection={leftIcon}
      {...props}
    />
  );
});

Input.displayName = 'Input';

export { Input };
export default Input;