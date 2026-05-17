import type { FC, MouseEvent, ReactNode } from 'react';
import { mdiFan, mdiLightbulbOn } from '@mdi/js';
import { BaseTile, type TileStatus } from './BaseTile';
import { useEntity, useHass } from '../../hass';
import { Icon } from '../Icon';

interface LightFanTileProps {
  label?: string;
  icon?: ReactNode;
  lightEntityId: string;
  fanEntityId: string;
}

// Simple two-button tile: light on/off + fan on/off. Per Jake's feedback —
// the slider/speed picker was too much for the common case.
export const LightFanTile: FC<LightFanTileProps> = ({ label = 'LIGHT + FAN', icon, lightEntityId, fanEntityId }) => {
  const light = useEntity(lightEntityId);
  const fan = useEntity(fanEntityId);
  const store = useHass();
  const lightOn = light?.state === 'on';
  const fanOn = fan?.state === 'on';
  const status: TileStatus = lightOn || fanOn ? 'info' : 'idle';

  const toggleLight = (e: MouseEvent) => {
    e.stopPropagation();
    store.callService('light', 'toggle', undefined, { entity_id: lightEntityId });
  };
  const toggleFan = (e: MouseEvent) => {
    e.stopPropagation();
    store.callService('fan', 'toggle', undefined, { entity_id: fanEntityId });
  };

  return (
    <BaseTile label={label} status={status} icon={icon} pill={lightOn && fanOn ? 'BOTH ON' : lightOn ? 'LIGHT' : fanOn ? 'FAN' : 'OFF'}>
      <div className="lightfan-tile">
        <button
          type="button"
          className={`lightfan-tile__btn${lightOn ? ' lightfan-tile__btn--on lightfan-tile__btn--on-light' : ''}`}
          onClick={toggleLight}
        >
          <Icon path={mdiLightbulbOn} size={18} />
          <span className="lightfan-tile__btn-text">LIGHT</span>
          <span className="lightfan-tile__btn-state">{lightOn ? 'ON' : 'OFF'}</span>
        </button>
        <button
          type="button"
          className={`lightfan-tile__btn${fanOn ? ' lightfan-tile__btn--on lightfan-tile__btn--on-fan' : ''}`}
          onClick={toggleFan}
        >
          <Icon path={mdiFan} size={18} />
          <span className="lightfan-tile__btn-text">FAN</span>
          <span className="lightfan-tile__btn-state">{fanOn ? 'ON' : 'OFF'}</span>
        </button>
      </div>
    </BaseTile>
  );
};
