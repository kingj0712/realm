import type { FC, ReactNode } from 'react';
import { BaseTile, type TileStatus } from './BaseTile';
import { useEntity } from '../../hass';

interface NetworkTileProps {
  entityId: string;
  label?: string;
  icon?: ReactNode;
}

export const NetworkTile: FC<NetworkTileProps> = ({ entityId, label, icon }) => {
  const entity = useEntity(entityId);
  const friendly = label ?? (entity?.attributes.friendly_name as string | undefined) ?? entityId;
  if (!entity) return <BaseTile label={friendly} status="stale" icon={icon} pill="unavail"><div>n/a</div></BaseTile>;

  const online = entity.state === 'online';
  const status: TileStatus = online ? 'ok' : 'alarm';
  const down = entity.attributes.download_mbps as number | undefined;
  const up = entity.attributes.upload_mbps as number | undefined;
  const ping = entity.attributes.ping_ms as number | undefined;

  return (
    <BaseTile label={friendly} status={status} icon={icon} pill={online ? 'ONLINE' : 'OFFLINE'}>
      <div className="network-tile">
        <div className="network-tile__row">
          <span className="network-tile__arrow network-tile__arrow--down">↓</span>
          <span className="network-tile__num">{down ?? 'n/a'}</span>
          <span className="network-tile__unit">Mbps</span>
        </div>
        <div className="network-tile__row">
          <span className="network-tile__arrow network-tile__arrow--up">↑</span>
          <span className="network-tile__num">{up ?? 'n/a'}</span>
          <span className="network-tile__unit">Mbps</span>
        </div>
        <div className="network-tile__ping">
          <span className="network-tile__ping-label">PING</span>
          <span className="network-tile__ping-value">{ping ?? '--'} ms</span>
        </div>
      </div>
    </BaseTile>
  );
};
