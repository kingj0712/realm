import type { FC, ReactNode } from 'react';
import { useEffect, useState } from 'react';
import { BaseTile, type TileStatus } from './BaseTile';
import { useEntity } from '../../hass';

interface CountdownTileProps {
  // Provide either an entity (reads target_iso/repeat attributes) or direct props.
  entityId?: string;
  label?: string;
  icon?: ReactNode;
  targetIso?: string;
  repeat?: 'none' | 'daily' | 'weekly' | 'monthly' | 'yearly';
}

function fmtDate(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' }).toUpperCase();
  } catch { return iso; }
}

function nextOccurrence(targetIso: string, repeat: string): Date {
  let target = new Date(targetIso);
  const now = new Date();
  while (repeat !== 'none' && target.getTime() < now.getTime()) {
    if (repeat === 'daily') target.setDate(target.getDate() + 1);
    else if (repeat === 'weekly') target.setDate(target.getDate() + 7);
    else if (repeat === 'monthly') target.setMonth(target.getMonth() + 1);
    else if (repeat === 'yearly') target.setFullYear(target.getFullYear() + 1);
    else break;
  }
  return target;
}

export const CountdownTile: FC<CountdownTileProps> = ({ entityId, label, icon, targetIso, repeat = 'none' }) => {
  const entity = useEntity(entityId ?? '');
  const friendly = label ?? (entity?.attributes.friendly_name as string | undefined) ?? 'COUNTDOWN';
  const target = targetIso ?? (entity?.attributes.target_iso as string | undefined);
  const repeatMode = (entity?.attributes.repeat as string | undefined) ?? repeat;

  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  if (!target) {
    return <BaseTile label={friendly} status="stale" icon={icon} pill="unset"><div>no target</div></BaseTile>;
  }

  const nextDate = nextOccurrence(target, repeatMode);
  const diffMs = Math.max(0, nextDate.getTime() - now);
  const days = Math.floor(diffMs / 86_400_000);
  const hours = Math.floor((diffMs % 86_400_000) / 3_600_000);
  const minutes = Math.floor((diffMs % 3_600_000) / 60_000);
  const seconds = Math.floor((diffMs % 60_000) / 1000);
  const expired = diffMs === 0;
  const status: TileStatus = expired ? 'alarm' : days < 1 ? 'warn' : days < 7 ? 'info' : 'idle';

  return (
    <BaseTile label={friendly} status={status} icon={icon} pill={expired ? 'EXPIRED' : `${days}D`}>
      <div className="countdown-tile">
        <div className="countdown-tile__digits">
          <div className="countdown-tile__cell"><span className="countdown-tile__n">{days.toString().padStart(2, '0')}</span><span className="countdown-tile__u">D</span></div>
          <div className="countdown-tile__cell"><span className="countdown-tile__n">{hours.toString().padStart(2, '0')}</span><span className="countdown-tile__u">H</span></div>
          <div className="countdown-tile__cell"><span className="countdown-tile__n">{minutes.toString().padStart(2, '0')}</span><span className="countdown-tile__u">M</span></div>
          <div className="countdown-tile__cell"><span className="countdown-tile__n">{seconds.toString().padStart(2, '0')}</span><span className="countdown-tile__u">S</span></div>
        </div>
        <div className="countdown-tile__target">→ {fmtDate(nextDate.toISOString())}</div>
        {repeatMode !== 'none' && <div className="countdown-tile__repeat">REPEAT: {repeatMode.toUpperCase()}</div>}
      </div>
    </BaseTile>
  );
};
