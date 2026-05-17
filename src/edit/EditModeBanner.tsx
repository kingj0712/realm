import type { FC } from 'react';
import { useLayout } from './LayoutContext';

interface EditModeBannerProps {
  onAddTile: () => void;
  onConfigureAlarms: () => void;
  onOpenTemplates: () => void;
}

export const EditModeBanner: FC<EditModeBannerProps> = ({ onAddTile, onConfigureAlarms, onOpenTemplates }) => {
  const { isEditing, setEditing, resetLayout } = useLayout();
  if (!isEditing) return null;

  const onReset = () => {
    if (window.confirm('Reset layout to defaults? This cannot be undone.')) {
      resetLayout();
    }
  };

  return (
    <div className="edit-banner">
      <span className="edit-banner__label">EDITING</span>
      <span className="edit-banner__hint">Drag handle · Click tile to edit · Drop wherever</span>
      <div className="edit-banner__actions">
        <button type="button" className="edit-banner__btn edit-banner__btn--primary" onClick={onAddTile}>+ ADD TILE</button>
        <button type="button" className="edit-banner__btn" onClick={onOpenTemplates}>TEMPLATES</button>
        <button type="button" className="edit-banner__btn" onClick={onConfigureAlarms}>ALARMS</button>
        <button type="button" className="edit-banner__btn" onClick={onReset}>RESET</button>
        <button type="button" className="edit-banner__btn edit-banner__btn--done" onClick={() => setEditing(false)}>DONE</button>
      </div>
    </div>
  );
};
