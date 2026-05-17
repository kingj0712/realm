import type { ChangeEvent, CSSProperties, FC, ReactNode } from 'react';
import { useState } from 'react';
import { BaseTile, type TileStatus } from './BaseTile';
import { useEntity, useHass } from '../../hass';

interface ColorPickerTileProps {
  entityId: string;
  label?: string;
  icon?: ReactNode;
}

// Convert hue (0..360) at full saturation/value to RGB.
function hueToRgb(h: number): [number, number, number] {
  const c = 1;
  const hp = (h % 360) / 60;
  const x = c * (1 - Math.abs((hp % 2) - 1));
  let r = 0, g = 0, b = 0;
  if (hp < 1)      { r = c; g = x; b = 0; }
  else if (hp < 2) { r = x; g = c; b = 0; }
  else if (hp < 3) { r = 0; g = c; b = x; }
  else if (hp < 4) { r = 0; g = x; b = c; }
  else if (hp < 5) { r = x; g = 0; b = c; }
  else             { r = c; g = 0; b = x; }
  return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
}

// Convert RGB back to hue (0..360). Ignores saturation/value.
function rgbToHue(r: number, g: number, b: number): number {
  const rn = r / 255, gn = g / 255, bn = b / 255;
  const max = Math.max(rn, gn, bn);
  const min = Math.min(rn, gn, bn);
  if (max === min) return 0;
  const d = max - min;
  let h = 0;
  if (max === rn) h = ((gn - bn) / d) % 6;
  else if (max === gn) h = (bn - rn) / d + 2;
  else h = (rn - gn) / d + 4;
  h *= 60;
  if (h < 0) h += 360;
  return h;
}

export const ColorPickerTile: FC<ColorPickerTileProps> = ({ entityId, label, icon }) => {
  const entity = useEntity(entityId);
  const store = useHass();
  const [dragHue, setDragHue] = useState<number | null>(null);
  const [dragBright, setDragBright] = useState<number | null>(null);
  const friendly = label ?? (entity?.attributes.friendly_name as string | undefined) ?? entityId;

  if (!entity) {
    return (
      <BaseTile label={friendly} status="stale" icon={icon} pill="unavail">
        <div className="color-picker-tile">n/a</div>
      </BaseTile>
    );
  }

  const rgb = entity.attributes.rgb_color as [number, number, number] | undefined;
  const realHue = rgb ? Math.round(rgbToHue(rgb[0], rgb[1], rgb[2])) : 0;
  const brightnessRaw = entity.attributes.brightness as number | undefined;
  const realBright = brightnessRaw != null ? Math.round((brightnessRaw / 255) * 100) : 100;

  const hue = dragHue ?? realHue;
  const bright = dragBright ?? realBright;
  const [r, g, b] = hueToRgb(hue);
  const previewRgb = `rgb(${r}, ${g}, ${b})`;
  const isOn = entity.state === 'on';
  const status: TileStatus = isOn ? 'info' : 'idle';

  const onHueChange = (e: ChangeEvent<HTMLInputElement>) => setDragHue(Number(e.target.value));
  const onBrightChange = (e: ChangeEvent<HTMLInputElement>) => setDragBright(Number(e.target.value));

  const commitHue = () => {
    if (dragHue == null) return;
    const [rr, gg, bb] = hueToRgb(dragHue);
    store.callService('light', 'turn_on', { rgb_color: [rr, gg, bb] }, { entity_id: entityId });
    setDragHue(null);
  };

  const commitBright = () => {
    if (dragBright == null) return;
    if (dragBright === 0) {
      store.callService('light', 'turn_off', undefined, { entity_id: entityId });
    } else {
      store.callService('light', 'turn_on', { brightness_pct: dragBright }, { entity_id: entityId });
    }
    setDragBright(null);
  };

  return (
    <BaseTile label={friendly} status={status} icon={icon} pill={isOn ? 'ON' : 'OFF'}>
      <div className="color-picker-tile">
        <div className="color-picker-tile__swatch-row">
          <div className="color-picker-tile__swatch" style={{ background: previewRgb }} />
          <div className="color-picker-tile__readout">
            <span className="color-picker-tile__rgb">rgb({r}, {g}, {b})</span>
            <span className="color-picker-tile__bright">{bright}% bright</span>
          </div>
        </div>
        <input
          type="range"
          className="color-picker-tile__hue"
          min={0}
          max={360}
          step={1}
          value={hue}
          onChange={onHueChange}
          onMouseUp={commitHue}
          onTouchEnd={commitHue}
          onKeyUp={commitHue}
          aria-label="hue"
        />
        <input
          type="range"
          className="color-picker-tile__bright-slider"
          min={0}
          max={100}
          step={1}
          value={bright}
          onChange={onBrightChange}
          onMouseUp={commitBright}
          onTouchEnd={commitBright}
          onKeyUp={commitBright}
          style={{ ['--slider-fg' as string]: previewRgb, ['--slider-pct' as string]: `${bright}%` } as CSSProperties}
          aria-label="brightness"
        />
      </div>
    </BaseTile>
  );
};
