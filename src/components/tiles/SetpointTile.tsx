import type { FC, MouseEvent, ReactNode } from 'react';
import { BaseTile, type TileStatus } from './BaseTile';
import { useEntity, useHass } from '../../hass';

interface SetpointTileProps {
  entityId: string;
  label?: string;
  icon?: ReactNode;
  step?: number;
}

export const SetpointTile: FC<SetpointTileProps> = ({ entityId, label, icon, step }) => {
  const entity = useEntity(entityId);
  const store = useHass();
  const friendly =
    label ?? (entity?.attributes.friendly_name as string | undefined) ?? entityId;

  if (!entity) {
    return (
      <BaseTile label={friendly} status="stale" icon={icon} pill="unavail">
        <div className="setpoint-tile__row">
          <span className="setpoint-tile__num">n/a</span>
        </div>
      </BaseTile>
    );
  }

  const current = entity.attributes.current_temperature as number | undefined;
  const target = entity.attributes.temperature as number | undefined;
  const mode = entity.state;
  const unit = (entity.attributes.unit_of_measurement as string | undefined) ?? '°';
  const tempStep = step ?? (entity.attributes.target_temp_step as number | undefined) ?? 1;
  const minTemp = (entity.attributes.min_temp as number | undefined) ?? 40;
  const maxTemp = (entity.attributes.max_temp as number | undefined) ?? 95;

  const adjust = (delta: number) => (e: MouseEvent) => {
    e.stopPropagation();
    if (target == null) return;
    const next = Math.max(minTemp, Math.min(maxTemp, target + delta));
    store.callService(
      'climate',
      'set_temperature',
      { temperature: next },
      { entity_id: entityId },
    );
  };

  const status: TileStatus =
    mode === 'heat' ? 'warn'
    : mode === 'cool' ? 'info'
    : mode === 'off' ? 'idle'
    : 'ok';

  return (
    <BaseTile label={friendly} status={status} icon={icon} pill={mode}>
      <div className="setpoint-tile__row">
        <span className="setpoint-tile__current">
          <span className="setpoint-tile__num">{current ?? 'n/a'}</span>
          <span className="setpoint-tile__unit">{unit}</span>
        </span>
        <span className="setpoint-tile__arrow" aria-hidden>→</span>
        <span className="setpoint-tile__target">
          <span className="setpoint-tile__num">{target ?? 'n/a'}</span>
          <span className="setpoint-tile__unit">{unit}</span>
        </span>
      </div>
      <div className="setpoint-tile__controls">
        <button
          type="button"
          className="setpoint-tile__btn"
          onClick={adjust(-tempStep)}
          aria-label="decrease setpoint"
        >
          −
        </button>
        <button
          type="button"
          className="setpoint-tile__btn"
          onClick={adjust(tempStep)}
          aria-label="increase setpoint"
        >
          +
        </button>
      </div>
    </BaseTile>
  );
};
