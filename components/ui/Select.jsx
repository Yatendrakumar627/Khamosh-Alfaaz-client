import { Select as MantineSelect } from '@mantine/core';

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
      {...props}
    />
  );
};

Select.displayName = 'Select';

export { Select };
export default Select;