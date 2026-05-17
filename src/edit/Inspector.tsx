import type { FC } from 'react';
import { useMemo } from 'react';
import { useLayout } from './LayoutContext';
import { TILE_BY_TYPE } from './tileRegistry';
import type { LayoutItem, PropDescriptor } from './types';
import { COL_SPAN_PRESETS, ROW_SPAN_PRESETS } from './types';
import { EntityPicker } from './EntityPicker';
import { IconPicker } from './IconPicker';
import { RowEditor } from './RowEditor';

interface InspectorProps {
  item: LayoutItem;
}

const PropField: FC<{ name: string; descriptor: PropDescriptor; value: unknown; onChange: (v: unknown) => void }> = ({
  name, descriptor, value, onChange,
}) => {
  switch (descriptor.kind) {
    case 'entity':
      return (
        <div className="insp-field">
          <label className="insp-field__label">{descriptor.label}</label>
          <EntityPicker value={(value as string) ?? ''} onChange={onChange} domains={descriptor.domains} />
        </div>
      );
    case 'string':
      return (
        <div className="insp-field">
          <label className="insp-field__label">{descriptor.label}</label>
          <input
            type="text"
            className="insp-field__input"
            value={(value as string) ?? ''}
            onChange={(e) => onChange(e.target.value || undefined)}
          />
        </div>
      );
    case 'number':
      return (
        <div className="insp-field">
          <label className="insp-field__label">{descriptor.label}</label>
          <input
            type="number"
            className="insp-field__input"
            value={value == null ? '' : String(value)}
            onChange={(e) => onChange(e.target.value === '' ? undefined : Number(e.target.value))}
          />
        </div>
      );
    case 'boolean':
      return (
        <label className="insp-field insp-field--check">
          <input
            type="checkbox"
            checked={!!value}
            onChange={(e) => onChange(e.target.checked)}
          />
          <span>{descriptor.label}</span>
        </label>
      );
    case 'icon':
      return (
        <div className="insp-field">
          <label className="insp-field__label">{descriptor.label}</label>
          <IconPicker value={value as string | undefined} onChange={onChange} />
        </div>
      );
    case 'select':
      return (
        <div className="insp-field">
          <label className="insp-field__label">{descriptor.label}</label>
          <select
            className="insp-field__input"
            value={(value as string) ?? ''}
            onChange={(e) => onChange(e.target.value || undefined)}
          >
            <option value="">(none)</option>
            {(descriptor.options ?? []).map((o) => <option key={o} value={o}>{o}</option>)}
          </select>
        </div>
      );
    case 'json': {
      const stringValue = value === undefined ? '' : JSON.stringify(value, null, 2);
      return (
        <div className="insp-field">
          <label className="insp-field__label">{descriptor.label}</label>
          <textarea
            className="insp-field__textarea"
            rows={5}
            placeholder={descriptor.hint ?? ''}
            defaultValue={stringValue}
            onBlur={(e) => {
              const v = e.target.value.trim();
              if (!v) { onChange(undefined); return; }
              try { onChange(JSON.parse(v)); } catch { /* keep prev */ }
            }}
          />
        </div>
      );
    }
    case 'rows':
      return (
        <div className="insp-field">
          <label className="insp-field__label">{descriptor.label}</label>
          <RowEditor rowKind={descriptor.rowKind ?? 'simple-entities'} value={value as unknown[]} onChange={onChange} fieldName={name} />
        </div>
      );
    default:
      return null;
  }
};

export const Inspector: FC<InspectorProps> = ({ item }) => {
  const { updateTile, removeTile, duplicateTile, selectTile } = useLayout();
  const meta = useMemo(() => TILE_BY_TYPE[item.type], [item.type]);
  if (!meta) return null;

  const setProp = (key: string) => (value: unknown) => {
    updateTile(item.id, (it) => ({ ...it, props: { ...it.props, [key]: value } }));
  };

  return (
    <aside className="inspector">
      <div className="inspector__head">
        <div>
          <div className="inspector__title">{meta.name}</div>
          <div className="inspector__type">{meta.type}</div>
        </div>
        <button type="button" className="inspector__close" onClick={() => selectTile(null)} aria-label="close">✕</button>
      </div>

      <div className="inspector__section">
        <div className="inspector__section-label">Size</div>
        <div className="inspector__sub-label">Width</div>
        <div className="inspector__width">
          {COL_SPAN_PRESETS.map((p) => (
            <button
              key={p.value}
              type="button"
              className={`inspector__width-btn${item.w === p.value ? ' inspector__width-btn--active' : ''}`}
              onClick={() => updateTile(item.id, { w: p.value })}
            >
              {p.label}
            </button>
          ))}
        </div>
        <div className="inspector__sub-label">Height (rows of 20px)</div>
        <div className="inspector__width">
          {ROW_SPAN_PRESETS.map((p) => (
            <button
              key={p.value}
              type="button"
              className={`inspector__width-btn${item.h === p.value ? ' inspector__width-btn--active' : ''}`}
              onClick={() => updateTile(item.id, { h: p.value })}
            >
              {p.label}
            </button>
          ))}
        </div>
        <div className="inspector__hint">Or drag the bottom-right handle on the tile for free resize.</div>
      </div>

      <div className="inspector__section">
        <div className="inspector__section-label">Properties</div>
        <div className="inspector__fields">
          {Object.entries(meta.schema).map(([key, desc]) => (
            <PropField
              key={key}
              name={key}
              descriptor={desc}
              value={item.props[key]}
              onChange={setProp(key)}
            />
          ))}
        </div>
      </div>

      <div className="inspector__section">
        <div className="inspector__actions">
          <button
            type="button"
            className="inspector__action inspector__action--secondary"
            onClick={() => duplicateTile(item.id)}
            title="Create a copy of this tile"
          >
            ⎘ DUPLICATE
          </button>
          <button
            type="button"
            className="inspector__action inspector__action--danger"
            onClick={() => removeTile(item.id)}
          >
            ✕ DELETE
          </button>
        </div>
      </div>
    </aside>
  );
};
