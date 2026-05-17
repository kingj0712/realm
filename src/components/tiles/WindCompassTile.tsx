import type { FC, ReactNode } from 'react';
import { BaseTile } from './BaseTile';
import { useEntity } from '../../hass';

interface WindCompassTileProps {
  label?: string;
  icon?: ReactNode;
  speedEntityId: string;
  directionEntityId: string;
}

function compassPoint(deg: number): string {
  const dirs = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  return dirs[Math.round(deg / 45) % 8];
}

export const WindCompassTile: FC<WindCompassTileProps> = ({ label = 'WIND', icon, speedEntityId, directionEntityId }) => {
  const speed = useEntity(speedEntityId);
  const dir = useEntity(directionEntityId);
  const speedVal = speed ? parseFloat(speed.state) : NaN;
  const dirVal = dir ? parseFloat(dir.state) : 0;
  const speedUnit = (speed?.attributes.unit_of_measurement as string | undefined) ?? 'mph';
  const point = Number.isFinite(dirVal) ? compassPoint(dirVal) : '---';

  return (
    <BaseTile label={label} icon={icon} pill={`${Math.round(dirVal)}°`}>
      <div className="wind-tile">
        <svg className="wind-tile__svg" viewBox="0 0 100 100" aria-hidden>
          <circle cx="50" cy="50" r="40" className="wind-tile__ring" />
          {['N', 'E', 'S', 'W'].map((d, i) => {
            const a = (i * 90 - 90) * (Math.PI / 180);
            const x = 50 + Math.cos(a) * 44;
            const y = 50 + Math.sin(a) * 44;
            return (
              <text key={d} x={x} y={y + 3} textAnchor="middle" className="wind-tile__cardinal">{d}</text>
            );
          })}
          <g transform={`rotate(${dirVal} 50 50)`}>
            <path d="M 50,18 L 56,52 L 50,46 L 44,52 Z" className="wind-tile__arrow" />
          </g>
          <text x="50" y="58" textAnchor="middle" className="wind-tile__speed">{Number.isFinite(speedVal) ? speedVal.toFixed(1) : 'n/a'}</text>
          <text x="50" y="70" textAnchor="middle" className="wind-tile__speed-unit">{speedUnit.toUpperCase()}</text>
        </svg>
        <div className="wind-tile__point">{point}</div>
      </div>
    </BaseTile>
  );
};
