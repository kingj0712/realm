import type { FC } from 'react';
import { useMemo, useState } from 'react';
import { TileModal } from '../components/tiles/TileModal';
import { EntityPicker } from './EntityPicker';
import { useLayout } from './LayoutContext';
import { useHass } from '../hass';
import { tallyEntityUsage, replaceEntityIds } from './entityRemap';

interface RemapEntitiesModalProps {
  open: boolean;
  onClose: () => void;
}

// Edit-mode helper: scans every tile on the active tab, finds entity-id-looking
// strings the dashboard depends on, filters to the ones HassStore considers
// DEMO, and lets the user swap in a LIVE entity per row in one batch apply.
export const RemapEntitiesModal: FC<RemapEntitiesModalProps> = ({ open, onClose }) => {
  const { activeTab, updateTile } = useLayout();
  const store = useHass();
  const [mappings, setMappings] = useState<Record<string, string>>({});

  // Tally usage on the active tab, then filter to demo-only entities. We don't
  // pre-filter inside tallyEntityUsage so future variants (e.g. "show all")
  // can use the same helper without re-walking the tree.
  const demoUsages = useMemo(() => {
    if (!open) return [];
    return tallyEntityUsage(activeTab.items).filter((u) => store.getEntitySource(u.entityId) === 'demo');
  }, [open, activeTab.items, store]);

  if (!open) return null;

  const setMapping = (from: string, to: string) => {
    setMappings((prev) => {
      const next = { ...prev };
      if (!to || to === from) delete next[from];
      else next[from] = to;
      return next;
    });
  };

  const mappingCount = Object.keys(mappings).length;

  const apply = () => {
    if (mappingCount === 0) return;
    for (const item of activeTab.items) {
      const nextProps = replaceEntityIds(item.props, mappings) as Record<string, unknown>;
      // Skip the round-trip update when nothing changed for this tile.
      if (JSON.stringify(nextProps) === JSON.stringify(item.props)) continue;
      updateTile(item.id, (it) => ({ ...it, props: nextProps }));
    }
    setMappings({});
    onClose();
  };

  const cancel = () => {
    setMappings({});
    onClose();
  };

  const summary = demoUsages.length === 0
    ? 'No demo entities found on this tab.'
    : `${demoUsages.length} demo entit${demoUsages.length === 1 ? 'y' : 'ies'} found on this tab.`;

  return (
    <TileModal title="Remap Entities" subtitle={activeTab.name} onClose={cancel} size="lg">
      <div className="remap-modal">
        <div className="remap-modal__summary">
          <span className="remap-modal__summary-text">{summary}</span>
          {mappingCount > 0 && (
            <span className="remap-modal__summary-pending">
              {mappingCount} mapping{mappingCount === 1 ? '' : 's'} ready
            </span>
          )}
        </div>
        <div className="remap-modal__hint">
          Replacements apply only to the current tab. Tiles, layout, and unmapped entities are left alone.
          Tip: export the layout first if you want a rollback point.
        </div>

        {demoUsages.length > 0 && (
          <div className="remap-modal__rows">
            {demoUsages.map((u) => {
              const entity = store.getEntity(u.entityId);
              const friendly = entity?.attributes?.friendly_name as string | undefined;
              const domain = u.entityId.split('.')[0];
              const target = mappings[u.entityId] ?? '';
              return (
                <div key={u.entityId} className="remap-row">
                  <div className="remap-row__from">
                    <div className="remap-row__id">{u.entityId}</div>
                    {friendly && <div className="remap-row__friendly">{friendly}</div>}
                    <div className="remap-row__meta">
                      <span className="remap-row__chip">DEMO</span>
                      <span className="remap-row__count">used {u.count}×</span>
                    </div>
                  </div>
                  <div className="remap-row__arrow" aria-hidden>→</div>
                  <div className="remap-row__to">
                    <EntityPicker
                      value={target}
                      onChange={(id) => setMapping(u.entityId, id)}
                      domains={[domain]}
                    />
                    {target && (
                      <div className={`remap-row__target remap-row__target--${store.getEntitySource(target)}`}>
                        will replace with <strong>{target}</strong>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="remap-modal__footer">
          <button type="button" className="remap-modal__btn" onClick={cancel}>
            Cancel
          </button>
          <button
            type="button"
            className="remap-modal__btn remap-modal__btn--primary"
            disabled={mappingCount === 0}
            onClick={apply}
          >
            Apply mappings ({mappingCount})
          </button>
        </div>
      </div>
    </TileModal>
  );
};
