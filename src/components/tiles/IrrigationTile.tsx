import type { FC, ReactNode, MouseEvent } from 'react';
import { BaseTile } from './BaseTile';
import { useEntity, useHass } from '../../hass';

interface IrrigationZone {
  entityId: string;
  label: string;
}

interface IrrigationTileProps {
  label?: string;
  icon?: ReactNode;
  zones: IrrigationZone[];
}

const ZoneRow: FC<{ zone: IrrigationZone }> = ({ zone }) => {
  const entity = useEntity(zone.entityId);
  const store = useHass();
  const running = entity?.state === 'on';
  const toggle = (e: MouseEvent) => {
    e.stopPropagation();
    store.callService('switch', 'toggle', undefined, { entity_id: zone.entityId });
  };
  return (
    <button
      type="button"
      className={`irrigation-tile__row${running ? ' irrigation-tile__row--running' : ''}`}
      onClick={toggle}
    >
      <span className="irrigation-tile__dot">{running ? '●' : '○'}</span>
      <span className="irrigation-tile__label">{zone.label}</span>
      <span className="irrigation-tile__state">{running ? 'RUNNING' : 'IDLE'}</span>
    </button>
  );
};

export const IrrigationTile: FC<IrrigationTileProps> = ({ label = 'IRRIGATION', icon, zones }) => {
  return (
    <BaseTile label={label} icon={icon}>
      <div className="irrigation-tile">
        {zones.map((z) => <ZoneRow key={z.entityId} zone={z} />)}
      </div>
    </BaseTile>
  );
};
