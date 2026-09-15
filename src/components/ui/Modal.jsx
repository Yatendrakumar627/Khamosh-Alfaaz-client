import { Modal as MantineModal, Button } from '@mantine/core';
import { classNames } from '../../utils/helpers';

export const Modal = ({ opened, onClose, title, children, size = 'md', centered = true, ...props }) => {
  return (
    <MantineModal
      opened={opened}
      onClose={onClose}
      title={title}
      size={size}
      centered={centered}
      styles={(theme) => ({
        content: {
          backgroundColor: 'var(--paper)',
          borderColor: 'var(--border)',
        },
        header: {
          backgroundColor: 'var(--paper-dark)',
          borderBottom: '1px solid var(--border)',
          padding: theme.spacing.lg,
        },
        title: {
          color: 'var(--ink)',
          fontFamily: 'var(--font-family-heading)',
          fontWeight: 600,
        },
        body: {
          padding: theme.spacing.lg,
        },
        footer: {
          borderTopColor: 'var(--border)',
          padding: theme.spacing.lg,
        },
        close: {
          color: 'var(--ink-muted)',
          '&:hover': {
            backgroundColor: 'var(--hover-bg)',
            color: 'var(--ink)',
          },
        },
      })}
      {...props}
    >
      {children}
    </MantineModal>
  );
};

export const ConfirmDialog = ({ opened, onClose, onConfirm, title, message, confirmLabel = 'Confirm', cancelLabel = 'Cancel', loading = false, variant = 'danger', children }) => {
  if (children) {
    return (
      <Modal opened={opened} onClose={onClose} title={title} size="sm">
        {children}
      </Modal>
    );
  }

  return (
    <Modal opened={opened} onClose={onClose} title={title} size="sm">
      <div style={{ color: 'var(--ink)', marginBottom: 'var(--spacing-lg)' }}>
        {message}
      </div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--spacing-md)' }}>
        <Button variant="subtle" onClick={onClose} disabled={loading}>
          {cancelLabel}
        </Button>
        <Button
          variant="filled"
          onClick={onConfirm}
          loading={loading}
          style={variant === 'danger' ? { backgroundColor: 'var(--error)', borderColor: 'var(--error)', color: 'var(--paper)' } : undefined}
        >
          {confirmLabel}
        </Button>
      </div>
    </Modal>
  );
};

export const AlertDialog = ({ opened, onClose, title, message, confirmLabel = 'OK', children }) => {
  return (
    <Modal opened={opened} onClose={onClose} title={title} size="sm">
      {children || (
        <>
          <div style={{ color: 'var(--ink)', marginBottom: 'var(--spacing-lg)' }}>
            {message}
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button variant="filled" color="brown" onClick={onClose}>
              {confirmLabel}
            </Button>
          </div>
        </>
      )}
    </Modal>
  );
};