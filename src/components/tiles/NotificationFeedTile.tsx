import type { FC, ReactNode } from 'react';
import { BaseTile, type TileStatus } from './BaseTile';
import { useEntity } from '../../hass';

interface Notification {
  time: string;
  level: 'info' | 'warn' | 'alarm' | 'ok';
  text: string;
}

interface NotificationFeedTileProps {
  entityId: string;
  label?: string;
  icon?: ReactNode;
  max?: number;
}

function fmtTime(iso: string): string {
  try {
    return new Date(iso).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
  } catch {
    return '--:--';
  }
}

export const NotificationFeedTile: FC<NotificationFeedTileProps> = ({ entityId, label, icon, max = 6 }) => {
  const entity = useEntity(entityId);
  const friendly = label ?? (entity?.attributes.friendly_name as string | undefined) ?? entityId;
  if (!entity) return <BaseTile label={friendly} status="stale" icon={icon} pill="unavail"><div>n/a</div></BaseTile>;

  const items = ((entity.attributes.items as Notification[] | undefined) ?? []).slice(0, max);

  return (
    <BaseTile label={friendly} icon={icon} pill={`${items.length} RECENT`}>
      <div className="notif-feed">
        {items.map((n, i) => {
          const lvl: TileStatus = n.level === 'alarm' ? 'alarm' : n.level === 'warn' ? 'warn' : n.level === 'ok' ? 'ok' : 'info';
          return (
            <div key={i} className={`notif-feed__row notif-feed__row--${lvl}`}>
              <span className="notif-feed__time">{fmtTime(n.time)}</span>
              <span className="notif-feed__dot" />
              <span className="notif-feed__text">{n.text}</span>
            </div>
          );
        })}
      </div>
    </BaseTile>
  );
};
