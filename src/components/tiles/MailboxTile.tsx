import type { FC, ReactNode } from 'react';
import { BaseTile, type TileStatus } from './BaseTile';
import { useEntity } from '../../hass';

interface MailboxTileProps {
  entityId: string;
  label?: string;
  icon?: ReactNode;
}

function fmtTime(iso: string | undefined): string {
  if (!iso) return '---';
  try {
    return new Date(iso).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  } catch { return '---'; }
}

export const MailboxTile: FC<MailboxTileProps> = ({ entityId, label, icon }) => {
  const entity = useEntity(entityId);
  const friendly = label ?? (entity?.attributes.friendly_name as string | undefined) ?? entityId;
  if (!entity) return <BaseTile label={friendly} status="stale" icon={icon} pill="unavail"><div>n/a</div></BaseTile>;

  const packages = entity.attributes.packages as number | undefined ?? 0;
  const mail = entity.attributes.mail as number | undefined ?? 0;
  const last = entity.attributes.last_delivery as string | undefined;
  const total = packages + mail;
  const status: TileStatus = total > 0 ? 'info' : 'idle';

  return (
    <BaseTile label={friendly} status={status} icon={icon} pill={total > 0 ? 'NEW' : 'EMPTY'}>
      <div className="mailbox-tile">
        <div className="mailbox-tile__counts">
          <div className="mailbox-tile__count">
            <span className="mailbox-tile__count-num">{packages}</span>
            <span className="mailbox-tile__count-label">PACKAGES</span>
          </div>
          <div className="mailbox-tile__count">
            <span className="mailbox-tile__count-num">{mail}</span>
            <span className="mailbox-tile__count-label">MAIL</span>
          </div>
        </div>
        <div className="mailbox-tile__last">LAST: {fmtTime(last)}</div>
      </div>
    </BaseTile>
  );
};
