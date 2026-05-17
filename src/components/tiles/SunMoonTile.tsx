import type { FC, ReactNode } from 'react';
import { BaseTile } from './BaseTile';
import { useEntity } from '../../hass';

interface SunMoonTileProps {
  label?: string;
  icon?: ReactNode;
  sunEntityId: string;
  moonEntityId?: string;
}

const MOON_GLYPH: Record<string, string> = {
  new_moon: '🌑', waxing_crescent: '🌒', first_quarter: '🌓',
  waxing_gibbous: '🌔', full_moon: '🌕', waning_gibbous: '🌖',
  last_quarter: '🌗', waning_crescent: '🌘',
};

function fmtTime(iso: string | undefined): string {
  if (!iso) return '--:--';
  try {
    return new Date(iso).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  } catch {
    return '--:--';
  }
}

export const SunMoonTile: FC<SunMoonTileProps> = ({ label = 'SUN & MOON', icon, sunEntityId, moonEntityId }) => {
  const sun = useEntity(sunEntityId);
  const moon = useEntity(moonEntityId ?? '');
  const elev = sun ? (sun.attributes.elevation as number | undefined) ?? 0 : 0;
  const azim = sun ? (sun.attributes.azimuth as number | undefined) ?? 0 : 0;
  const sunrise = fmtTime(sun?.attributes.next_rising as string | undefined);
  const sunset = fmtTime(sun?.attributes.next_setting as string | undefined);
  const above = sun?.state === 'above_horizon';

  // Sun position along an arc: x from 0 (left) to 100 (right), based on azimuth 90-270.
  const norm = Math.max(0, Math.min(1, (azim - 90) / 180));
  const sunX = norm * 100;
  const sunY = 60 - Math.max(0, Math.min(40, elev)) * 0.8;

  const moonState = moon?.state ?? 'full_moon';
  const moonGlyph = MOON_GLYPH[moonState] ?? '🌕';

  return (
    <BaseTile label={label} icon={icon} pill={above ? 'DAY' : 'NIGHT'}>
      <div className="sunmoon-tile">
        <svg className="sunmoon-tile__svg" viewBox="0 0 100 70" aria-hidden>
          {/* Horizon arc */}
          <path d="M 5,60 Q 50,5 95,60" className="sunmoon-tile__arc" />
          <line x1="0" y1="60" x2="100" y2="60" className="sunmoon-tile__horizon" />
          {/* Sun */}
          {above && (
            <circle cx={sunX} cy={sunY} r="4" className="sunmoon-tile__sun" />
          )}
        </svg>
        <div className="sunmoon-tile__times">
          <div className="sunmoon-tile__time">
            <span className="sunmoon-tile__time-label">RISE</span>
            <span className="sunmoon-tile__time-value">{sunrise}</span>
          </div>
          <div className="sunmoon-tile__time">
            <span className="sunmoon-tile__time-label">SET</span>
            <span className="sunmoon-tile__time-value">{sunset}</span>
          </div>
          <div className="sunmoon-tile__time">
            <span className="sunmoon-tile__time-label">MOON</span>
            <span className="sunmoon-tile__moon">{moonGlyph}</span>
          </div>
        </div>
      </div>
    </BaseTile>
  );
};
