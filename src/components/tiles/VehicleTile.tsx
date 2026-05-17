import type { FC, MouseEvent, ReactNode } from 'react';
import { BaseTile, type TileStatus } from './BaseTile';
import { useEntity, useHass } from '../../hass';

interface VehicleTileProps {
  entityId: string;
  label?: string;
  icon?: ReactNode;
  // Optional related entities — wire these to actually control the vehicle.
  lockEntityId?: string;
  climateEntityId?: string;
  startService?: { domain: string; service: string };
}

export const VehicleTile: FC<VehicleTileProps> = ({ entityId, label, icon, lockEntityId, climateEntityId, startService }) => {
  const entity = useEntity(entityId);
  const lock = useEntity(lockEntityId ?? '');
  const climate = useEntity(climateEntityId ?? '');
  const store = useHass();
  const friendly = label ?? (entity?.attributes.friendly_name as string | undefined) ?? entityId;
  if (!entity) return <BaseTile label={friendly} status="stale" icon={icon} pill="unavail"><div>n/a</div></BaseTile>;

  const stateLabel = entity.state.toUpperCase();
  const battery = entity.attributes.battery_level as number | undefined;
  const range = entity.attributes.range_miles as number | undefined;
  const charging = entity.attributes.charging as boolean | undefined;
  const locked = (entity.attributes.locked as boolean | undefined) ?? lock?.state === 'locked';
  const climateOn = (entity.attributes.climate_on as boolean | undefined) ?? climate?.state === 'on';
  const status: TileStatus = charging ? 'info' : entity.state === 'driving' ? 'warn' : 'idle';
  const batteryStatus: TileStatus = battery != null ? (battery < 15 ? 'alarm' : battery < 30 ? 'warn' : 'ok') : 'idle';

  const callLock = (lockState: boolean) => (e: MouseEvent) => {
    e.stopPropagation();
    if (lockEntityId) {
      store.callService('lock', lockState ? 'lock' : 'unlock', undefined, { entity_id: lockEntityId });
    }
  };
  const remoteStart = (e: MouseEvent) => {
    e.stopPropagation();
    const dom = startService?.domain ?? 'button';
    const svc = startService?.service ?? 'press';
    store.callService(dom, svc, undefined, { entity_id: entityId });
  };
  const toggleClimate = (e: MouseEvent) => {
    e.stopPropagation();
    if (climateEntityId) {
      store.callService('climate', climateOn ? 'turn_off' : 'turn_on', undefined, { entity_id: climateEntityId });
    }
  };

  return (
    <BaseTile label={friendly} status={status} icon={icon} pill={charging ? 'CHARGING' : stateLabel}>
      <div className="vehicle-tile">
        {battery != null && (
          <div className="vehicle-tile__battery">
            <div className="vehicle-tile__bat-bar">
              <div className={`vehicle-tile__bat-fill vehicle-tile__bat-fill--${batteryStatus}`} style={{ width: `${battery}%` }} />
            </div>
            <span className={`vehicle-tile__bat-pct vehicle-tile__bat-pct--${batteryStatus}`}>{battery}%</span>
            {range != null && <span className="vehicle-tile__range">{range} MI</span>}
          </div>
        )}
        <div className="vehicle-tile__controls">
          <button type="button" className={`vehicle-tile__btn${locked ? ' vehicle-tile__btn--active' : ''}`} onClick={callLock(true)} title="Lock">🔒</button>
          <button type="button" className={`vehicle-tile__btn${!locked ? ' vehicle-tile__btn--active' : ''}`} onClick={callLock(false)} title="Unlock">🔓</button>
          <button type="button" className="vehicle-tile__btn" onClick={remoteStart} title="Remote start">START</button>
          <button type="button" className={`vehicle-tile__btn${climateOn ? ' vehicle-tile__btn--active' : ''}`} onClick={toggleClimate} title="Climate">CLIM</button>
        </div>
      </div>
    </BaseTile>
  );
};
