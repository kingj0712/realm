import { useState, type FC, type ReactNode, type MouseEvent } from 'react';
import { BaseTile, type TileStatus } from './BaseTile';
import { useEntity, useHass } from '../../hass';
import { TileModal } from './TileModal';

// Cell types for one row in an AreaListTile. Compose any number of cells
// (each subscribes to its own entity) to form a dense row of mixed data.

interface ValueCell {
  type: 'value';
  entityId: string;
  precision?: number;
  unit?: string;
  icon?: ReactNode;
  thresholds?: {
    warn?: { lt?: number; gt?: number };
    alarm?: { lt?: number; gt?: number };
  };
}

interface BinaryCell {
  type: 'binary';
  entityId: string;
  icon?: ReactNode;
  activeWhen?: 'on' | 'off';
  // Color used when active. Default 'info'.
  activeStatus?: TileStatus;
}

interface ToggleCell {
  type: 'toggle';
  entityId: string;
  icon?: ReactNode;
}

export type AreaCell = ValueCell | BinaryCell | ToggleCell;

export interface AreaRow {
  label: string;
  cells: AreaCell[];
}

interface AreaListTileProps {
  label: string;
  icon?: ReactNode;
  pill?: string;
  rows: AreaRow[];
}

function evaluateValueStatus(value: number, t?: ValueCell['thresholds']): TileStatus {
  if (!t) return 'ok';
  if (t.alarm) {
    if (t.alarm.lt != null && value < t.alarm.lt) return 'alarm';
    if (t.alarm.gt != null && value > t.alarm.gt) return 'alarm';
  }
  if (t.warn) {
    if (t.warn.lt != null && value < t.warn.lt) return 'warn';
    if (t.warn.gt != null && value > t.warn.gt) return 'warn';
  }
  return 'ok';
}

const ValueCellRender: FC<ValueCell> = ({ entityId, precision, unit, icon, thresholds }) => {
  const entity = useEntity(entityId);
  if (!entity) {
    return (
      <span className="area-cell area-cell--value">
        {icon && <span className="area-cell__icon">{icon}</span>}
        <span className="area-cell__num">n/a</span>
      </span>
    );
  }
  const u = unit ?? (entity.attributes.unit_of_measurement as string | undefined) ?? '';
  const raw = parseFloat(entity.state);
  const isNumeric = Number.isFinite(raw);
  const display = isNumeric && precision != null ? raw.toFixed(precision) : entity.state;
  const status: TileStatus = isNumeric ? evaluateValueStatus(raw, thresholds) : 'idle';
  return (
    <span className={`area-cell area-cell--value area-cell--value--${status}`}>
      {icon && <span className="area-cell__icon">{icon}</span>}
      <span className="area-cell__num">{display}</span>
      {u && <span className="area-cell__unit">{u}</span>}
    </span>
  );
};

const BinaryCellRender: FC<BinaryCell> = ({
  entityId,
  icon,
  activeWhen = 'on',
  activeStatus = 'info',
}) => {
  const entity = useEntity(entityId);
  const active = entity?.state === activeWhen;
  const classes = ['area-cell', 'area-cell--binary'];
  if (active) classes.push(`area-cell--binary--active-${activeStatus}`);
  return (
    <span className={classes.join(' ')}>
      {icon ?? <span className="area-cell__dot">{active ? '●' : '○'}</span>}
    </span>
  );
};

const ToggleCellRender: FC<ToggleCell> = ({ entityId, icon }) => {
  const entity = useEntity(entityId);
  const store = useHass();
  const isOn = entity?.state === 'on';
  const domain = entityId.split('.')[0];

  const onToggle = (e: MouseEvent) => {
    e.stopPropagation();
    store.callService(domain, 'toggle', undefined, { entity_id: entityId });
  };

  const classes = ['area-cell', 'area-cell--toggle'];
  if (isOn) classes.push('area-cell--toggle--on');

  return (
    <button type="button" className={classes.join(' ')} onClick={onToggle} aria-label={entityId}>
      {icon ?? <span className="area-cell__dot">{isOn ? '●' : '○'}</span>}
    </button>
  );
};

const AreaCellRender: FC<{ cell: AreaCell }> = ({ cell }) => {
  switch (cell.type) {
    case 'value':
      return <ValueCellRender {...cell} />;
    case 'binary':
      return <BinaryCellRender {...cell} />;
    case 'toggle':
      return <ToggleCellRender {...cell} />;
  }
};

const AreaListRow: FC<AreaRow> = ({ label, cells }) => (
  <div className="area-list-tile__row">
    <span className="area-list-tile__label">{label}</span>
    <span className="area-list-tile__cells">
      {cells.map((c, i) => (
        <AreaCellRender key={i} cell={c} />
      ))}
    </span>
  </div>
);

const AreaDetailRow: FC<{ rowLabel: string; cell: AreaCell }> = ({ rowLabel, cell }) => {
  const entity = useEntity(cell.entityId);
  const friendly = (entity?.attributes.friendly_name as string | undefined) ?? cell.entityId;
  const unit = cell.type === 'value'
    ? cell.unit ?? (entity?.attributes.unit_of_measurement as string | undefined) ?? ''
    : '';

  return (
    <div className="entity-detail__attr">
      <span className="entity-detail__attr-key">{rowLabel}</span>
      <span className="entity-detail__attr-val">{entity?.state ?? 'n/a'}{unit ? ` ${unit}` : ''} ({friendly})</span>
    </div>
  );
};

export const AreaListTile: FC<AreaListTileProps> = ({ label, icon, pill, rows }) => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <BaseTile label={label} icon={icon} pill={pill} onClick={() => setOpen(true)}>
        <div className="area-list-tile">
          {rows.map((r) => (
            <AreaListRow key={r.label} {...r} />
          ))}
        </div>
      </BaseTile>
      {open && (
        <TileModal title={label} pill={pill} onClose={() => setOpen(false)} size="lg">
          <div className="entity-detail__attrs">
            <div className="entity-detail__attrs-head">ROWS</div>
            <div className="entity-detail__attrs-body">
              {rows.flatMap((r) => r.cells.map((cell, i) => (
                <AreaDetailRow key={`${r.label}-${i}-${cell.entityId}`} rowLabel={r.label} cell={cell} />
              )))}
            </div>
          </div>
        </TileModal>
      )}
    </>
  );
};
