import { useState, type FC, type ReactNode } from 'react';
import { BaseTile, type TileStatus } from './BaseTile';
import { useEntity, useHass, getEntityDisplayState } from '../../hass';
import { EntityDetailModal } from '../EntityDetailModal';

interface TankTileProps {
  entityId: string;
  label?: string;
  icon?: ReactNode;
  // Free-form capacity hint shown below the percentage (e.g. "275 gal").
  capacity?: string;
  // Level thresholds (in %). Defaults assume tanks where low = bad.
  warnBelow?: number;
  alarmBelow?: number;
}

export const TankTile: FC<TankTileProps> = ({
  entityId,
  label,
  icon,
  capacity,
  warnBelow = 25,
  alarmBelow = 10,
}) => {
  const entity = useEntity(entityId);
  const store = useHass();
  const [open, setOpen] = useState(false);
  const friendly = label ?? (entity?.attributes.friendly_name as string | undefined) ?? entityId;

  const missing = getEntityDisplayState(entityId, entity, store);
  if (missing.kind !== 'live-ok' || !entity) {
    return (
      <BaseTile label={friendly} status={missing.kind === 'live-unavailable' ? 'stale' : 'idle'} icon={icon} pill={missing.pill}>
        <div className="tank-tile tank-tile--missing">{missing.text}</div>
      </BaseTile>
    );
  }

  const raw = parseFloat(entity.state);
  const level = Number.isFinite(raw) ? Math.max(0, Math.min(100, raw)) : 0;

  let status: TileStatus = 'ok';
  let pillText = 'NORMAL';
  if (level <= alarmBelow) {
    status = 'alarm';
    pillText = 'CRITICAL';
  } else if (level <= warnBelow) {
    status = 'warn';
    pillText = 'LOW';
  }

  // viewBox: 40 wide, 90 tall. Tank body from y=6 to y=84 (height 78).
  const tankTop = 6;
  const tankBottom = 84;
  const tankHeight = tankBottom - tankTop;
  const fillHeight = (level / 100) * tankHeight;
  const fillY = tankBottom - fillHeight;

  return (
    <>
      <BaseTile label={friendly} status={status} icon={icon} pill={pillText} onClick={() => setOpen(true)}>
        <div className="tank-tile">
          <svg
            className="tank-tile__svg"
            viewBox="0 0 40 90"
            preserveAspectRatio="xMidYMid meet"
            aria-hidden
          >
            {/* Tank outline */}
            <rect
              x="4"
              y={tankTop}
              width="32"
              height={tankHeight}
              rx="2"
              fill="var(--surface-container-lowest)"
              stroke="var(--on-surface-faint)"
              strokeWidth="1"
            />
            {/* Liquid fill (animated via CSS transition on y + height) */}
            <rect
              className={`tank-tile__fill tank-tile__fill--${status}`}
              x="5"
              y={fillY}
              width="30"
              height={fillHeight}
            />
            {/* Surface shine */}
            {fillHeight > 4 && (
              <rect
                className="tank-tile__shine"
                x="7"
                y={fillY + 1}
                width="2"
                height={fillHeight - 2}
              />
            )}
            {/* Tick marks at 25/50/75% */}
            {[0.25, 0.5, 0.75].map((t) => {
              const y = tankBottom - tankHeight * t;
              return (
                <line
                  key={t}
                  x1="0"
                  y1={y}
                  x2="3"
                  y2={y}
                  stroke="var(--on-surface-faint)"
                  strokeWidth="0.8"
                />
              );
            })}
          </svg>
          <div className="tank-tile__meta">
            <div className="tank-tile__pct">
              {level.toFixed(1)}
              <span className="tank-tile__pct-unit">%</span>
            </div>
            {capacity && <div className="tank-tile__capacity">{capacity}</div>}
          </div>
        </div>
      </BaseTile>
      {open && (
        <EntityDetailModal
          entityId={entityId}
          title={friendly}
          pill={pillText}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  );
};
