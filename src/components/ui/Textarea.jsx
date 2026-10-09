import { forwardRef, useCallback, useEffect, useRef, useState } from 'react';
import { Textarea as MantineTextarea } from '@mantine/core';
import { ChevronUp, ChevronDown } from 'lucide-react';

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
  const [showTop, setShowTop] = useState(false);
  const [showBottom, setShowBottom] = useState(false);

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

  const updateScrollIndicators = useCallback(() => {
    const el = inputRef.current;
    if (!el) return;
    const isScrollable = el.scrollHeight > el.clientHeight + 2;
    setShowTop(isScrollable && el.scrollTop > 4);
    setShowBottom(isScrollable && el.scrollTop + el.clientHeight < el.scrollHeight - 4);
  }, []);

  useEffect(() => {
    resize();
    updateScrollIndicators();
  }, [resize, updateScrollIndicators, value]);

  useEffect(() => {
    const id = requestAnimationFrame(() => { resize(); updateScrollIndicators(); });
    return () => cancelAnimationFrame(id);
  }, [resize, updateScrollIndicators]);

  const setRef = useCallback((el) => {
    inputRef.current = el;
    if (typeof ref === 'function') {
      ref(el);
    } else if (ref) {
      ref.current = el;
    }
  }, [ref]);

  const scrollTo = (target) => {
    const el = inputRef.current;
    if (!el) return;
    el.scrollTo({ top: target === 'top' ? 0 : el.scrollHeight, behavior: 'smooth' });
  };

  const handleScroll = (e) => {
    updateScrollIndicators();
    if (onScroll) onScroll(e);
  };

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
        onScroll={handleScroll}
        {...props}
      />
      {showTop && (
        <button
          type="button"
          onClick={() => scrollTo('top')}
          aria-label="Jump to first line"
          title="Jump to first line"
          className="textarea-nav textarea-nav-top"
        >
          <ChevronUp size={15} />
        </button>
      )}
      {showBottom && (
        <button
          type="button"
          onClick={() => scrollTo('bottom')}
          aria-label="Jump to last line"
          title="Jump to last line"
          className="textarea-nav textarea-nav-bottom"
        >
          <ChevronDown size={15} />
        </button>
      )}
    </div>
  );
});

Textarea.displayName = 'Textarea';

export { Textarea };
export default Textarea;
