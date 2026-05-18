import { useState, type FC, type ReactNode } from 'react';
import { BaseTile, type TileStatus } from './BaseTile';
import { useEntity } from '../../hass';
import { EntityDetailModal } from '../EntityDetailModal';

interface AlarmTileProps {
  entityId: string;
  label?: string;
  icon?: ReactNode;
  // Which state means "alarm active." Default 'on' covers smoke/water/etc.
  alarmWhen?: 'on' | 'off';
}

export const AlarmTile: FC<AlarmTileProps> = ({ entityId, label, icon, alarmWhen = 'on' }) => {
  const entity = useEntity(entityId);
  const [open, setOpen] = useState(false);
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
  const pill = isAlarm ? 'ACTIVE' : 'CLEAR';

  return (
    <>
      <BaseTile label={friendly} status={status} icon={icon} pill={pill} onClick={() => setOpen(true)}>
        <div className={`alarm-tile__state alarm-tile__state--${status}`}>
          {isAlarm && <span className="alarm-tile__pulse" aria-hidden />}
          {isAlarm ? 'ALARM' : 'CLEAR'}
        </div>
      </BaseTile>
      {open && (
        <EntityDetailModal
          entityId={entityId}
          title={friendly}
          pill={pill}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  );
};
