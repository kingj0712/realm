import type { ChangeEvent, CSSProperties, FC, MouseEvent, ReactNode } from 'react';
import { useState } from 'react';
import { BaseTile, type TileStatus } from './BaseTile';
import { useEntity, useHass } from '../../hass';

interface BlindsTileProps {
  entityId: string;
  label?: string;
  icon?: ReactNode;
  slatCount?: number;
}

export const BlindsTile: FC<BlindsTileProps> = ({ entityId, label, icon, slatCount = 10 }) => {
  const entity = useEntity(entityId);
  const store = useHass();
  const [dragPos, setDragPos] = useState<number | null>(null);
  const friendly = label ?? (entity?.attributes.friendly_name as string | undefined) ?? entityId;
  if (!entity) return <BaseTile label={friendly} status="stale" icon={icon} pill="unavail"><div>n/a</div></BaseTile>;

  const realPos = (entity.attributes.current_position as number | undefined) ?? (entity.state === 'open' ? 100 : 0);
  const position = dragPos ?? realPos;
  const isOpen = position > 5;
  const status: TileStatus = isOpen ? 'info' : 'idle';
  const closedFraction = (100 - position) / 100;

  const call = (service: string, data?: Record<string, unknown>) => (e: MouseEvent) => {
    e.stopPropagation();
    store.callService('cover', service, data, { entity_id: entityId });
  };

  const onSliderChange = (e: ChangeEvent<HTMLInputElement>) => setDragPos(Number(e.target.value));
  const commitSlider = () => {
    if (dragPos == null) return;
    store.callService('cover', 'set_cover_position', { position: dragPos }, { entity_id: entityId });
    setDragPos(null);
  };

  const winTop = 4;
  const winH = 54;
  const slatH = winH / slatCount;
  const sliderStyle: CSSProperties = { ['--slider-pct' as string]: `${position}%` };

  return (
    <BaseTile label={friendly} status={status} icon={icon} pill={`${position}%`}>
      <div className="blinds-tile">
        <svg className="blinds-tile__svg" viewBox="0 0 100 70" preserveAspectRatio="xMidYMid meet" aria-hidden>
          <rect x="4" y="4" width="92" height="54" fill="rgba(34,211,238,0.06)" stroke="var(--on-surface-faint)" strokeWidth="0.5" />
          <rect x="2" y="2" width="96" height="3.5" fill="var(--surface-container-highest)" stroke="rgba(255,255,255,0.10)" strokeWidth="0.3" />
          <g
            className="blinds-tile__slats"
            transform={`matrix(1 0 0 ${closedFraction} 0 ${winTop * (1 - closedFraction)})`}
          >
            {Array.from({ length: slatCount }).map((_, i) => (
              <rect
                key={i}
                x="6"
                y={winTop + i * slatH}
                width="88"
                height={slatH - 0.4}
                fill="var(--surface-container-highest)"
                stroke="rgba(0,0,0,0.30)"
                strokeWidth="0.3"
              />
            ))}
          </g>
          <line x1="93" y1="2" x2="93" y2={winTop + winH * closedFraction + 4} stroke="var(--on-surface-faint)" strokeWidth="0.4" />
          <circle cx="93" cy={winTop + winH * closedFraction + 5} r="1.2" fill="var(--on-surface-faint)" />
        </svg>
        <input
          type="range"
          className="blinds-tile__slider"
          min={0}
          max={100}
          step={1}
          value={position}
          onChange={onSliderChange}
          onMouseUp={commitSlider}
          onTouchEnd={commitSlider}
          onKeyUp={commitSlider}
          style={sliderStyle}
          aria-label="blinds position"
        />
        <div className="blinds-tile__controls">
          <button type="button" className="blinds-tile__btn" onClick={call('open_cover')}>OPEN</button>
          <button type="button" className="blinds-tile__btn" onClick={call('close_cover')}>CLOSE</button>
        </div>
      </div>
    </BaseTile>
  );
};
