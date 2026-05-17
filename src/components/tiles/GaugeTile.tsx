import { useState, type FC, type ReactNode } from 'react';
import { BaseTile, type TileStatus } from './BaseTile';
import { useEntity } from '../../hass';
import { EntityDetailModal } from '../EntityDetailModal';

interface GaugeTileProps {
  entityId: string;
  label?: string;
  icon?: ReactNode;
  precision?: number;
  // Range mapped onto the 270° arc.
  min?: number;
  max?: number;
  thresholds?: {
    warn?: { lt?: number; gt?: number };
    alarm?: { lt?: number; gt?: number };
  };
}

function evaluateStatus(value: number, t?: GaugeTileProps['thresholds']): TileStatus {
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

// 270° arc gauge. Opens at the bottom; sweeps clockwise from bottom-left.
// Geometry derived once: arc length for r=38 over 270° = 2π × 38 × 0.75.
const ARC_LENGTH = 2 * Math.PI * 38 * 0.75; // ≈ 179.07
const ARC_PATH = 'M 23.13,76.87 A 38,38 0 1,1 76.87,76.87';

export const GaugeTile: FC<GaugeTileProps> = ({
  entityId,
  label,
  icon,
  precision = 1,
  min = 0,
  max = 100,
  thresholds,
}) => {
  const entity = useEntity(entityId);
  const [open, setOpen] = useState(false);
  const friendly = label ?? (entity?.attributes.friendly_name as string | undefined) ?? entityId;

  if (!entity) {
    return (
      <BaseTile label={friendly} status="stale" icon={icon} pill="unavail">
        <div className="gauge-tile">n/a</div>
      </BaseTile>
    );
  }

  const unit = (entity.attributes.unit_of_measurement as string | undefined) ?? '';
  const raw = parseFloat(entity.state);
  const isNumeric = Number.isFinite(raw);
  const status: TileStatus = isNumeric ? evaluateStatus(raw, thresholds) : 'idle';
  const display = isNumeric ? raw.toFixed(precision) : entity.state;
  const pct = isNumeric ? Math.max(0, Math.min(1, (raw - min) / (max - min))) : 0;
  const dashOffset = ARC_LENGTH * (1 - pct);

  return (
    <>
      <BaseTile label={friendly} status={status} icon={icon} onClick={() => setOpen(true)}>
        <div className="gauge-tile">
          <svg
            className="gauge-tile__svg"
            viewBox="0 0 100 90"
            preserveAspectRatio="xMidYMid meet"
            aria-hidden
          >
            <path className="gauge-tile__bg" d={ARC_PATH} />
            <path
              className={`gauge-tile__fg gauge-tile__fg--${status}`}
              d={ARC_PATH}
              style={{ strokeDasharray: ARC_LENGTH, strokeDashoffset: dashOffset }}
            />
            {/* min/max ticks below the arc opening */}
            <text className="gauge-tile__tick" x="18" y="88" textAnchor="middle">
              {min}
            </text>
            <text className="gauge-tile__tick" x="82" y="88" textAnchor="middle">
              {max}
            </text>
          </svg>
          <div className="gauge-tile__center">
            <div className="gauge-tile__value">{display}</div>
            {unit && <div className="gauge-tile__unit">{unit}</div>}
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
