import type { FC, MouseEvent, ReactNode } from 'react';
import { useEffect } from 'react';
import { ModalPortal } from '../ModalPortal';

interface TileModalProps {
  title: string;
  subtitle?: string;
  size?: 'sm' | 'md' | 'lg';
  pill?: string;
  onClose: () => void;
  children: ReactNode;
}

// Generic modal wrapper used by tiles to show extended detail (history,
// secondary metrics, full forecast, etc.). Close on backdrop click or Esc.
// Rendered via a portal so RGL's grid-item transforms can't trap it.
export const TileModal: FC<TileModalProps> = ({ title, subtitle, size = 'md', pill, onClose, children }) => {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  const stop = (e: MouseEvent) => e.stopPropagation();

  return (
    <ModalPortal>
      <div className="tile-modal-backdrop" onClick={onClose}>
        <div className={`tile-modal tile-modal--${size}`} onClick={stop} role="dialog">
          <div className="tile-modal__head">
            <div className="tile-modal__head-titles">
              <div className="tile-modal__title">{title}</div>
              {subtitle && <div className="tile-modal__subtitle">{subtitle}</div>}
            </div>
            {pill && <span className="tile-modal__pill">{pill}</span>}
            <button type="button" className="tile-modal__close" onClick={onClose} aria-label="close">✕</button>
          </div>
          <div className="tile-modal__body">{children}</div>
        </div>
      </div>
    </ModalPortal>
  );
};
