import type { FC } from 'react';
import { TileModal } from './tiles/TileModal';

interface ConfirmModalProps {
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  // Style hint: 'caution' uses warn accents (default), 'danger' uses alarm reds.
  tone?: 'caution' | 'danger';
  onConfirm: () => void;
  onCancel: () => void;
}

// Lightweight confirmation modal for consequential actions: garage doors,
// locks, remote start, etc. Avoids `window.confirm` because that pops up
// outside the panel's shadow root and breaks the SCADA aesthetic.
export const ConfirmModal: FC<ConfirmModalProps> = ({
  title = 'Confirm action',
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  tone = 'caution',
  onConfirm,
  onCancel,
}) => (
  <TileModal title={title} onClose={onCancel} size="sm">
    <div className="confirm-modal">
      <div className="confirm-modal__msg">{message}</div>
      <div className="confirm-modal__actions">
        <button type="button" className="confirm-modal__btn" onClick={onCancel}>
          {cancelText}
        </button>
        <button
          type="button"
          className={`confirm-modal__btn confirm-modal__btn--${tone}`}
          onClick={onConfirm}
          autoFocus
        >
          {confirmText}
        </button>
      </div>
    </div>
  </TileModal>
);
