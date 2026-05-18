import { useRef, type ChangeEvent, type FC, type ReactNode } from 'react';
import { useLayout } from './LayoutContext';

interface EditModeBannerProps {
  onAddTile: () => void;
  onConfigureAlarms: () => void;
  onOpenTemplates: () => void;
  onOpenRemap: () => void;
  onOpenSnapshots: () => void;
  onBuildFromHA: () => void;
}

// Grouped edit-mode toolbar. Buttons are clustered by intent so the toolbar
// scans calmly even with ten actions:
//   Add (Tile / Templates / Build From HA) | Configure (Remap / Alarms)
//   Backup (Snapshots / Export / Import)    | Danger (Reset) | Done
// All callbacks and underlying flows are unchanged from the flat layout.
export const EditModeBanner: FC<EditModeBannerProps> = ({
  onAddTile,
  onConfigureAlarms,
  onOpenTemplates,
  onOpenRemap,
  onOpenSnapshots,
  onBuildFromHA,
}) => {
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
    <div className="edit-banner" data-testid="edit-banner">
      <div className="edit-banner__lead">
        <span className="edit-banner__label">EDITING</span>
        <span className="edit-banner__hint">Drag handle · Click tile to edit · Drop wherever</span>
      </div>
      <div className="edit-banner__actions">
        <ActionGroup label="ADD">
          <button type="button" className="edit-banner__btn edit-banner__btn--primary" onClick={onAddTile} data-testid="edit-add-tile">+ TILE</button>
          <button type="button" className="edit-banner__btn" onClick={onOpenTemplates} data-testid="edit-templates">TEMPLATES</button>
          <button type="button" className="edit-banner__btn" onClick={onBuildFromHA} data-testid="edit-build-from-ha">BUILD FROM HA</button>
        </ActionGroup>
        <ActionGroup label="CONFIGURE">
          <button type="button" className="edit-banner__btn" onClick={onOpenRemap} data-testid="edit-remap">REMAP</button>
          <button type="button" className="edit-banner__btn" onClick={onConfigureAlarms} data-testid="edit-alarms">ALARMS</button>
        </ActionGroup>
        <ActionGroup label="BACKUP">
          <button type="button" className="edit-banner__btn" onClick={onOpenSnapshots} data-testid="edit-snapshots">SNAPSHOTS</button>
          <button type="button" className="edit-banner__btn" onClick={onExport} data-testid="edit-export">EXPORT</button>
          <button type="button" className="edit-banner__btn" onClick={() => fileInputRef.current?.click()} data-testid="edit-import">IMPORT</button>
        </ActionGroup>
        <ActionGroup label="DANGER" tone="danger">
          <button type="button" className="edit-banner__btn edit-banner__btn--danger" onClick={onReset} data-testid="edit-reset">RESET</button>
        </ActionGroup>
        <div className="edit-banner__group edit-banner__group--done">
          <button type="button" className="edit-banner__btn edit-banner__btn--done" onClick={() => setEditing(false)} data-testid="edit-done">DONE</button>
        </div>
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

const ActionGroup: FC<{ label: string; tone?: 'default' | 'danger'; children: ReactNode }> = ({ label, tone = 'default', children }) => (
  <div className={`edit-banner__group${tone === 'danger' ? ' edit-banner__group--danger' : ''}`}>
    <span className="edit-banner__group-label">{label}</span>
    <div className="edit-banner__group-actions">{children}</div>
  </div>
);
