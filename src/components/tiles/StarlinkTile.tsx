import type { FC, ReactNode } from 'react';
import { BaseTile, type TileStatus } from './BaseTile';
import { useEntity } from '../../hass';

interface StarlinkTileProps {
  entityId: string;
  label?: string;
  icon?: ReactNode;
}

export const StarlinkTile: FC<StarlinkTileProps> = ({ entityId, label, icon }) => {
  const entity = useEntity(entityId);
  const friendly = label ?? (entity?.attributes.friendly_name as string | undefined) ?? entityId;
  if (!entity) return <BaseTile label={friendly} status="stale" icon={icon} pill="unavail"><div>n/a</div></BaseTile>;

  const online = entity.state === 'online';
  const obstructed = entity.state === 'obstructed';
  const status: TileStatus = online ? 'ok' : obstructed ? 'warn' : 'alarm';

  const down = entity.attributes.download_mbps as number | undefined;
  const up = entity.attributes.upload_mbps as number | undefined;
  const ping = entity.attributes.ping_ms as number | undefined;
  const obstruction = entity.attributes.obstruction_pct as number | undefined;
  const uptime = entity.attributes.uptime_pct as number | undefined;

  return (
    <BaseTile label={friendly} status={status} icon={icon} pill={entity.state.toUpperCase()}>
      <div className="starlink-tile">
        <div className="starlink-tile__throughput">
          <div className="starlink-tile__line"><span className="starlink-tile__arrow">↓</span><span className="starlink-tile__num">{down?.toFixed(0) ?? '--'}</span><span className="starlink-tile__unit">Mbps</span></div>
          <div className="starlink-tile__line"><span className="starlink-tile__arrow">↑</span><span className="starlink-tile__num">{up?.toFixed(0) ?? '--'}</span><span className="starlink-tile__unit">Mbps</span></div>
        </div>
        <div className="starlink-tile__stats">
          <div className="starlink-tile__stat"><span className="starlink-tile__stat-label">PING</span><span className="starlink-tile__stat-val">{ping ?? '--'} ms</span></div>
          <div className="starlink-tile__stat"><span className="starlink-tile__stat-label">UPTIME</span><span className="starlink-tile__stat-val">{uptime?.toFixed(1) ?? '--'}%</span></div>
        </div>
        {obstruction != null && (
          <div className="starlink-tile__obstr">
            <span className="starlink-tile__obstr-label">OBSTR</span>
            <div className="starlink-tile__obstr-bar"><div className={`starlink-tile__obstr-fill starlink-tile__obstr-fill--${obstruction > 5 ? 'warn' : 'ok'}`} style={{ width: `${Math.min(100, obstruction * 5)}%` }} /></div>
            <span className="starlink-tile__obstr-val">{obstruction.toFixed(1)}%</span>
          </div>
        )}
      </div>
    </BaseTile>
  );
};
