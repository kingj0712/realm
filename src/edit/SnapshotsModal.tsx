import { useState, type FC } from 'react';
import { TileModal } from '../components/tiles/TileModal';
import { useLayout, type LayoutSnapshot } from './LayoutContext';

interface SnapshotsModalProps {
  open: boolean;
  onClose: () => void;
}

// Local named snapshots manager. Sits alongside the file EXPORT/IMPORT
// buttons in EditModeBanner — file is for sharing across devices, snapshots
// are for quick "save before I try this" rollbacks on the same machine.
export const SnapshotsModal: FC<SnapshotsModalProps> = ({ open, onClose }) => {
  const { snapshots, saveSnapshot, restoreSnapshot, renameSnapshot, deleteSnapshot, exportSnapshot, tabs } = useLayout();
  const [newName, setNewName] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [confirmRestoreId, setConfirmRestoreId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  if (!open) return null;

  const onSave = () => {
    const trimmed = newName.trim();
    saveSnapshot(trimmed || `Snapshot ${new Date().toLocaleString()}`);
    setNewName('');
  };

  const onDownload = (snap: LayoutSnapshot) => {
    const data = exportSnapshot(snap.id);
    if (!data) return;
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const slug = snap.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'snapshot';
    const link = document.createElement('a');
    link.href = url;
    link.download = `realm-snapshot-${slug}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const beginRename = (snap: LayoutSnapshot) => {
    setEditingId(snap.id);
    setEditName(snap.name);
  };
  const commitRename = () => {
    if (editingId) renameSnapshot(editingId, editName.trim() || 'Untitled snapshot');
    setEditingId(null);
    setEditName('');
  };

  const formatDate = (iso: string) => {
    try {
      const d = new Date(iso);
      return d.toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });
    } catch {
      return iso;
    }
  };

  return (
    <TileModal title="Layout Snapshots" subtitle={`${tabs.length} tab${tabs.length === 1 ? '' : 's'} in current layout`} onClose={onClose} size="lg">
      <div className="snap-modal">
        <div className="snap-modal__hint">
          Snapshots save your current dashboard locally. Quick rollback for "let me try something new" — your file EXPORT button is still the way to share across devices.
        </div>

        <div className="snap-modal__save">
          <input
            type="text"
            className="snap-modal__input"
            placeholder="Snapshot name (optional)"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') onSave(); }}
          />
          <button type="button" className="snap-modal__btn snap-modal__btn--primary" onClick={onSave}>
            SAVE CURRENT LAYOUT
          </button>
        </div>

        {snapshots.length === 0 ? (
          <div className="snap-modal__empty">No snapshots yet. Save one to start a rollback history.</div>
        ) : (
          <div className="snap-modal__list">
            {snapshots.map((snap) => {
              const isEditing = editingId === snap.id;
              const isConfirmRestore = confirmRestoreId === snap.id;
              const isConfirmDelete = confirmDeleteId === snap.id;
              const tabCount = snap.state.tabs?.length ?? 0;
              return (
                <div key={snap.id} className="snap-row">
                  <div className="snap-row__head">
                    {isEditing ? (
                      <input
                        type="text"
                        className="snap-modal__input"
                        autoFocus
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        onBlur={commitRename}
                        onKeyDown={(e) => { if (e.key === 'Enter') commitRename(); if (e.key === 'Escape') { setEditingId(null); setEditName(''); } }}
                      />
                    ) : (
                      <div className="snap-row__title">{snap.name}</div>
                    )}
                    <div className="snap-row__meta">
                      <span className="snap-row__date">{formatDate(snap.createdAt)}</span>
                      <span className="snap-row__count">{tabCount} tab{tabCount === 1 ? '' : 's'}</span>
                    </div>
                  </div>
                  <div className="snap-row__actions">
                    {isConfirmRestore ? (
                      <>
                        <span className="snap-row__confirm-text">Restore? Current layout will be replaced.</span>
                        <button type="button" className="snap-modal__btn snap-modal__btn--primary" onClick={() => { restoreSnapshot(snap.id); setConfirmRestoreId(null); onClose(); }}>YES, RESTORE</button>
                        <button type="button" className="snap-modal__btn" onClick={() => setConfirmRestoreId(null)}>Cancel</button>
                      </>
                    ) : isConfirmDelete ? (
                      <>
                        <span className="snap-row__confirm-text">Delete forever?</span>
                        <button type="button" className="snap-modal__btn snap-modal__btn--danger" onClick={() => { deleteSnapshot(snap.id); setConfirmDeleteId(null); }}>YES, DELETE</button>
                        <button type="button" className="snap-modal__btn" onClick={() => setConfirmDeleteId(null)}>Cancel</button>
                      </>
                    ) : (
                      <>
                        <button type="button" className="snap-modal__btn snap-modal__btn--primary" onClick={() => setConfirmRestoreId(snap.id)}>Restore</button>
                        <button type="button" className="snap-modal__btn" onClick={() => beginRename(snap)}>Rename</button>
                        <button type="button" className="snap-modal__btn" onClick={() => onDownload(snap)}>Export</button>
                        <button type="button" className="snap-modal__btn snap-modal__btn--danger-ghost" onClick={() => setConfirmDeleteId(snap.id)}>Delete</button>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </TileModal>
  );
};
