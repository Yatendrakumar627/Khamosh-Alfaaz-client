import { Select as MantineSelect } from '@mantine/core';
import { classNames } from '../../utils/helpers';

const Select = ({ label, error, hint, required, placeholder = 'Select...', data = [], className, ...props }) => {
  return (
    <MantineSelect
      label={label}
      error={error}
      description={hint}
      required={required}
      placeholder={placeholder}
      data={data}
      className={className}
      styles={(theme) => ({
        input: {
          backgroundColor: 'var(--input-bg)',
          borderColor: 'var(--input-border)',
          color: 'var(--ink)',
          '&:focus': {
            borderColor: 'var(--input-focus-border)',
          },
        },
        dropdown: {
          backgroundColor: 'var(--paper)',
          borderColor: 'var(--border)',
        },
        item: {
          color: 'var(--ink)',
          '&:hover': {
            backgroundColor: 'var(--hover-bg)',
          },
          '&[data-selected]': {
            backgroundColor: 'var(--active-bg)',
            color: 'var(--ink)',
            fontWeight: 500,
          },
        },
      })}
      {...props}
    />
  );
};

export { Select };
export default Select;