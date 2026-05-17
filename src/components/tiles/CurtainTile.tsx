import type { ChangeEvent, CSSProperties, FC, MouseEvent, ReactNode } from 'react';
import { useState } from 'react';
import { BaseTile, type TileStatus } from './BaseTile';
import { useEntity, useHass } from '../../hass';

interface CurtainTileProps {
  entityId: string;
  label?: string;
  icon?: ReactNode;
}

export const CurtainTile: FC<CurtainTileProps> = ({ entityId, label, icon }) => {
  const entity = useEntity(entityId);
  const store = useHass();
  const [dragPos, setDragPos] = useState<number | null>(null);
  const friendly = label ?? (entity?.attributes.friendly_name as string | undefined) ?? entityId;
  if (!entity) return <BaseTile label={friendly} status="stale" icon={icon} pill="unavail"><div>n/a</div></BaseTile>;

  const realPos = (entity.attributes.current_position as number | undefined) ?? (entity.state === 'open' ? 100 : 0);
  const position = dragPos ?? realPos;
  const isOpen = position > 5;
  const status: TileStatus = isOpen ? 'info' : 'idle';

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

  const halfOpen = position / 2;
  const leftPanelWidth = 50 - halfOpen;
  const rightPanelStart = 50 + halfOpen;
  const sliderStyle: CSSProperties = { ['--slider-pct' as string]: `${position}%` };

  return (
    <BaseTile label={friendly} status={status} icon={icon} pill={`${position}%`}>
      <div className="curtain-tile">
        <svg className="curtain-tile__svg" viewBox="0 0 100 60" preserveAspectRatio="xMidYMid meet" aria-hidden>
          <rect x="2" y="2" width="96" height="56" fill="rgba(34,211,238,0.04)" stroke="var(--on-surface-faint)" strokeWidth="0.5" />
          <line x1="0" y1="4" x2="100" y2="4" stroke="var(--on-surface-faint)" strokeWidth="1" />
          <g className="curtain-tile__panel curtain-tile__panel--left">
            <rect x="0" y="4" width={leftPanelWidth} height="54" fill="var(--surface-container-highest)" />
            {[...Array(6)].map((_, i) => (
              <line key={i} x1={(i + 0.5) * (leftPanelWidth / 6)} y1="4" x2={(i + 0.5) * (leftPanelWidth / 6)} y2="58" stroke="rgba(255,255,255,0.05)" strokeWidth="0.4" />
            ))}
          </g>
          <g className="curtain-tile__panel curtain-tile__panel--right">
            <rect x={rightPanelStart} y="4" width={100 - rightPanelStart} height="54" fill="var(--surface-container-highest)" />
            {[...Array(6)].map((_, i) => {
              const w = 100 - rightPanelStart;
              return (
                <line key={i} x1={rightPanelStart + (i + 0.5) * (w / 6)} y1="4" x2={rightPanelStart + (i + 0.5) * (w / 6)} y2="58" stroke="rgba(255,255,255,0.05)" strokeWidth="0.4" />
              );
            })}
          </g>
        </svg>
        <input
          type="range"
          className="curtain-tile__slider"
          min={0}
          max={100}
          step={1}
          value={position}
          onChange={onSliderChange}
          onMouseUp={commitSlider}
          onTouchEnd={commitSlider}
          onKeyUp={commitSlider}
          style={sliderStyle}
          aria-label="curtain position"
        />
        <div className="curtain-tile__controls">
          <button type="button" className="curtain-tile__btn" onClick={call('open_cover')}>OPEN</button>
          <button type="button" className="curtain-tile__btn" onClick={call('close_cover')}>CLOSE</button>
        </div>
      </div>
    </BaseTile>
  );
};
