import { useMemo, useState, type FC } from 'react';
import { TileModal } from '../components/tiles/TileModal';
import { useHass } from '../hass';
import { useLayout } from './LayoutContext';
import { scanStarterEntities, buildStarterLayout, type StarterSuggestion } from './starterFromLive';

interface StarterFromLiveModalProps {
  open: boolean;
  onClose: () => void;
}

// "Build from my HA" — scans live entities and offers a preview. The user can
// uncheck individual entities before committing. Refuses to do anything until
// they hit CREATE TAB, so this is opt-in. Empty live store → graceful empty
// state (no point suggesting layouts for the demo pool).
export const StarterFromLiveModal: FC<StarterFromLiveModalProps> = ({ open, onClose }) => {
  const store = useHass();
  const { addTabWithLayout } = useLayout();
  const [excluded, setExcluded] = useState<Set<string>>(new Set());

  const suggestions = useMemo(() => (open ? scanStarterEntities(store) : []), [open, store]);
  const grouped = useMemo(() => {
    const byDomain = new Map<string, StarterSuggestion[]>();
    for (const s of suggestions) {
      const arr = byDomain.get(s.domain) ?? [];
      arr.push(s);
      byDomain.set(s.domain, arr);
    }
    return Array.from(byDomain.entries());
  }, [suggestions]);

  if (!open) return null;

  const toggle = (entityId: string) => {
    setExcluded((prev) => {
      const next = new Set(prev);
      if (next.has(entityId)) next.delete(entityId);
      else next.add(entityId);
      return next;
    });
  };

  const onCreate = () => {
    const kept = suggestions.filter((s) => !excluded.has(s.entityId));
    if (kept.length === 0) return;
    const items = buildStarterLayout(kept, store);
    addTabWithLayout('Live HA Starter', items);
    setExcluded(new Set());
    onClose();
  };

  const onCancel = () => {
    setExcluded(new Set());
    onClose();
  };

  const keptCount = suggestions.length - excluded.size;

  return (
    <TileModal title="Build from my HA" subtitle="Suggested starter layout" onClose={onCancel} size="lg">
      <div className="starter-modal">
        <div className="starter-modal__summary">
          {suggestions.length === 0
            ? 'No live HA entities found yet. Connect Realm to Home Assistant first.'
            : `${suggestions.length} live entit${suggestions.length === 1 ? 'y' : 'ies'} suggested across ${grouped.length} domain${grouped.length === 1 ? '' : 's'}. Uncheck any you don't want.`}
        </div>

        {suggestions.length > 0 && (
          <div className="starter-modal__groups">
            {grouped.map(([domain, list]) => (
              <div key={domain} className="starter-group">
                <div className="starter-group__head">
                  {domain.toUpperCase()}
                  <span className="starter-group__count">{list.length}</span>
                </div>
                <div className="starter-group__rows">
                  {list.map((s) => {
                    const isKept = !excluded.has(s.entityId);
                    return (
                      <label key={s.entityId} className={`starter-row${isKept ? '' : ' starter-row--off'}`}>
                        <input
                          type="checkbox"
                          checked={isKept}
                          onChange={() => toggle(s.entityId)}
                        />
                        <span className="starter-row__id">{s.entityId}</span>
                        <span className="starter-row__name">{s.description}</span>
                        <span className="starter-row__tile">{s.tileType}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="starter-modal__footer">
          <button type="button" className="starter-modal__btn" onClick={onCancel}>Cancel</button>
          <button
            type="button"
            className="starter-modal__btn starter-modal__btn--primary"
            disabled={keptCount === 0}
            onClick={onCreate}
          >
            CREATE TAB ({keptCount})
          </button>
        </div>
      </div>
    </TileModal>
  );
};
