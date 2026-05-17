import { useState, type FC, type ReactNode } from 'react';
import { BaseTile, type TileStatus } from './BaseTile';
import { useEntity } from '../../hass';
import { EntityDetailModal } from '../EntityDetailModal';

interface DonutTileProps {
  entityId: string;
  label?: string;
  icon?: ReactNode;
  precision?: number;
  // Defaults assume percentages where low = bad.
  warnBelow?: number;
  alarmBelow?: number;
}

// Full ring at r=38, circumference = 2π × 38.
const CIRC = 2 * Math.PI * 38; // ≈ 238.76

export const DonutTile: FC<DonutTileProps> = ({
  entityId,
  label,
  icon,
  precision = 0,
  warnBelow = 25,
  alarmBelow = 10,
}) => {
  const entity = useEntity(entityId);
  const [open, setOpen] = useState(false);
  const friendly = label ?? (entity?.attributes.friendly_name as string | undefined) ?? entityId;

  if (!entity) {
    return (
      <BaseTile label={friendly} status="stale" icon={icon} pill="unavail">
        <div className="donut-tile">n/a</div>
      </BaseTile>
    );
  }

  const unit = (entity.attributes.unit_of_measurement as string | undefined) ?? '%';
  const raw = parseFloat(entity.state);
  const isNumeric = Number.isFinite(raw);
  const pct = isNumeric ? Math.max(0, Math.min(100, raw)) : 0;

  let status: TileStatus = 'ok';
  if (pct <= alarmBelow) status = 'alarm';
  else if (pct <= warnBelow) status = 'warn';

  const display = isNumeric ? raw.toFixed(precision) : entity.state;
  const dashOffset = CIRC * (1 - pct / 100);

  return (
    <>
      <BaseTile label={friendly} status={status} icon={icon} onClick={() => setOpen(true)}>
        <div className="donut-tile">
          <svg
            className="donut-tile__svg"
            viewBox="0 0 100 100"
            preserveAspectRatio="xMidYMid meet"
            aria-hidden
          >
            <circle cx="50" cy="50" r="38" className="donut-tile__bg" />
            <circle
              cx="50"
              cy="50"
              r="38"
              className={`donut-tile__fg donut-tile__fg--${status}`}
              transform="rotate(-90 50 50)"
              style={{ strokeDasharray: CIRC, strokeDashoffset: dashOffset }}
            />
          </svg>
          <div className="donut-tile__center">
            <div className="donut-tile__value">{display}</div>
            <div className="donut-tile__unit">{unit}</div>
          </div>
        </div>
      </BaseTile>
      {open && (
        <EntityDetailModal
          entityId={entityId}
          title={friendly}
          pill={`${display}${unit}`}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  );
};
