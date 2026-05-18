import type { FC, ReactNode } from 'react';
import { BaseTile, type TileStatus } from './BaseTile';
import { useEntity, useHass, getEntityDisplayState } from '../../hass';

interface StatusMapping {
  text: string;
  status: TileStatus;
}

interface StatusTileProps {
  entityId: string;
  label?: string;
  icon?: ReactNode;
  // Override default state interpretation. Useful for sensors where 'on' means
  // alarm (water leak) vs sensors where 'on' means good (locked).
  states?: { on?: StatusMapping; off?: StatusMapping };
}

const DEFAULT_STATES: Required<NonNullable<StatusTileProps['states']>> = {
  on: { text: 'ON', status: 'info' },
  off: { text: 'OFF', status: 'idle' },
};

export const StatusTile: FC<StatusTileProps> = ({ entityId, label, icon, states = DEFAULT_STATES }) => {
  const entity = useEntity(entityId);
  const store = useHass();
  const friendly =
    label ?? (entity?.attributes.friendly_name as string | undefined) ?? entityId;

  const missing = getEntityDisplayState(entityId, entity, store);
  if (missing.kind !== 'live-ok' || !entity) {
    return (
      <BaseTile label={friendly} status={missing.kind === 'live-unavailable' ? 'stale' : 'idle'} icon={icon} pill={missing.pill}>
        <div className="status-tile__state status-tile__state--idle">{missing.text}</div>
      </BaseTile>
    );
  }

  const isOn = entity.state === 'on';
  const cfg = (isOn ? states.on : states.off) ?? DEFAULT_STATES[isOn ? 'on' : 'off'];

  return (
    <BaseTile label={friendly} status={cfg.status} icon={icon}>
      <div className={`status-tile__state status-tile__state--${cfg.status}`}>{cfg.text}</div>
    </BaseTile>
  );
};
