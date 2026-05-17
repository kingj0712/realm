import type { FC } from 'react';
import { useMemo, useState } from 'react';
import { useHass } from '../hass';

interface EntityPickerProps {
  value: string;
  onChange: (id: string) => void;
  domains?: string[];
}

export const EntityPicker: FC<EntityPickerProps> = ({ value, onChange, domains }) => {
  const store = useHass();
  const [query, setQuery] = useState('');

  const matches = useMemo(() => {
    const all = Object.keys(store.getAllEntities()).sort();
    const filtered = domains && domains.length > 0
      ? all.filter((id) => domains.includes(id.split('.')[0]))
      : all;
    const q = query.trim().toLowerCase();
    return q ? filtered.filter((id) => id.toLowerCase().includes(q)) : filtered;
  }, [store, domains, query]);

  return (
    <div className="entity-picker">
      <input
        type="text"
        className="entity-picker__search"
        placeholder="search entities…"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      <select
        className="entity-picker__select"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        size={Math.min(10, Math.max(3, matches.length))}
      >
        {matches.length === 0 && <option disabled>no matches</option>}
        {matches.map((id) => (
          <option key={id} value={id}>{id}</option>
        ))}
      </select>
      <div className="entity-picker__current">SELECTED: {value || 'none'}</div>
    </div>
  );
};
