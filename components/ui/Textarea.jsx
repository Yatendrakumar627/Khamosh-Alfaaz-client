import { forwardRef, useCallback, useEffect, useRef } from 'react';
import { Textarea as MantineTextarea } from '@mantine/core';

const Textarea = forwardRef(({
  label,
  error,
  hint,
  required,
  minRows = 10,
  maxRows,
  autosize = true,
  className,
  value,
  onScroll,
  ...props
}, ref) => {
  const inputRef = useRef(null);

  const resize = useCallback(() => {
    const el = inputRef.current;
    if (!el || !autosize) return;

    const style = window.getComputedStyle(el);
    const lineHeight = parseFloat(style.lineHeight) || 24;
    const padTop = parseFloat(style.paddingTop) || 0;
    const padBottom = parseFloat(style.paddingBottom) || 0;
    const extra = parseFloat(style.borderTopWidth) + parseFloat(style.borderBottomWidth) || 0;
    const padding = padTop + padBottom + extra;

    const minHeight = minRows ? minRows * lineHeight + padding : padding;
    const maxHeight = maxRows ? maxRows * lineHeight + padding : null;

    el.style.height = 'auto';
    const height = Math.max(minHeight, el.scrollHeight + 1);
    el.style.height = `${maxHeight ? Math.min(height, maxHeight) : height}px`;
    el.style.overflowY = maxHeight && height >= maxHeight ? 'auto' : 'hidden';
  }, [autosize, minRows, maxRows]);

  useEffect(() => {
    resize();
  }, [resize, value]);

  useEffect(() => {
    const id = requestAnimationFrame(() => { resize(); });
    return () => cancelAnimationFrame(id);
  }, [resize]);

  const setRef = useCallback((el) => {
    inputRef.current = el;
    if (typeof ref === 'function') {
      ref(el);
    } else if (ref) {
      ref.current = el;
    }
  }, [ref]);

  return (
    <div className="textarea-wrap" style={{ position: 'relative' }}>
      <MantineTextarea
        ref={setRef}
        label={label}
        error={error}
        description={hint}
        required={required}
        minRows={minRows}
        maxRows={maxRows}
        autosize={false}
        value={value}
        className={className}
        onScroll={onScroll}
        {...props}
      />
    </div>
  );
});

Textarea.displayName = 'Textarea';

export { Textarea };
export default Textarea;
