import type { FC, ReactNode, MouseEvent } from 'react';
import { mdiHome, mdiPlay, mdiStop } from '@mdi/js';
import { BaseTile, type TileStatus } from './BaseTile';
import { useEntity, useHass } from '../../hass';
import { Icon } from '../Icon';

interface VacuumTileProps {
  entityId: string;
  label?: string;
  icon?: ReactNode;
}

export const VacuumTile: FC<VacuumTileProps> = ({ entityId, label, icon }) => {
  const entity = useEntity(entityId);
  const store = useHass();
  const friendly = label ?? (entity?.attributes.friendly_name as string | undefined) ?? entityId;
  if (!entity) return <BaseTile label={friendly} status="stale" icon={icon} pill="unavail"><div>n/a</div></BaseTile>;

  const state = entity.state;
  const battery = entity.attributes.battery_level as number | undefined;
  const isActive = state === 'cleaning' || state === 'returning';
  const status: TileStatus = state === 'cleaning' ? 'info' : state === 'returning' ? 'warn' : state === 'docked' ? 'ok' : 'idle';

  const call = (service: string) => (e: MouseEvent) => {
    e.stopPropagation();
    store.callService('vacuum', service, undefined, { entity_id: entityId });
  };

  return (
    <BaseTile label={friendly} status={status} icon={icon} pill={state.toUpperCase()}>
      <div className="vacuum-tile">
        <div className="vacuum-tile__head">
          <div className="vacuum-tile__battery">
            <span className="vacuum-tile__battery-label">BAT</span>
            <span className="vacuum-tile__battery-value">{battery ?? '--'}%</span>
          </div>
          {isActive && <span className="vacuum-tile__spinner" />}
        </div>
        <div className="vacuum-tile__controls">
          <button type="button" className="vacuum-tile__btn" onClick={call('start')} aria-label="start">
            <Icon path={mdiPlay} size={16} />
          </button>
          <button type="button" className="vacuum-tile__btn" onClick={call('stop')} aria-label="stop">
            <Icon path={mdiStop} size={16} />
          </button>
          <button type="button" className="vacuum-tile__btn" onClick={call('return_to_base')} aria-label="dock">
            <Icon path={mdiHome} size={16} />
          </button>
        </div>
      </div>
    </BaseTile>
  );
};
