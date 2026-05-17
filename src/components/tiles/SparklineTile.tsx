import { useState, type FC, type ReactNode } from 'react';
import { BaseTile, type TileStatus } from './BaseTile';
import { useEntity, useHistory } from '../../hass';
import { EntityDetailModal } from '../EntityDetailModal';

interface SparklineTileProps {
  entityId: string;
  label?: string;
  icon?: ReactNode;
  precision?: number;
  points?: number;
  thresholds?: {
    warn?: { lt?: number; gt?: number };
    alarm?: { lt?: number; gt?: number };
  };
}

function evaluateStatus(value: number, t?: SparklineTileProps['thresholds']): TileStatus {
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

export const SparklineTile: FC<SparklineTileProps> = ({
  entityId,
  label,
  icon,
  precision = 1,
  points = 30,
  thresholds,
}) => {
  const entity = useEntity(entityId);
  const history = useHistory(entityId, points);
  const [open, setOpen] = useState(false);
  const friendly = label ?? (entity?.attributes.friendly_name as string | undefined) ?? entityId;

  if (!entity || history.length < 2) {
    return (
      <BaseTile label={friendly} status="stale" icon={icon} pill="unavail">
        <div className="sparkline-tile">n/a</div>
      </BaseTile>
    );
  }

  const unit = (entity.attributes.unit_of_measurement as string | undefined) ?? '';
  const cur = parseFloat(entity.state);
  const status: TileStatus = Number.isFinite(cur) ? evaluateStatus(cur, thresholds) : 'idle';
  const display = Number.isFinite(cur) ? cur.toFixed(precision) : entity.state;

  const min = Math.min(...history);
  const max = Math.max(...history);
  const range = max - min || 1;
  const w = 100;
  const h = 30;
  const pad = 2;
  const innerH = h - pad * 2;

  const pts = history
    .map((v, i) => {
      const x = (i / (history.length - 1)) * w;
      const y = h - pad - ((v - min) / range) * innerH;
      return `${x.toFixed(2)},${y.toFixed(2)}`;
    })
    .join(' ');

  // Filled area path: same trace, closed to baseline.
  const areaPath =
    `M 0,${h} L ` +
    history
      .map((v, i) => {
        const x = (i / (history.length - 1)) * w;
        const y = h - pad - ((v - min) / range) * innerH;
        return `${x.toFixed(2)},${y.toFixed(2)}`;
      })
      .join(' L ') +
    ` L ${w},${h} Z`;

  return (
    <>
      <BaseTile label={friendly} status={status} icon={icon} onClick={() => setOpen(true)}>
        <div className="sparkline-tile">
          <div className="sparkline-tile__head">
            <span className="sparkline-tile__num">{display}</span>
            {unit && <span className="sparkline-tile__unit">{unit}</span>}
          </div>
          <svg
            className={`sparkline-tile__svg sparkline-tile__svg--${status}`}
            viewBox={`0 0 ${w} ${h}`}
            preserveAspectRatio="none"
            aria-hidden
          >
            <path className="sparkline-tile__area" d={areaPath} />
            <polyline className="sparkline-tile__line" points={pts} />
          </svg>
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
