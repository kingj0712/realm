import type { FC, ReactNode } from 'react';
import { BaseTile } from './BaseTile';

interface WeatherRadarTileProps {
  label?: string;
  icon?: ReactNode;
  // Embed URL for an iframe (e.g. https://embed.windy.com/embed.html?... or rainviewer).
  iframeUrl?: string;
}

export const WeatherRadarTile: FC<WeatherRadarTileProps> = ({ label = 'WEATHER RADAR', icon, iframeUrl }) => {
  return (
    <BaseTile label={label} icon={icon} pill={iframeUrl ? 'LIVE' : 'PLACEHOLDER'}>
      <div className="radar-tile">
        {iframeUrl ? (
          <iframe
            className="radar-tile__iframe"
            src={iframeUrl}
            title="Weather radar"
            frameBorder={0}
            allow="geolocation"
          />
        ) : (
          <div className="radar-tile__placeholder">
            <svg className="radar-tile__svg" viewBox="0 0 100 100" aria-hidden>
              {/* Radar rings */}
              <circle cx="50" cy="50" r="44" className="radar-tile__ring" />
              <circle cx="50" cy="50" r="32" className="radar-tile__ring" />
              <circle cx="50" cy="50" r="20" className="radar-tile__ring" />
              <circle cx="50" cy="50" r="8"  className="radar-tile__ring" />
              {/* Sweep */}
              <line x1="50" y1="50" x2="50" y2="6" className="radar-tile__sweep" />
              {/* Center pin */}
              <circle cx="50" cy="50" r="2.5" className="radar-tile__pin" />
            </svg>
            <div className="radar-tile__hint">SET iframeUrl IN EDIT MODE</div>
          </div>
        )}
      </div>
    </BaseTile>
  );
};
