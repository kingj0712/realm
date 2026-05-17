import type { FC } from 'react';
import { useMemo, useState } from 'react';
import { Icon } from '../components/Icon';
import { ICON_LIBRARY, ICON_NAMES } from './iconLookup';

interface IconPickerProps {
  value: string | undefined;
  onChange: (name: string | undefined) => void;
}

export const IconPicker: FC<IconPickerProps> = ({ value, onChange }) => {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);

  const matches = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q ? ICON_NAMES.filter((n) => n.toLowerCase().includes(q)) : ICON_NAMES;
  }, [query]);

  return (
    <div className="icon-picker">
      <button type="button" className="icon-picker__current" onClick={() => setOpen((o) => !o)}>
        {value && ICON_LIBRARY[value]
          ? <Icon path={ICON_LIBRARY[value]} size={16} />
          : <span className="icon-picker__none">none</span>}
        <span className="icon-picker__name">{value ?? 'none'}</span>
      </button>
      {open && (
        <div className="icon-picker__popover">
          <input
            type="text"
            className="icon-picker__search"
            placeholder="search icons…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <div className="icon-picker__grid">
            <button
              type="button"
              className={`icon-picker__cell${!value ? ' icon-picker__cell--active' : ''}`}
              onClick={() => { onChange(undefined); setOpen(false); }}
              title="(none)"
            >
              ✕
            </button>
            {matches.map((name) => (
              <button
                key={name}
                type="button"
                className={`icon-picker__cell${value === name ? ' icon-picker__cell--active' : ''}`}
                onClick={() => { onChange(name); setOpen(false); }}
                title={name}
              >
                <Icon path={ICON_LIBRARY[name]} size={16} />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
