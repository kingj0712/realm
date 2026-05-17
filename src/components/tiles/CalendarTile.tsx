import type { FC, ReactNode } from 'react';
import { BaseTile } from './BaseTile';
import { useEntity } from '../../hass';

interface Event {
  start: string;
  end?: string;
  summary: string;
}

interface CalendarTileProps {
  entityId: string;
  label?: string;
  icon?: ReactNode;
  max?: number;
}

function fmtDate(iso: string): { day: string; time: string } {
  try {
    const d = new Date(iso);
    return {
      day: d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }).toUpperCase(),
      time: d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
    };
  } catch {
    return { day: '---', time: '--:--' };
  }
}

export const CalendarTile: FC<CalendarTileProps> = ({ entityId, label, icon, max = 4 }) => {
  const entity = useEntity(entityId);
  const friendly = label ?? (entity?.attributes.friendly_name as string | undefined) ?? entityId;
  if (!entity) return <BaseTile label={friendly} status="stale" icon={icon} pill="unavail"><div>n/a</div></BaseTile>;

  const events = ((entity.attributes.all_events as Event[] | undefined) ?? []).slice(0, max);

  return (
    <BaseTile label={friendly} icon={icon} pill={`${events.length} UP`}>
      <div className="calendar-tile">
        {events.length === 0 && <div className="calendar-tile__empty">No upcoming events</div>}
        {events.map((e, i) => {
          const { day, time } = fmtDate(e.start);
          return (
            <div key={i} className="calendar-tile__row">
              <div className="calendar-tile__when">
                <span className="calendar-tile__day">{day}</span>
                <span className="calendar-tile__time">{time}</span>
              </div>
              <div className="calendar-tile__summary">{e.summary}</div>
            </div>
          );
        })}
      </div>
    </BaseTile>
  );
};
