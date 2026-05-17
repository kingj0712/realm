import type { FC, ReactNode } from 'react';
import { BaseTile, type TileStatus } from './BaseTile';
import { useEntity } from '../../hass';

interface ApplianceTileProps {
  entityId: string;
  label?: string;
  icon?: ReactNode;
  // Attributes to display as info rows. Defaults pick common Samsung/SmartThings shapes.
  showCycle?: boolean;
  showTimeRemaining?: boolean;
  showPower?: boolean;
  showTemps?: boolean;
  showDoor?: boolean;
}

export const ApplianceTile: FC<ApplianceTileProps> = ({
  entityId, label, icon,
  showCycle = true, showTimeRemaining = true, showPower = true, showTemps = true, showDoor = true,
}) => {
  const entity = useEntity(entityId);
  const friendly = label ?? (entity?.attributes.friendly_name as string | undefined) ?? entityId;
  if (!entity) return <BaseTile label={friendly} status="stale" icon={icon} pill="unavail"><div>n/a</div></BaseTile>;

  const state = entity.state;
  const isActive = state === 'running' || state === 'cooking' || state === 'preheating' || state === 'cooling' || state === 'on';
  const status: TileStatus = state === 'fault' || state === 'error' ? 'alarm' : isActive ? 'info' : 'idle';

  const cycle = entity.attributes.cycle as string | undefined;
  const timeRemaining = entity.attributes.time_remaining as string | undefined;
  const power = entity.attributes.power_w as number | undefined;
  const currentTemp = entity.attributes.current_temp as number | undefined;
  const targetTemp = entity.attributes.target_temp as number | undefined;
  const fridgeTemp = entity.attributes.fridge_temp as number | undefined;
  const freezerTemp = entity.attributes.freezer_temp as number | undefined;
  const doorOpen = entity.attributes.door_open as boolean | undefined;
  const unit = (entity.attributes.unit as string | undefined) ?? '°F';

  return (
    <BaseTile label={friendly} status={status} icon={icon} pill={state.toUpperCase()}>
      <div className="appliance-tile">
        {showCycle && cycle && <div className="appliance-tile__row"><span className="appliance-tile__row-label">CYCLE</span><span className="appliance-tile__row-val">{cycle}</span></div>}
        {showTimeRemaining && timeRemaining && timeRemaining !== '00:00' && (
          <div className="appliance-tile__row"><span className="appliance-tile__row-label">REMAINING</span><span className="appliance-tile__row-val">{timeRemaining}</span></div>
        )}
        {showTemps && currentTemp != null && (
          <div className="appliance-tile__row"><span className="appliance-tile__row-label">TEMP</span><span className="appliance-tile__row-val">{currentTemp}{unit}{targetTemp != null && ` → ${targetTemp}${unit}`}</span></div>
        )}
        {showTemps && (fridgeTemp != null || freezerTemp != null) && (
          <div className="appliance-tile__row appliance-tile__row--temps">
            {fridgeTemp != null && <span><span className="appliance-tile__row-label">FRIDGE</span> {fridgeTemp}{unit}</span>}
            {freezerTemp != null && <span><span className="appliance-tile__row-label">FREEZER</span> {freezerTemp}{unit}</span>}
          </div>
        )}
        {showDoor && doorOpen != null && (
          <div className="appliance-tile__row"><span className="appliance-tile__row-label">DOOR</span><span className={`appliance-tile__row-val${doorOpen ? ' appliance-tile__row-val--warn' : ''}`}>{doorOpen ? 'OPEN' : 'CLOSED'}</span></div>
        )}
        {showPower && power != null && (
          <div className="appliance-tile__row"><span className="appliance-tile__row-label">POWER</span><span className="appliance-tile__row-val">{power} W</span></div>
        )}
      </div>
    </BaseTile>
  );
};
