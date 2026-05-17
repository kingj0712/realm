import type { FC, ReactNode } from 'react';
import { BaseTile } from './BaseTile';
import { useEntity } from '../../hass';

interface PresenceListTileProps {
  label?: string;
  icon?: ReactNode;
  personIds: string[];
}

function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/);
  return parts.map((p) => p[0]?.toUpperCase() ?? '').slice(0, 2).join('');
}

const PresenceRow: FC<{ entityId: string }> = ({ entityId }) => {
  const entity = useEntity(entityId);
  if (!entity) return null;
  const name = (entity.attributes.friendly_name as string | undefined) ?? entityId;
  const state = entity.state;
  const isHome = state === 'home';
  const variant = isHome ? 'ok' : state === 'not_home' || state === 'away' ? 'idle' : 'info';
  const zoneLabel = state.replace(/_/g, ' ').toUpperCase();
  return (
    <div className="presence-list__row">
      <span className={`presence-list__avatar presence-list__avatar--${variant}`}>{initialsOf(name)}</span>
      <span className="presence-list__name">{name}</span>
      <span className={`presence-list__state presence-list__state--${variant}`}>{zoneLabel}</span>
    </div>
  );
};

export const PresenceListTile: FC<PresenceListTileProps> = ({ label = 'PRESENCE', icon, personIds }) => {
  return (
    <BaseTile label={label} icon={icon}>
      <div className="presence-list">
        {personIds.map((id) => <PresenceRow key={id} entityId={id} />)}
      </div>
    </BaseTile>
  );
};
