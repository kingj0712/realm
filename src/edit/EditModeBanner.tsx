import { useRef, type ChangeEvent, type FC } from 'react';
import { useLayout } from './LayoutContext';

interface EditModeBannerProps {
  onAddTile: () => void;
  onConfigureAlarms: () => void;
  onOpenTemplates: () => void;
  onOpenRemap: () => void;
  onOpenSnapshots: () => void;
  onBuildFromHA: () => void;
}

export const EditModeBanner: FC<EditModeBannerProps> = ({ onAddTile, onConfigureAlarms, onOpenTemplates, onOpenRemap, onOpenSnapshots, onBuildFromHA }) => {
  const { isEditing, setEditing, resetLayout, exportLayout, importLayout } = useLayout();
  const fileInputRef = useRef<HTMLInputElement>(null);
  if (!isEditing) return null;

  const onReset = () => {
    if (window.confirm('Reset layout to defaults? This cannot be undone.')) {
      resetLayout();
    }
  };

  const onExport = () => {
    const blob = new Blob([exportLayout()], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const stamp = new Date().toISOString().slice(0, 10);
    const link = document.createElement('a');
    link.href = url;
    link.download = `realm-layout-${stamp}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const onImport = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.currentTarget.files?.[0];
    event.currentTarget.value = '';
    if (!file) return;
    try {
      const raw = await file.text();
      importLayout(raw);
    } catch (e) {
      window.alert(e instanceof Error ? e.message : 'Could not import layout snapshot.');
    }
  };

  return (
    <div className="edit-banner">
      <span className="edit-banner__label">EDITING</span>
      <span className="edit-banner__hint">Drag handle · Click tile to edit · Drop wherever</span>
      <div className="edit-banner__actions">
        <button type="button" className="edit-banner__btn edit-banner__btn--primary" onClick={onAddTile}>+ ADD TILE</button>
        <button type="button" className="edit-banner__btn" onClick={onOpenTemplates}>TEMPLATES</button>
        <button type="button" className="edit-banner__btn" onClick={onBuildFromHA}>BUILD FROM HA</button>
        <button type="button" className="edit-banner__btn" onClick={onOpenRemap}>REMAP</button>
        <button type="button" className="edit-banner__btn" onClick={onConfigureAlarms}>ALARMS</button>
        <button type="button" className="edit-banner__btn" onClick={onOpenSnapshots}>SNAPSHOTS</button>
        <button type="button" className="edit-banner__btn" onClick={onExport}>EXPORT</button>
        <button type="button" className="edit-banner__btn" onClick={() => fileInputRef.current?.click()}>IMPORT</button>
        <button type="button" className="edit-banner__btn" onClick={onReset}>RESET</button>
        <button type="button" className="edit-banner__btn edit-banner__btn--done" onClick={() => setEditing(false)}>DONE</button>
      </div>
      <input
        ref={fileInputRef}
        type="file"
        accept="application/json,.json"
        className="edit-banner__file"
        onChange={onImport}
      />
    </div>
  );
};
