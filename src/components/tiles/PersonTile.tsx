import type { FC, ReactNode } from 'react';
import { BaseTile, type TileStatus } from './BaseTile';
import { useEntity } from '../../hass';

interface PersonTileProps {
  entityId: string;
  label?: string;
  icon?: ReactNode;
}

function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/);
  return parts.map((p) => p[0]?.toUpperCase() ?? '').slice(0, 2).join('');
}

export const PersonTile: FC<PersonTileProps> = ({ entityId, label, icon }) => {
  const entity = useEntity(entityId);
  const friendly = label ?? (entity?.attributes.friendly_name as string | undefined) ?? entityId;
  if (!entity) return <BaseTile label={friendly} status="stale" icon={icon} pill="unavail"><div>n/a</div></BaseTile>;

  const state = entity.state;
  const isHome = state === 'home';
  const status: TileStatus = isHome ? 'ok' : state === 'not_home' || state === 'away' ? 'idle' : 'info';
  const picture = entity.attributes.entity_picture as string | undefined | null;
  const zone = state.replace(/_/g, ' ').toUpperCase();

  return (
    <BaseTile label={friendly} status={status} icon={icon} pill={zone}>
      <div className="person-tile">
        <div className={`person-tile__avatar person-tile__avatar--${status}`}>
          {picture ? <img src={picture} alt={friendly} /> : <span>{initialsOf(friendly)}</span>}
          <span className={`person-tile__indicator person-tile__indicator--${status}`} />
        </div>
        <div className="person-tile__info">
          <div className="person-tile__name">{friendly}</div>
          <div className="person-tile__zone">{zone}</div>
        </div>
      </div>
    </BaseTile>
  );
};
