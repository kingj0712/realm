import { useState, type FC, type MouseEvent, type ReactNode } from 'react';
import { BaseTile, type TileStatus } from './BaseTile';
import { TileModal } from './TileModal';
import { ConfirmModal } from '../ConfirmModal';
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
  const [open, setOpen] = useState(false);
  const [pendingStart, setPendingStart] = useState(false);
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
    setPendingStart(true);
  };
  const confirmStart = () => {
    setPendingStart(false);
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
    <>
    <BaseTile label={friendly} status={status} icon={icon} pill={charging ? 'CHARGING' : stateLabel} onClick={() => setOpen(true)}>
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
    {pendingStart && (
      <ConfirmModal
        title="Remote start"
        message={`Start ${friendly} engine remotely?`}
        confirmText="START"
        tone="caution"
        onCancel={() => setPendingStart(false)}
        onConfirm={confirmStart}
      />
    )}
    {open && (
      <VehicleModal
        entity={entity}
        title={friendly}
        pill={charging ? 'CHARGING' : stateLabel}
        battery={battery}
        range={range}
        locked={locked}
        climateOn={climateOn}
        charging={charging ?? false}
        onLock={callLock(true)}
        onUnlock={callLock(false)}
        onStart={remoteStart}
        onToggleClimate={toggleClimate}
        onClose={() => setOpen(false)}
      />
    )}
    </>
  );
};

interface VehicleModalProps {
  entity: { state: string; attributes: Record<string, unknown> };
  title: string;
  pill?: string;
  battery?: number;
  range?: number;
  locked: boolean;
  climateOn: boolean;
  charging: boolean;
  onLock: (e: MouseEvent) => void;
  onUnlock: (e: MouseEvent) => void;
  onStart: (e: MouseEvent) => void;
  onToggleClimate: (e: MouseEvent) => void;
  onClose: () => void;
}

const VehicleModal: FC<VehicleModalProps> = ({
  entity, title, pill, battery, range, locked, climateOn, charging,
  onLock, onUnlock, onStart, onToggleClimate, onClose,
}) => {
  const odometer = entity.attributes.odometer as number | undefined;
  const fuel = entity.attributes.fuel_level as number | undefined;
  const tirePressure = entity.attributes.tire_pressure as number | undefined;
  const batteryStatus = battery != null ? (battery < 15 ? 'alarm' : battery < 30 ? 'warn' : 'ok') : 'idle';

  return (
    <TileModal title={title} pill={pill} onClose={onClose} size="lg">
      <div className="vehicle-modal">
        <div className="vehicle-modal__readings">
          {battery != null && (
            <div className="vehicle-modal__reading">
              <div className="vehicle-modal__reading-label">BATTERY</div>
              <div className="vehicle-modal__battery">
                <div className="vehicle-modal__battery-bar">
                  <div className={`vehicle-modal__battery-fill vehicle-modal__battery-fill--${batteryStatus}`} style={{ width: `${battery}%` }} />
                </div>
                <span className={`vehicle-modal__battery-pct vehicle-modal__battery-pct--${batteryStatus}`}>{battery}%</span>
              </div>
              {charging && <div className="vehicle-modal__reading-note">Charging</div>}
            </div>
          )}
          {range != null && (
            <div className="vehicle-modal__reading">
              <div className="vehicle-modal__reading-label">RANGE</div>
              <div className="vehicle-modal__reading-value">{range} <span className="vehicle-modal__reading-unit">MI</span></div>
            </div>
          )}
          {fuel != null && (
            <div className="vehicle-modal__reading">
              <div className="vehicle-modal__reading-label">FUEL</div>
              <div className="vehicle-modal__reading-value">{fuel}<span className="vehicle-modal__reading-unit">%</span></div>
            </div>
          )}
          {odometer != null && (
            <div className="vehicle-modal__reading">
              <div className="vehicle-modal__reading-label">ODOMETER</div>
              <div className="vehicle-modal__reading-value">{odometer.toLocaleString()} <span className="vehicle-modal__reading-unit">MI</span></div>
            </div>
          )}
          {tirePressure != null && (
            <div className="vehicle-modal__reading">
              <div className="vehicle-modal__reading-label">TIRE PSI</div>
              <div className="vehicle-modal__reading-value">{tirePressure}</div>
            </div>
          )}
        </div>

        <div className="vehicle-modal__controls">
          <div className="vehicle-modal__controls-label">CONTROLS</div>
          <div className="vehicle-modal__controls-row">
            <button type="button" className={`vehicle-modal__btn${locked ? ' vehicle-modal__btn--active' : ''}`} onClick={onLock}>LOCK</button>
            <button type="button" className={`vehicle-modal__btn${!locked ? ' vehicle-modal__btn--active' : ''}`} onClick={onUnlock}>UNLOCK</button>
            <button type="button" className="vehicle-modal__btn vehicle-modal__btn--accent" onClick={onStart}>REMOTE START</button>
            <button type="button" className={`vehicle-modal__btn${climateOn ? ' vehicle-modal__btn--active' : ''}`} onClick={onToggleClimate}>
              CLIMATE {climateOn ? 'OFF' : 'ON'}
            </button>
          </div>
        </div>
      </div>
    </TileModal>
  );
};
