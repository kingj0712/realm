import type { FC, ReactNode } from 'react';
import { BaseTile, type TileStatus } from './BaseTile';
import { useEntity } from '../../hass';

interface AlarmTileProps {
  entityId: string;
  label?: string;
  icon?: ReactNode;
  // Which state means "alarm active." Default 'on' covers smoke/water/etc.
  alarmWhen?: 'on' | 'off';
}

export const AlarmTile: FC<AlarmTileProps> = ({ entityId, label, icon, alarmWhen = 'on' }) => {
  const entity = useEntity(entityId);
  const friendly =
    label ?? (entity?.attributes.friendly_name as string | undefined) ?? entityId;

  if (!entity) {
    return (
      <BaseTile label={friendly} status="stale" icon={icon} pill="unavail">
        <div className="alarm-tile__state alarm-tile__state--ok">n/a</div>
      </BaseTile>
    );
  }

  const isAlarm = entity.state === alarmWhen;
  const status: TileStatus = isAlarm ? 'alarm' : 'ok';

  return (
    <BaseTile label={friendly} status={status} icon={icon} pill={isAlarm ? 'active' : 'clear'}>
      <div className={`alarm-tile__state alarm-tile__state--${status}`}>
        {isAlarm && <span className="alarm-tile__pulse" aria-hidden />}
        {isAlarm ? 'ALARM' : 'CLEAR'}
      </div>
    </BaseTile>
  );
};
