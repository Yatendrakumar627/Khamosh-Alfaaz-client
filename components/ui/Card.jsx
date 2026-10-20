import { forwardRef } from 'react';
import { Card as MantineCard, Paper as MantinePaper } from '@mantine/core';
import { classNames } from '../../utils/helpers';

const Card = forwardRef(({
  children,
  hover = false,
  padded = true,
  withBorder = true,
  shadow = 'sm',
  radius = 'lg',
  className,
  style,
  ...props
}, ref) => {
  return (
    <MantineCard
      ref={ref}
      withBorder={withBorder}
      shadow={shadow}
      radius={radius}
      p={padded ? 'lg' : 0}
      className={classNames(
        'diary-page paper-texture transition-all duration-200',
        hover && 'hover:shadow-lg hover:-translate-y-0.5 cursor-pointer',
        className
      )}
      style={{
        backgroundColor: 'var(--paper)',
        borderColor: 'var(--border)',
        ...style,
      }}
      {...props}
    >
      {children}
    </MantineCard>
  );
});

Card.displayName = 'Card';

export const Paper = forwardRef(({
  children,
  padded = true,
  withBorder = true,
  shadow = 'sm',
  radius = 'lg',
  className,
  style,
  ...props
}, ref) => {
  return (
    <MantinePaper
      ref={ref}
      withBorder={withBorder}
      shadow={shadow}
      radius={radius}
      p={padded ? 'lg' : 0}
      className={classNames('paper-texture', className)}
      style={{
        backgroundColor: 'var(--paper)',
        borderColor: 'var(--border)',
        ...style,
      }}
      {...props}
    >
      {children}
    </MantinePaper>
  );
});

Paper.displayName = 'Paper';

export default Card;