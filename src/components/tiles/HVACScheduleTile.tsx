import type { FC, ReactNode } from 'react';
import { BaseTile } from './BaseTile';
import { useEntity } from '../../hass';

interface HVACScheduleTileProps {
  entityId: string;
  label?: string;
  icon?: ReactNode;
}

// Visualizes 24 hourly setpoints as a stepped horizontal timeline.
export const HVACScheduleTile: FC<HVACScheduleTileProps> = ({ entityId, label, icon }) => {
  const entity = useEntity(entityId);
  const friendly = label ?? (entity?.attributes.friendly_name as string | undefined) ?? entityId;
  if (!entity) return <BaseTile label={friendly} status="stale" icon={icon} pill="unavail"><div>n/a</div></BaseTile>;

  const schedule = (entity.attributes.schedule as number[] | undefined) ?? [];
  const currentHour = entity.attributes.current_hour as number | undefined ?? new Date().getHours();
  if (!schedule.length) return <BaseTile label={friendly} icon={icon} pill="empty"><div>no schedule</div></BaseTile>;

  const min = Math.min(...schedule);
  const max = Math.max(...schedule);
  const range = max - min || 1;
  const W = 240;
  const H = 70;
  const stepW = W / schedule.length;

  // Stair-step path
  let d = `M 0,${H} `;
  schedule.forEach((v, i) => {
    const y = H - ((v - min) / range) * (H - 8) - 2;
    const x1 = i * stepW;
    const x2 = (i + 1) * stepW;
    d += `L ${x1},${y} L ${x2},${y} `;
  });
  d += `L ${W},${H} Z`;

  return (
    <BaseTile label={friendly} icon={icon} pill={`NOW ${schedule[currentHour]}°`}>
      <div className="hvac-schedule">
        <svg className="hvac-schedule__svg" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" aria-hidden>
          <path className="hvac-schedule__area" d={d} />
          {/* current hour marker */}
          <line
            x1={(currentHour + 0.5) * stepW}
            y1={0}
            x2={(currentHour + 0.5) * stepW}
            y2={H}
            className="hvac-schedule__cursor"
          />
        </svg>
        <div className="hvac-schedule__hours">
          <span>00</span><span>06</span><span>12</span><span>18</span><span>24</span>
        </div>
        <div className="hvac-schedule__legend">
          <span>{min}°</span><span>HOUR</span><span>{max}°</span>
        </div>
      </div>
    </BaseTile>
  );
};
