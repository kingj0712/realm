import type { FC, ReactNode } from 'react';
import {
  mdiWeatherCloudy,
  mdiWeatherFog,
  mdiWeatherLightning,
  mdiWeatherPartlyCloudy,
  mdiWeatherPouring,
  mdiWeatherSnowy,
  mdiWeatherSunny,
  mdiWeatherWindy,
} from '@mdi/js';
import { BaseTile } from './BaseTile';
import { useEntity } from '../../hass';
import { Icon } from '../Icon';

interface ForecastEntry {
  datetime: string;
  condition: string;
  temperature: number;
  templow: number;
}

interface WeatherTileProps {
  entityId: string;
  label?: string;
  icon?: ReactNode;
}

const CONDITION_ICON: Record<string, string> = {
  sunny: mdiWeatherSunny,
  clear: mdiWeatherSunny,
  'clear-night': mdiWeatherSunny,
  partlycloudy: mdiWeatherPartlyCloudy,
  cloudy: mdiWeatherCloudy,
  rainy: mdiWeatherPouring,
  pouring: mdiWeatherPouring,
  snowy: mdiWeatherSnowy,
  'snowy-rainy': mdiWeatherSnowy,
  windy: mdiWeatherWindy,
  'windy-variant': mdiWeatherWindy,
  fog: mdiWeatherFog,
  lightning: mdiWeatherLightning,
  'lightning-rainy': mdiWeatherLightning,
};

function dayLabel(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase();
  } catch {
    return '---';
  }
}

function conditionLabel(condition: string): string {
  return condition.replace(/-/g, ' ').toUpperCase();
}

export const WeatherTile: FC<WeatherTileProps> = ({ entityId, label, icon }) => {
  const entity = useEntity(entityId);
  const friendly = label ?? (entity?.attributes.friendly_name as string | undefined) ?? entityId;

  if (!entity) {
    return (
      <BaseTile label={friendly} status="stale" icon={icon} pill="unavail">
        <div className="weather-tile">n/a</div>
      </BaseTile>
    );
  }

  const condition = entity.state;
  const temp = entity.attributes.temperature as number | undefined;
  const tempUnit = (entity.attributes.temperature_unit as string | undefined) ?? '°F';
  const humidity = entity.attributes.humidity as number | undefined;
  const wind = entity.attributes.wind_speed as number | undefined;
  const pressure = entity.attributes.pressure as number | undefined;
  const forecast = (entity.attributes.forecast as ForecastEntry[] | undefined) ?? [];

  const condIcon = CONDITION_ICON[condition] ?? mdiWeatherCloudy;

  return (
    <BaseTile label={friendly} icon={icon} pill={conditionLabel(condition)}>
      <div className="weather-tile">
        <div className="weather-tile__hero">
          <span className="weather-tile__hero-icon">
            <Icon path={condIcon} size={56} />
          </span>
          <div className="weather-tile__hero-temp">
            <span className="weather-tile__hero-num">{temp != null ? Math.round(temp) : 'n/a'}</span>
            <span className="weather-tile__hero-unit">{tempUnit}</span>
          </div>
        </div>
        <div className="weather-tile__stats">
          {humidity != null && (
            <span className="weather-tile__stat">
              <span className="weather-tile__stat-label">HUM</span>
              <span className="weather-tile__stat-value">{humidity}%</span>
            </span>
          )}
          {wind != null && (
            <span className="weather-tile__stat">
              <span className="weather-tile__stat-label">WIND</span>
              <span className="weather-tile__stat-value">{wind} mph</span>
            </span>
          )}
          {pressure != null && (
            <span className="weather-tile__stat">
              <span className="weather-tile__stat-label">PSI</span>
              <span className="weather-tile__stat-value">{pressure.toFixed(1)}</span>
            </span>
          )}
        </div>
        {forecast.length > 0 && (
          <div className="weather-tile__forecast">
            {forecast.slice(0, 3).map((f) => {
              const fIcon = CONDITION_ICON[f.condition] ?? mdiWeatherCloudy;
              return (
                <div key={f.datetime} className="weather-tile__forecast-day">
                  <span className="weather-tile__forecast-label">{dayLabel(f.datetime)}</span>
                  <span className="weather-tile__forecast-icon">
                    <Icon path={fIcon} size={22} />
                  </span>
                  <span className="weather-tile__forecast-temps">
                    <span className="weather-tile__forecast-hi">{Math.round(f.temperature)}°</span>
                    <span className="weather-tile__forecast-lo">{Math.round(f.templow)}°</span>
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </BaseTile>
  );
};
