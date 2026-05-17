import type { FC, ReactNode } from 'react';
import { BaseTile, type TileStatus } from './BaseTile';
import { useEntity } from '../../hass';

interface NASTileProps {
  entityId: string;
  label?: string;
  icon?: ReactNode;
}

const CIRC = 2 * Math.PI * 30;

export const NASTile: FC<NASTileProps> = ({ entityId, label, icon }) => {
  const entity = useEntity(entityId);
  const friendly = label ?? (entity?.attributes.friendly_name as string | undefined) ?? entityId;
  if (!entity) return <BaseTile label={friendly} status="stale" icon={icon} pill="unavail"><div>n/a</div></BaseTile>;

  const pct = parseFloat(entity.state);
  const safe = Number.isFinite(pct) ? Math.max(0, Math.min(100, pct)) : 0;
  const status: TileStatus = safe >= 90 ? 'alarm' : safe >= 75 ? 'warn' : 'ok';
  const totalTb = entity.attributes.total_tb as number | undefined;
  const usedTb = entity.attributes.used_tb as number | undefined;
  const read = entity.attributes.read_mbps as number | undefined;
  const write = entity.attributes.write_mbps as number | undefined;
  const users = entity.attributes.connected_users as number | undefined;
  const dashOffset = CIRC * (1 - safe / 100);

  return (
    <BaseTile label={friendly} status={status} icon={icon} pill={totalTb != null ? `${usedTb?.toFixed(1)}/${totalTb} TB` : `${safe.toFixed(0)}%`}>
      <div className="nas-tile">
        <svg className="nas-tile__svg" viewBox="0 0 80 80" aria-hidden>
          <circle cx="40" cy="40" r="30" className="nas-tile__bg" />
          <circle cx="40" cy="40" r="30" className={`nas-tile__fg nas-tile__fg--${status}`} transform="rotate(-90 40 40)" style={{ strokeDasharray: CIRC, strokeDashoffset: dashOffset }} />
          <text x="40" y="44" textAnchor="middle" className="nas-tile__pct">{safe.toFixed(0)}%</text>
        </svg>
        <div className="nas-tile__meta">
          <div className="nas-tile__metric"><span className="nas-tile__metric-label">READ</span><span className="nas-tile__metric-val">{read?.toFixed(1) ?? '--'} MB/s</span></div>
          <div className="nas-tile__metric"><span className="nas-tile__metric-label">WRITE</span><span className="nas-tile__metric-val">{write?.toFixed(1) ?? '--'} MB/s</span></div>
          {users != null && <div className="nas-tile__metric"><span className="nas-tile__metric-label">USERS</span><span className="nas-tile__metric-val">{users}</span></div>}
        </div>
      </div>
    </BaseTile>
  );
};
