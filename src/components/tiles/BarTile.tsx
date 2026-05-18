import { useState, type FC, type ReactNode } from 'react';
import { BaseTile, type TileStatus } from './BaseTile';
import { useEntity, useHass, getEntityDisplayState } from '../../hass';
import { EntityDetailModal } from '../EntityDetailModal';

interface BarTileProps {
  entityId: string;
  label?: string;
  icon?: ReactNode;
  precision?: number;
  // Range over which the bar fills (e.g., 0-100 for %, 0-20 for inches).
  min?: number;
  max?: number;
  thresholds?: {
    warn?: { lt?: number; gt?: number };
    alarm?: { lt?: number; gt?: number };
  };
}

function evaluateStatus(value: number, t?: BarTileProps['thresholds']): TileStatus {
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

export const BarTile: FC<BarTileProps> = ({
  entityId,
  label,
  icon,
  precision,
  min = 0,
  max = 100,
  thresholds,
}) => {
  const entity = useEntity(entityId);
  const store = useHass();
  const [open, setOpen] = useState(false);
  const friendly = label ?? (entity?.attributes.friendly_name as string | undefined) ?? entityId;

  const missing = getEntityDisplayState(entityId, entity, store);
  if (missing.kind !== 'live-ok' || !entity) {
    return (
      <BaseTile label={friendly} status={missing.kind === 'live-unavailable' ? 'stale' : 'idle'} icon={icon} pill={missing.pill}>
        <div className="bar-tile bar-tile--missing">{missing.text}</div>
      </BaseTile>
    );
  }

  const unit = (entity.attributes.unit_of_measurement as string | undefined) ?? '';
  const raw = parseFloat(entity.state);
  const isNumeric = Number.isFinite(raw);
  const status: TileStatus = isNumeric ? evaluateStatus(raw, thresholds) : 'idle';
  const display = isNumeric && precision != null ? raw.toFixed(precision) : entity.state;
  const pct = isNumeric
    ? Math.max(0, Math.min(100, ((raw - min) / (max - min)) * 100))
    : 0;

  return (
    <>
      <BaseTile label={friendly} status={status} icon={icon} onClick={() => setOpen(true)}>
        <div className="bar-tile">
          <div className="bar-tile__value">
            <span className="bar-tile__num">{display}</span>
            {unit && <span className="bar-tile__unit">{unit}</span>}
          </div>
          <div className={`bar-tile__track bar-tile__track--${status}`}>
            <div className="bar-tile__fill" style={{ width: `${pct}%` }} />
          </div>
          <div className="bar-tile__scale">
            <span>{min}</span>
            <span>
              {max}
              {unit}
            </span>
          </div>
        </div>
      </BaseTile>
      {open && (
        <EntityDetailModal
          entityId={entityId}
          title={friendly}
          pill={`${display}${unit ? ' ' + unit : ''}`}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  );
};
