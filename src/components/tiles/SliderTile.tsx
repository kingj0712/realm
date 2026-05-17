import type { ChangeEvent, CSSProperties, FC, ReactNode } from 'react';
import { useState } from 'react';
import { BaseTile, type TileStatus } from './BaseTile';
import { useEntity, useHass } from '../../hass';

interface SliderTileProps {
  entityId: string;
  label?: string;
  icon?: ReactNode;
  // Defaults assume a dimmable light (light.turn_on with brightness_pct).
  min?: number;
  max?: number;
  step?: number;
}

export const SliderTile: FC<SliderTileProps> = ({
  entityId,
  label,
  icon,
  min = 0,
  max = 100,
  step = 1,
}) => {
  const entity = useEntity(entityId);
  const store = useHass();
  const [dragValue, setDragValue] = useState<number | null>(null);
  const friendly = label ?? (entity?.attributes.friendly_name as string | undefined) ?? entityId;

  if (!entity) {
    return (
      <BaseTile label={friendly} status="stale" icon={icon} pill="unavail">
        <div className="slider-tile">n/a</div>
      </BaseTile>
    );
  }

  // Translate HA brightness (0-255) to 0-100 for display.
  const brightnessRaw = entity.attributes.brightness as number | undefined;
  const realValue = entity.state === 'on' && brightnessRaw != null
    ? Math.round((brightnessRaw / 255) * 100)
    : entity.state === 'on' ? 100 : 0;

  const value = dragValue ?? realValue;
  const isOn = entity.state === 'on' || value > 0;
  const status: TileStatus = isOn ? 'info' : 'idle';

  const onChange = (e: ChangeEvent<HTMLInputElement>) => {
    setDragValue(Number(e.target.value));
  };

  const commit = () => {
    if (dragValue == null) return;
    if (dragValue === 0) {
      store.callService('light', 'turn_off', undefined, { entity_id: entityId });
    } else {
      store.callService('light', 'turn_on', { brightness_pct: dragValue }, { entity_id: entityId });
    }
    setDragValue(null);
  };

  const sliderStyle: CSSProperties = {
    // Drive the filled-track gradient via custom properties.
    ['--slider-pct' as string]: `${value}%`,
  };

  return (
    <BaseTile label={friendly} status={status} icon={icon} pill={isOn ? 'ON' : 'OFF'}>
      <div className="slider-tile">
        <div className="slider-tile__head">
          <span className="slider-tile__num">{value}</span>
          <span className="slider-tile__unit">%</span>
        </div>
        <input
          type="range"
          className={`slider-tile__input slider-tile__input--${status}`}
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={onChange}
          onMouseUp={commit}
          onTouchEnd={commit}
          onKeyUp={commit}
          style={sliderStyle}
          aria-label={`${friendly} brightness`}
        />
      </div>
    </BaseTile>
  );
};
