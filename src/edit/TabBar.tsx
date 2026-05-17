import type { FC } from 'react';
import { useLayout } from './LayoutContext';

export const TabBar: FC = () => {
  const { tabs, activeTabId, switchTab, addTab, renameTab, deleteTab, isEditing } = useLayout();

  const onRename = (id: string, current: string) => {
    const next = window.prompt('Tab name:', current);
    if (next && next.trim() && next.trim() !== current) renameTab(id, next.trim());
  };

  const onDelete = (id: string, name: string) => {
    if (window.confirm(`Delete tab "${name}"? This removes its tiles.`)) deleteTab(id);
  };

  return (
    <div className="tab-bar">
      {tabs.map((t) => {
        const active = t.id === activeTabId;
        return (
          <div key={t.id} className={`tab-bar__tab${active ? ' tab-bar__tab--active' : ''}`}>
            <button
              type="button"
              className="tab-bar__label"
              onClick={() => switchTab(t.id)}
              onDoubleClick={isEditing ? () => onRename(t.id, t.name) : undefined}
              title={isEditing ? 'Double-click to rename' : t.name}
            >
              {t.name}
            </button>
            {isEditing && active && (
              <>
                <button
                  type="button"
                  className="tab-bar__icon"
                  onClick={() => onRename(t.id, t.name)}
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
