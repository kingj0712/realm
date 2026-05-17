import type { FC, MouseEvent, ReactNode } from 'react';
import { BaseTile, type TileStatus } from './BaseTile';
import { useEntity, useHass } from '../../hass';

interface AirPurifierTileProps {
  label?: string;
  icon?: ReactNode;
  fanEntityId: string;
  pm1EntityId?: string;
  pm25EntityId: string;
  pm10EntityId?: string;
  filterLifeEntityId?: string;
}

function pmStatus(v: number | null, warn: number, alarm: number): TileStatus {
  if (v == null) return 'idle';
  if (v >= alarm) return 'alarm';
  if (v >= warn) return 'warn';
  return 'ok';
}

const PMReading: FC<{ label: string; entity: ReturnType<typeof useEntity>; warn: number; alarm: number }> = ({ label, entity, warn, alarm }) => {
  const v = entity ? parseFloat(entity.state) : NaN;
  const safe = Number.isFinite(v) ? v : null;
  const status = pmStatus(safe, warn, alarm);
  return (
    <div className="air-tile__pm">
      <span className="air-tile__pm-label">{label}</span>
      <span className={`air-tile__pm-value air-tile__pm-value--${status}`}>{safe != null ? Math.round(safe) : '--'}</span>
    </div>
  );
};

export const AirPurifierTile: FC<AirPurifierTileProps> = ({
  label = 'AIR PURIFIER', icon,
  fanEntityId, pm1EntityId, pm25EntityId, pm10EntityId, filterLifeEntityId,
}) => {
  const fan = useEntity(fanEntityId);
  const pm1 = useEntity(pm1EntityId ?? '');
  const pm25 = useEntity(pm25EntityId);
  const pm10 = useEntity(pm10EntityId ?? '');
  const filter = useEntity(filterLifeEntityId ?? '');
  const store = useHass();

  const isOn = fan?.state === 'on';
  const fanPct = (fan?.attributes.percentage as number | undefined) ?? 0;
  const fanPreset = (fan?.attributes.preset_mode as string | undefined) ?? null;
  const presetModes = (fan?.attributes.preset_modes as string[] | undefined) ?? ['auto', 'sleep', 'turbo'];
  const filterPct = filter ? parseFloat(filter.state) : NaN;
  const filterStatus: TileStatus = Number.isFinite(filterPct)
    ? (filterPct < 10 ? 'alarm' : filterPct < 25 ? 'warn' : 'ok')
    : 'idle';
  const status: TileStatus = isOn ? 'info' : 'idle';

  const callFan = (service: string, data?: Record<string, unknown>) => (e: MouseEvent) => {
    e.stopPropagation();
    store.callService('fan', service, data, { entity_id: fanEntityId });
  };

  return (
    <BaseTile label={label} status={status} icon={icon} pill={isOn ? `${fanPct}%` : 'OFF'}>
      <div className="air-tile">
        <div className="air-tile__pms">
          {pm1EntityId && <PMReading label="PM1" entity={pm1} warn={10} alarm={25} />}
          <PMReading label="PM2.5" entity={pm25} warn={12} alarm={35} />
          {pm10EntityId && <PMReading label="PM10" entity={pm10} warn={50} alarm={150} />}
        </div>
        {filterLifeEntityId && Number.isFinite(filterPct) && (
          <div className="air-tile__filter">
            <span className="air-tile__filter-label">FILTER</span>
            <div className="air-tile__filter-bar">
              <div className={`air-tile__filter-fill air-tile__filter-fill--${filterStatus}`} style={{ width: `${filterPct}%` }} />
            </div>
            <span className={`air-tile__filter-pct air-tile__filter-pct--${filterStatus}`}>{Math.round(filterPct)}%</span>
          </div>
        )}
        <div className="air-tile__presets">
          <button
            type="button"
            className={`air-tile__preset${!isOn ? ' air-tile__preset--active' : ''}`}
            onClick={callFan(isOn ? 'turn_off' : 'turn_on')}
          >
            {isOn ? 'OFF' : 'ON'}
          </button>
          {presetModes.map((p) => (
            <button
              key={p}
              type="button"
              className={`air-tile__preset${fanPreset === p ? ' air-tile__preset--active' : ''}`}
              onClick={callFan('set_preset_mode', { preset_mode: p })}
            >
              {p.toUpperCase()}
            </button>
          ))}
        </div>
        {isOn && <span className="air-tile__flow" aria-hidden />}
      </div>
    </BaseTile>
  );
};
