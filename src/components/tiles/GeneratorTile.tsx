import type { FC, ReactNode } from 'react';
import { BaseTile, type TileStatus } from './BaseTile';
import { useEntity } from '../../hass';

interface GeneratorTileProps {
  entityId: string;
  label?: string;
  icon?: ReactNode;
}

function fmtDate(iso: string | undefined): string {
  if (!iso) return '---';
  try {
    return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }).toUpperCase();
  } catch { return '---'; }
}

export const GeneratorTile: FC<GeneratorTileProps> = ({ entityId, label, icon }) => {
  const entity = useEntity(entityId);
  const friendly = label ?? (entity?.attributes.friendly_name as string | undefined) ?? entityId;
  if (!entity) return <BaseTile label={friendly} status="stale" icon={icon} pill="unavail"><div>n/a</div></BaseTile>;

  const state = entity.state;
  const status: TileStatus =
    state === 'running' ? 'alarm' :
    state === 'exercising' ? 'info' :
    state === 'fault' ? 'alarm' :
    state === 'standby' ? 'ok' : 'idle';
  const fuel = entity.attributes.fuel_level as number | undefined;
  const lastRun = entity.attributes.last_run as string | undefined;
  const runtime = entity.attributes.runtime_hours as number | undefined;
  const fuelStatus: TileStatus = fuel != null ? (fuel < 20 ? 'alarm' : fuel < 40 ? 'warn' : 'ok') : 'idle';

  return (
    <BaseTile label={friendly} status={status} icon={icon} pill={state.toUpperCase()}>
      <div className="generator-tile">
        <div className="generator-tile__fuel">
          <div className="generator-tile__fuel-bar">
            <div className={`generator-tile__fuel-fill generator-tile__fuel-fill--${fuelStatus}`} style={{ width: `${fuel ?? 0}%` }} />
          </div>
          <span className="generator-tile__fuel-pct">{fuel ?? '--'}%</span>
        </div>
        <div className="generator-tile__meta">
          <div className="generator-tile__meta-cell">
            <span className="generator-tile__meta-label">LAST RUN</span>
            <span className="generator-tile__meta-value">{fmtDate(lastRun)}</span>
          </div>
          <div className="generator-tile__meta-cell">
            <span className="generator-tile__meta-label">RUNTIME</span>
            <span className="generator-tile__meta-value">{runtime != null ? runtime.toFixed(1) : '--'} hr</span>
          </div>
        </div>
      </div>
    </BaseTile>
  );
};
