import { useState, type FC, type ReactNode } from 'react';
import { BaseTile, type TileStatus } from './BaseTile';
import { useEntity, useHistory } from '../../hass';
import { EntityDetailModal } from '../EntityDetailModal';

interface HistoryBarsTileProps {
  entityId: string;
  label?: string;
  icon?: ReactNode;
  bars?: number;
  precision?: number;
  // If set, use this attribute as the data source instead of generated history.
  attributeKey?: string;
  thresholds?: {
    warn?: { lt?: number; gt?: number };
    alarm?: { lt?: number; gt?: number };
  };
}

function evaluateStatus(value: number, t?: HistoryBarsTileProps['thresholds']): TileStatus {
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

export const HistoryBarsTile: FC<HistoryBarsTileProps> = ({
  entityId,
  label,
  icon,
  bars = 14,
  precision = 0,
  attributeKey,
  thresholds,
}) => {
  const entity = useEntity(entityId);
  const generated = useHistory(entityId, bars);
  const [open, setOpen] = useState(false);
  const friendly = label ?? (entity?.attributes.friendly_name as string | undefined) ?? entityId;
  if (!entity) return <BaseTile label={friendly} status="stale" icon={icon} pill="unavail"><div>n/a</div></BaseTile>;

  const fromAttr = attributeKey ? (entity.attributes[attributeKey] as number[] | undefined) : undefined;
  const data = fromAttr && fromAttr.length > 0 ? fromAttr.slice(-bars) : generated;
  if (data.length < 1) return <BaseTile label={friendly} icon={icon} pill="empty"><div>no data</div></BaseTile>;

  const unit = (entity.attributes.unit_of_measurement as string | undefined) ?? '';
  const cur = parseFloat(entity.state);
  const display = Number.isFinite(cur) ? cur.toFixed(precision) : entity.state;
  const status: TileStatus = Number.isFinite(cur) ? evaluateStatus(cur, thresholds) : 'idle';
  const max = Math.max(...data, 0.0001);

  return (
    <>
      <BaseTile label={friendly} status={status} icon={icon} onClick={() => setOpen(true)}>
        <div className="history-bars">
          <div className="history-bars__head">
            <span className="history-bars__num">{display}</span>
            {unit && <span className="history-bars__unit">{unit}</span>}
            <span className="history-bars__range">{bars}D</span>
          </div>
          <div className={`history-bars__bars history-bars__bars--${status}`}>
            {data.map((v, i) => (
              <span
                key={i}
                className="history-bars__bar"
                style={{ height: `${Math.max(2, (v / max) * 100)}%` }}
                title={`${v.toFixed(precision)} ${unit}`}
              />
            ))}
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
