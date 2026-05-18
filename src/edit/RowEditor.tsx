import type { FC } from 'react';
import { EntityPicker } from './EntityPicker';
import { IconPicker } from './IconPicker';

interface RowEditorProps {
  rowKind: string;
  value: unknown[];
  onChange: (v: unknown[]) => void;
  fieldName: string;
}

// Editors per row kind. Each owns a small slice of the config shape so the
// inspector stays usable without dropping to raw JSON.

export const RowEditor: FC<RowEditorProps> = ({ rowKind, value, onChange }) => {
  const rows = Array.isArray(value) ? value : [];
  const replace = (i: number, next: unknown) => {
    const copy = [...rows];
    copy[i] = next;
    onChange(copy);
  };
  const remove = (i: number) => onChange(rows.filter((_, idx) => idx !== i));
  const move = (i: number, dir: -1 | 1) => {
    const j = i + dir;
    if (j < 0 || j >= rows.length) return;
    const copy = [...rows];
    [copy[i], copy[j]] = [copy[j], copy[i]];
    onChange(copy);
  };
  const add = (template: unknown) => onChange([...rows, template]);

  if (rowKind === 'presence') {
    return (
      <div className="row-editor">
        {rows.map((id, i) => (
          <div key={i} className="row-editor__row">
            <EntityPicker value={id as string} onChange={(v) => replace(i, v)} domains={['person']} />
            <div className="row-editor__row-actions">
              <button type="button" onClick={() => move(i, -1)}>↑</button>
              <button type="button" onClick={() => move(i, 1)}>↓</button>
              <button type="button" className="row-editor__remove" onClick={() => remove(i)}>✕</button>
            </div>
          </div>
        ))}
        <button type="button" className="row-editor__add" onClick={() => add('person.user_1')}>+ ADD PERSON</button>
      </div>
    );
  }

  if (rowKind === 'irrigation') {
    return (
      <div className="row-editor">
        {rows.map((row, i) => {
          const r = row as { entityId: string; label: string };
          return (
            <div key={i} className="row-editor__row">
              <input
                type="text"
                value={r.label}
                onChange={(e) => replace(i, { ...r, label: e.target.value })}
                placeholder="Zone label"
                className="row-editor__input"
              />
              <EntityPicker value={r.entityId} onChange={(v) => replace(i, { ...r, entityId: v })} domains={['switch']} />
              <div className="row-editor__row-actions">
                <button type="button" onClick={() => move(i, -1)}>↑</button>
                <button type="button" onClick={() => move(i, 1)}>↓</button>
                <button type="button" className="row-editor__remove" onClick={() => remove(i)}>✕</button>
              </div>
            </div>
          );
        })}
        <button type="button" className="row-editor__add" onClick={() => add({ entityId: 'switch.irrigation_zone_1', label: 'NEW ZONE' })}>+ ADD ZONE</button>
      </div>
    );
  }

  if (rowKind === 'status-list') {
    return (
      <div className="row-editor">
        {rows.map((row, i) => {
          const r = row as { entityId: string; label: string; stateLabels?: { on?: string; off?: string }; activeStatus?: string };
          return (
            <div key={i} className="row-editor__row">
              <input
                type="text"
                value={r.label}
                onChange={(e) => replace(i, { ...r, label: e.target.value })}
                placeholder="Row label"
                className="row-editor__input"
              />
              <EntityPicker value={r.entityId} onChange={(v) => replace(i, { ...r, entityId: v })} domains={['binary_sensor']} />
              <div className="row-editor__row-actions">
                <button type="button" onClick={() => move(i, -1)}>↑</button>
                <button type="button" onClick={() => move(i, 1)}>↓</button>
                <button type="button" className="row-editor__remove" onClick={() => remove(i)}>✕</button>
              </div>
            </div>
          );
        })}
        <button type="button" className="row-editor__add" onClick={() => add({ entityId: 'binary_sensor.front_door', label: 'NEW', stateLabels: { on: 'ON', off: 'OFF' }, activeStatus: 'info' })}>+ ADD ENTRY</button>
      </div>
    );
  }

  if (rowKind === 'multi-metric') {
    return (
      <div className="row-editor">
        {rows.map((row, i) => {
          const r = row as { entityId: string; label: string; precision?: number };
          return (
            <div key={i} className="row-editor__row">
              <input
                type="text"
                value={r.label}
                onChange={(e) => replace(i, { ...r, label: e.target.value })}
                placeholder="Metric label"
                className="row-editor__input"
              />
              <EntityPicker value={r.entityId} onChange={(v) => replace(i, { ...r, entityId: v })} />
              <input
                type="number"
                value={r.precision ?? ''}
                onChange={(e) => replace(i, { ...r, precision: e.target.value === '' ? undefined : Number(e.target.value) })}
                placeholder="precision"
                className="row-editor__input row-editor__input--narrow"
              />
              <div className="row-editor__row-actions">
                <button type="button" onClick={() => move(i, -1)}>↑</button>
                <button type="button" onClick={() => move(i, 1)}>↓</button>
                <button type="button" className="row-editor__remove" onClick={() => remove(i)}>✕</button>
              </div>
            </div>
          );
        })}
        <button type="button" className="row-editor__add" onClick={() => add({ entityId: 'sensor.outdoor_temperature', label: 'NEW', precision: 1 })}>+ ADD METRIC</button>
      </div>
    );
  }

  if (rowKind === 'area') {
    // AreaListTile rows: each row has label + array of typed cells.
    return (
      <div className="row-editor">
        {rows.map((row, i) => {
          const r = row as { label: string; cells: Array<Record<string, unknown>> };
          const cells = Array.isArray(r.cells) ? r.cells : [];
          const replaceCell = (ci: number, next: Record<string, unknown>) => {
            const copy = [...cells];
            copy[ci] = next;
            replace(i, { ...r, cells: copy });
          };
          const removeCell = (ci: number) => replace(i, { ...r, cells: cells.filter((_, idx) => idx !== ci) });
          const addCell = (template: Record<string, unknown>) => replace(i, { ...r, cells: [...cells, template] });
          return (
            <div key={i} className="row-editor__row row-editor__row--area">
              <div className="row-editor__area-head">
                <input
                  type="text"
                  value={r.label}
                  onChange={(e) => replace(i, { ...r, label: e.target.value })}
                  placeholder="Row label"
                  className="row-editor__input"
                />
                <div className="row-editor__row-actions">
                  <button type="button" onClick={() => move(i, -1)}>↑</button>
                  <button type="button" onClick={() => move(i, 1)}>↓</button>
                  <button type="button" className="row-editor__remove" onClick={() => remove(i)}>✕ ROW</button>
                </div>
              </div>
              <div className="row-editor__cells">
                {cells.map((cell, ci) => (
                  <div key={ci} className="row-editor__cell">
                    <select
                      value={(cell.type as string) ?? 'value'}
                      onChange={(e) => replaceCell(ci, { ...cell, type: e.target.value })}
                      className="row-editor__input row-editor__input--narrow"
                    >
                      <option value="value">value</option>
                      <option value="binary">binary</option>
                      <option value="toggle">toggle</option>
                    </select>
                    <EntityPicker value={(cell.entityId as string) ?? ''} onChange={(v) => replaceCell(ci, { ...cell, entityId: v })} />
                    <IconPicker value={cell.icon as string | undefined} onChange={(v) => replaceCell(ci, { ...cell, icon: v })} />
                    <button type="button" className="row-editor__remove" onClick={() => removeCell(ci)}>✕</button>
                  </div>
                ))}
                <button type="button" className="row-editor__add" onClick={() => addCell({ type: 'value', entityId: 'sensor.outdoor_temperature', precision: 0 })}>+ CELL</button>
              </div>
            </div>
          );
        })}
        <button type="button" className="row-editor__add" onClick={() => add({ label: 'NEW ROW', cells: [] })}>+ ADD ROW</button>
      </div>
    );
  }

  // Fallback: simple list of entityIds.
  return (
    <div className="row-editor">
      {rows.map((id, i) => (
        <div key={i} className="row-editor__row">
          <EntityPicker value={id as string} onChange={(v) => replace(i, v)} />
          <button type="button" className="row-editor__remove" onClick={() => remove(i)}>✕</button>
        </div>
      ))}
      <button type="button" className="row-editor__add" onClick={() => add('')}>+ ADD</button>
    </div>
  );
};
