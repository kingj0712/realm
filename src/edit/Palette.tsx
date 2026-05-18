import type { FC } from 'react';
import { useMemo, useState } from 'react';
import { TILE_CATEGORIES, TILE_REGISTRY } from './tileRegistry';
import { useLayout } from './LayoutContext';
import { ModalPortal } from '../components/ModalPortal';

interface PaletteProps {
  open: boolean;
  onClose: () => void;
}

const ALL_CATEGORY = 'All';

export const Palette: FC<PaletteProps> = ({ open, onClose }) => {
  const { addTile } = useLayout();
  const [activeCat, setActiveCat] = useState<string>(ALL_CATEGORY);
  const [query, setQuery] = useState('');

  const tilesByCategory = useMemo(() => {
    const map: Record<string, typeof TILE_REGISTRY> = { [ALL_CATEGORY]: [...TILE_REGISTRY] };
    for (const tile of TILE_REGISTRY) {
      if (!map[tile.category]) map[tile.category] = [];
      map[tile.category].push(tile);
    }
    return map;
  }, []);

  const visible = useMemo(() => {
    const base = tilesByCategory[activeCat] ?? [];
    const q = query.trim().toLowerCase();
    if (!q) return base;
    return base.filter((t) =>
      t.name.toLowerCase().includes(q) ||
      t.type.toLowerCase().includes(q) ||
      t.description.toLowerCase().includes(q)
    );
  }, [tilesByCategory, activeCat, query]);

  if (!open) return null;

  return (
    <ModalPortal>
      <div className="palette-backdrop" onClick={onClose}>
        <div className="palette" onClick={(e) => e.stopPropagation()}>
          <div className="palette__head">
            <div className="palette__title">Add Tile</div>
            <button type="button" className="palette__close" onClick={onClose} aria-label="close">✕</button>
          </div>
          <div className="palette__search-wrap">
            <input
              type="text"
              className="palette__search"
              placeholder="Search by name, type, or description…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              autoFocus
            />
          </div>
          <div className="palette__body">
            <div className="palette__cats">
              <button
                type="button"
                className={`palette__cat${activeCat === ALL_CATEGORY ? ' palette__cat--active' : ''}`}
                onClick={() => setActiveCat(ALL_CATEGORY)}
              >
                All ({TILE_REGISTRY.length})
              </button>
              {TILE_CATEGORIES.map((cat) => {
                const count = (tilesByCategory[cat] ?? []).length;
                return (
                  <button
                    key={cat}
                    type="button"
                    className={`palette__cat${activeCat === cat ? ' palette__cat--active' : ''}`}
                    onClick={() => setActiveCat(cat)}
                  >
                    {cat} ({count})
                  </button>
                );
              })}
            </div>
            <div className="palette__tiles">
              {visible.length === 0 && (
                <div className="palette__empty">No tiles match &quot;{query}&quot;.</div>
              )}
              {visible.map((tile) => (
                <button
                  key={tile.type}
                  type="button"
                  className="palette__tile"
                  onClick={() => { addTile(tile.type); onClose(); }}
                >
                  <div className="palette__tile-name">{tile.name}</div>
                  <div className="palette__tile-cat">{tile.category}</div>
                  <div className="palette__tile-desc">{tile.description}</div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </ModalPortal>
  );
};
