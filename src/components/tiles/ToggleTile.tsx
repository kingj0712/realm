import type { FC, ReactNode } from 'react';
import { BaseTile, type TileStatus } from './BaseTile';
import { useEntity, useHass } from '../../hass';

interface ToggleTileProps {
  entityId: string;
  label?: string;
  icon?: ReactNode;
}

export const ToggleTile: FC<ToggleTileProps> = ({ entityId, label, icon }) => {
  const entity = useEntity(entityId);
  const store = useHass();
  const friendly =
    label ?? (entity?.attributes.friendly_name as string | undefined) ?? entityId;

  if (!entity) {
    return (
      <BaseTile label={friendly} status="stale" icon={icon} pill="unavail">
        <div className="toggle-tile__row">
          <span className="toggle-tile__state toggle-tile__state--idle">n/a</span>
        </div>
      </BaseTile>
    );
  }

  const isOn = entity.state === 'on';
  const status: TileStatus = isOn ? 'info' : 'idle';
  const domain = entityId.split('.')[0];

  const toggle = () => {
    store.callService(domain, 'toggle', undefined, { entity_id: entityId });
  };

  return (
    <BaseTile label={friendly} status={status} icon={icon} onClick={toggle}>
      <div className="toggle-tile__row">
        <span className={`toggle-tile__state toggle-tile__state--${status}`}>
          {isOn ? 'ON' : 'OFF'}
        </span>
        <span
          className={`toggle-tile__pill${isOn ? ' toggle-tile__pill--on' : ''}`}
          aria-hidden
        >
          <span className="toggle-tile__knob" />
        </span>
      </div>
    </BaseTile>
  );
};
