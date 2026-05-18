import type { FC } from 'react';
import { useMemo, useState } from 'react';
import { useHass } from '../hass';

interface EntityPickerProps {
  value: string;
  onChange: (id: string) => void;
  // Allowed domains; when set, the picker hides anything outside the list and
  // doesn't render the domain chip row (the domain is forced).
  domains?: string[];
}

type SourceFilter = 'all' | 'live' | 'demo';

// Returns top N domains by entity count, optionally filtered to the allowed
// domain list. Used to populate the domain chip row.
function topDomains(all: string[], limit: number, allowedDomains?: string[]): string[] {
  const counts = new Map<string, number>();
  for (const id of all) {
    const dom = id.split('.')[0];
    if (allowedDomains && !allowedDomains.includes(dom)) continue;
    counts.set(dom, (counts.get(dom) ?? 0) + 1);
  }
  return Array.from(counts.entries())
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, limit)
    .map(([dom]) => dom);
}

export const EntityPicker: FC<EntityPickerProps> = ({ value, onChange, domains }) => {
  const store = useHass();
  const [query, setQuery] = useState('');
  const [domainFilter, setDomainFilter] = useState<string | null>(null);
  const [sourceFilter, setSourceFilter] = useState<SourceFilter>('all');

  const allIds = useMemo(() => Object.keys(store.getAllEntities()).sort(), [store]);
  const domainChips = useMemo(
    () => topDomains(allIds, 8, domains),
    [allIds, domains],
  );

  const matches = useMemo(() => {
    const q = query.trim().toLowerCase();
    // Start with allowed-domain filter (when set by the schema) before
    // applying the user's chip selection so the chips only narrow further.
    const allowedDomain = (id: string) => {
      const dom = id.split('.')[0];
      if (domains && domains.length > 0 && !domains.includes(dom)) return false;
      if (domainFilter && dom !== domainFilter) return false;
      return true;
    };
    const sourceMatches = (id: string) => {
      if (sourceFilter === 'all') return true;
      return store.getEntitySource(id) === sourceFilter;
    };
    const queryMatches = (id: string) => {
      if (!q) return true;
      const friendly = String(store.getEntity(id)?.attributes?.friendly_name ?? '').toLowerCase();
      return id.toLowerCase().includes(q) || friendly.includes(q);
    };
    return allIds
      .filter((id) => allowedDomain(id) && sourceMatches(id) && queryMatches(id))
      .sort((a, b) => {
        // LIVE entities first, then alpha by id.
        const sa = store.getEntitySource(a);
        const sb = store.getEntitySource(b);
        if (sa !== sb) return sa === 'live' ? -1 : 1;
        return a.localeCompare(b);
      });
  }, [allIds, store, query, domains, domainFilter, sourceFilter]);

  return (
    <div className="entity-picker">
      <input
        type="text"
        className="entity-picker__search"
        placeholder="search entities…"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />

      <div className="entity-picker__filters">
        <div className="entity-picker__filter-group">
          <span className="entity-picker__filter-label">SOURCE</span>
          {(['all', 'live', 'demo'] as const).map((s) => (
            <button
              key={s}
              type="button"
              className={`entity-picker__chip${sourceFilter === s ? ' entity-picker__chip--active' : ''}`}
              onClick={() => setSourceFilter(s)}
            >
              {s.toUpperCase()}
            </button>
          ))}
        </div>
        {(!domains || domains.length === 0) && domainChips.length > 1 && (
          <div className="entity-picker__filter-group entity-picker__filter-group--domains">
            <span className="entity-picker__filter-label">DOMAIN</span>
            <button
              type="button"
              className={`entity-picker__chip${domainFilter == null ? ' entity-picker__chip--active' : ''}`}
              onClick={() => setDomainFilter(null)}
            >
              ANY
            </button>
            {domainChips.map((dom) => (
              <button
                key={dom}
                type="button"
                className={`entity-picker__chip${domainFilter === dom ? ' entity-picker__chip--active' : ''}`}
                onClick={() => setDomainFilter((prev) => (prev === dom ? null : dom))}
              >
                {dom}
              </button>
            ))}
          </div>
        )}
      </div>

      <select
        className="entity-picker__select"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        size={Math.min(10, Math.max(3, matches.length))}
      >
        {matches.length === 0 && <option disabled>no matches</option>}
        {matches.map((id) => {
          const entity = store.getEntity(id);
          const friendly = entity?.attributes?.friendly_name;
          const source = store.getEntitySource(id).toUpperCase();
          const label = friendly ? `[${source}] ${id} - ${friendly}` : `[${source}] ${id}`;
          return <option key={id} value={id}>{label}</option>;
        })}
      </select>
      <div className="entity-picker__current">SELECTED: {value || 'none'}</div>
    </div>
  );
};
