import type { FC, ReactNode, MouseEvent } from 'react';
import { useEffect, useState } from 'react';
import { BaseTile, type TileStatus } from './BaseTile';
import { useEntity, useHass } from '../../hass';

interface TimerTileProps {
  entityId: string;
  label?: string;
  icon?: ReactNode;
}

function parseDuration(s: string | undefined): number {
  if (!s) return 0;
  const parts = s.split(':').map((p) => parseInt(p, 10));
  if (parts.some((n) => Number.isNaN(n))) return 0;
  const [h = 0, m = 0, sec = 0] = parts;
  return h * 3600 + m * 60 + sec;
}

function fmtRemaining(seconds: number): string {
  const s = Math.max(0, Math.floor(seconds));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  if (h > 0) return `${h}:${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
  return `${m}:${sec.toString().padStart(2, '0')}`;
}

// Circle geometry for the countdown ring
const RADIUS = 38;
const CIRC = 2 * Math.PI * RADIUS;

export const TimerTile: FC<TimerTileProps> = ({ entityId, label, icon }) => {
  const entity = useEntity(entityId);
  const store = useHass();
  const friendly = label ?? (entity?.attributes.friendly_name as string | undefined) ?? entityId;
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (entity?.state !== 'active') return;
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, [entity?.state]);

  if (!entity) return <BaseTile label={friendly} status="stale" icon={icon} pill="unavail"><div>n/a</div></BaseTile>;

  const state = entity.state;
  const duration = parseDuration(entity.attributes.duration as string | undefined);
  const finishesAt = entity.attributes.finishes_at as string | undefined;
  let remaining = parseDuration(entity.attributes.remaining as string | undefined);
  if (state === 'active' && finishesAt) {
    remaining = Math.max(0, (new Date(finishesAt).getTime() - now) / 1000);
  }

  const pct = duration > 0 ? Math.max(0, Math.min(1, remaining / duration)) : 0;
  const status: TileStatus = state === 'active' ? (remaining < 60 ? 'warn' : 'info') : state === 'paused' ? 'warn' : 'idle';

  const call = (service: string) => (e: MouseEvent) => {
    e.stopPropagation();
    store.callService('timer', service, undefined, { entity_id: entityId });
  };

  return (
    <BaseTile label={friendly} status={status} icon={icon} pill={state.toUpperCase()}>
      <div className="timer-tile">
        <svg className="timer-tile__svg" viewBox="0 0 100 100" aria-hidden>
          <circle cx="50" cy="50" r={RADIUS} className="timer-tile__bg" />
          <circle
            cx="50" cy="50" r={RADIUS}
            className={`timer-tile__fg timer-tile__fg--${status}`}
            transform="rotate(-90 50 50)"
            style={{ strokeDasharray: CIRC, strokeDashoffset: CIRC * (1 - pct) }}
          />
        </svg>
        <div className="timer-tile__center">
          <div className="timer-tile__remaining">{fmtRemaining(remaining)}</div>
          <div className="timer-tile__controls">
            <button type="button" className="timer-tile__btn" onClick={call('start')} aria-label="start">▶</button>
            <button type="button" className="timer-tile__btn" onClick={call('pause')} aria-label="pause">⏸</button>
            <button type="button" className="timer-tile__btn" onClick={call('cancel')} aria-label="cancel">✕</button>
          </div>
        </div>
      </div>
    </BaseTile>
  );
};
