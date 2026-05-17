import { useEffect, useRef, useState, type FC, type KeyboardEvent as ReactKeyboardEvent } from 'react';
import { useLayout } from './LayoutContext';

export const TabBar: FC = () => {
  const { tabs, activeTabId, switchTab, addTab, renameTab, deleteTab, isEditing } = useLayout();
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [draftName, setDraftName] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  // Autofocus the input when rename starts (state set before this paint).
  useEffect(() => {
    if (renamingId && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [renamingId]);

  // Leaving edit mode mid-rename cancels the rename rather than committing
  // a possibly-empty draft.
  useEffect(() => {
    if (!isEditing) setRenamingId(null);
  }, [isEditing]);

  const startRename = (id: string, current: string) => {
    setRenamingId(id);
    setDraftName(current);
  };
  const commitRename = () => {
    if (!renamingId) return;
    const next = draftName.trim();
    if (next) renameTab(renamingId, next);
    setRenamingId(null);
  };
  const cancelRename = () => setRenamingId(null);

  const onKey = (e: ReactKeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') { e.preventDefault(); commitRename(); }
    else if (e.key === 'Escape') { e.preventDefault(); cancelRename(); }
  };

  const onDelete = (id: string, name: string) => {
    if (window.confirm(`Delete tab "${name}"? This removes its tiles.`)) deleteTab(id);
  };

  return (
    <div className="tab-bar">
      {tabs.map((t) => {
        const active = t.id === activeTabId;
        const renaming = renamingId === t.id;
        return (
          <div key={t.id} className={`tab-bar__tab${active ? ' tab-bar__tab--active' : ''}`}>
            {renaming ? (
              <input
                ref={inputRef}
                type="text"
                className="tab-bar__rename"
                value={draftName}
                onChange={(e) => setDraftName(e.target.value)}
                onBlur={commitRename}
                onKeyDown={onKey}
                aria-label="rename tab"
              />
            ) : (
              <button
                type="button"
                className="tab-bar__label"
                onClick={() => switchTab(t.id)}
                onDoubleClick={isEditing ? () => startRename(t.id, t.name) : undefined}
                title={isEditing ? 'Double-click to rename' : t.name}
              >
                {t.name}
              </button>
            )}
            {isEditing && active && !renaming && (
              <>
                <button
                  type="button"
                  className="tab-bar__icon"
                  onClick={() => startRename(t.id, t.name)}
                  aria-label="rename"
                  title="Rename"
                >
                  ✎
                </button>
                {tabs.length > 1 && (
                  <button
                    type="button"
                    className="tab-bar__icon tab-bar__icon--danger"
                    onClick={() => onDelete(t.id, t.name)}
                    aria-label="delete tab"
                    title="Delete tab"
                  >
                    ✕
                  </button>
                )}
              </>
            )}
          </div>
        );
      })}
      {isEditing && (
        <button type="button" className="tab-bar__add" onClick={() => addTab()} aria-label="add tab" title="Add tab">
          +
        </button>
      )}
    </div>
  );
};
