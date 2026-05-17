import type { FC, ReactNode } from 'react';
import { BaseTile, type TileStatus } from './BaseTile';
import { useEntity } from '../../hass';

interface UDMTileProps {
  entityId: string;
  label?: string;
  icon?: ReactNode;
}

export const UDMTile: FC<UDMTileProps> = ({ entityId, label, icon }) => {
  const entity = useEntity(entityId);
  const friendly = label ?? (entity?.attributes.friendly_name as string | undefined) ?? entityId;
  if (!entity) return <BaseTile label={friendly} status="stale" icon={icon} pill="unavail"><div>n/a</div></BaseTile>;

  const wan = (entity.attributes.wan_status as string | undefined) ?? entity.state;
  const wanOk = wan === 'connected' || wan === 'online';
  const status: TileStatus = wanOk ? 'ok' : 'alarm';
  const clients = entity.attributes.clients_count as number | undefined;
  const down = entity.attributes.download_mbps as number | undefined;
  const up = entity.attributes.upload_mbps as number | undefined;
  const uptime = entity.attributes.uptime_days as number | undefined;

  return (
    <BaseTile label={friendly} status={status} icon={icon} pill={wanOk ? 'WAN OK' : 'WAN DOWN'}>
      <div className="udm-tile">
        <div className="udm-tile__clients">
          <span className="udm-tile__clients-num">{clients ?? '--'}</span>
          <span className="udm-tile__clients-label">CLIENTS</span>
        </div>
        <div className="udm-tile__stats">
          <div className="udm-tile__stat"><span className="udm-tile__stat-arrow">↓</span>{down ?? '--'} <span className="udm-tile__stat-unit">Mbps</span></div>
          <div className="udm-tile__stat"><span className="udm-tile__stat-arrow">↑</span>{up ?? '--'} <span className="udm-tile__stat-unit">Mbps</span></div>
          {uptime != null && <div className="udm-tile__uptime">UPTIME {uptime}D</div>}
        </div>
      </div>
    </BaseTile>
  );
};
