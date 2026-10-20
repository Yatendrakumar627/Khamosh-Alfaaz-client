import { forwardRef } from 'react';
import { Button as MantineButton, Loader } from '@mantine/core';
import { classNames } from '../../utils/helpers';

const Button = forwardRef(({
  children,
  variant = 'filled',
  size = 'md',
  loading = false,
  fullWidth = false,
  leftIcon,
  rightIcon,
  className,
  disabled,
  ...props
}, ref) => {
  const baseStyles = {
    fontWeight: 500,
    borderRadius: '8px',
    transition: 'all 0.2s ease',
    ...(fullWidth && { width: '100%' }),
  };

  return (
    <MantineButton
      ref={ref}
      variant={variant}
      size={size}
      loading={loading}
      disabled={disabled || loading}
      className={classNames(baseStyles, className)}
      leftSection={leftIcon}
      rightSection={rightIcon}
      {...props}
    >
      {children}
    </MantineButton>
  );
});

Button.displayName = 'Button';

export { Button };
export default Button;