import { useState, type FC, type ReactNode } from 'react';
import { BaseTile, type TileStatus } from './BaseTile';
import { useEntity } from '../../hass';
import { EntityDetailModal } from '../EntityDetailModal';

interface Threshold {
  warn?: { lt?: number; gt?: number };
  alarm?: { lt?: number; gt?: number };
}

interface ValueTileProps {
  entityId: string;
  label?: string;
  icon?: ReactNode;
  precision?: number;
  thresholds?: Threshold;
}

function evaluateStatus(value: number, t?: Threshold): TileStatus {
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

export const ValueTile: FC<ValueTileProps> = ({ entityId, label, icon, precision, thresholds }) => {
  const entity = useEntity(entityId);
  const [open, setOpen] = useState(false);
  const friendly =
    label ?? (entity?.attributes.friendly_name as string | undefined) ?? entityId;

  if (!entity) {
    return (
      <BaseTile label={friendly} status="stale" icon={icon} pill="unavail">
        <div className="value-tile__row">
          <span className="value-tile__num">n/a</span>
        </div>
      </BaseTile>
    );
  }

  const unit = (entity.attributes.unit_of_measurement as string | undefined) ?? '';
  const raw = parseFloat(entity.state);
  const isNumeric = Number.isFinite(raw);
  const display = isNumeric && precision != null ? raw.toFixed(precision) : entity.state;
  const status: TileStatus = isNumeric ? evaluateStatus(raw, thresholds) : 'idle';

  return (
    <>
      <BaseTile label={friendly} status={status} icon={icon} onClick={() => setOpen(true)}>
        <div className="value-tile__row">
          <span className="value-tile__num">{display}</span>
          {unit && <span className="value-tile__unit">{unit}</span>}
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
