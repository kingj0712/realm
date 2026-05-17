import type { FC, ReactNode } from 'react';
import { BaseTile, type TileStatus } from './BaseTile';
import { useEntity } from '../../hass';

interface TrashScheduleTileProps {
  entityId: string;
  label?: string;
  icon?: ReactNode;
}

function fmtDate(iso: string | undefined): string {
  if (!iso) return '---';
  try {
    return new Date(iso).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' }).toUpperCase();
  } catch {
    return '---';
  }
}

export const TrashScheduleTile: FC<TrashScheduleTileProps> = ({ entityId, label, icon }) => {
  const entity = useEntity(entityId);
  const friendly = label ?? (entity?.attributes.friendly_name as string | undefined) ?? entityId;
  if (!entity) return <BaseTile label={friendly} status="stale" icon={icon} pill="unavail"><div>n/a</div></BaseTile>;

  const daysUntil = entity.attributes.days_until as number | undefined ?? parseInt(entity.state, 10);
  const nextDate = entity.attributes.next_date as string | undefined;
  const nextType = ((entity.attributes.next_type as string | undefined) ?? 'TRASH').toUpperCase();
  const status: TileStatus = daysUntil === 0 ? 'alarm' : daysUntil === 1 ? 'warn' : 'idle';

  return (
    <BaseTile label={friendly} status={status} icon={icon} pill={nextType}>
      <div className="trash-tile">
        <div className="trash-tile__count">
          <span className="trash-tile__num">{daysUntil}</span>
          <span className="trash-tile__num-label">{daysUntil === 1 ? 'DAY' : 'DAYS'}</span>
        </div>
        <div className="trash-tile__date">{fmtDate(nextDate)}</div>
      </div>
    </BaseTile>
  );
};
