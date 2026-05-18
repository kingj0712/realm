import { useState, type FC, type MouseEvent, type ReactNode } from 'react';
import { BaseTile, type TileStatus } from './BaseTile';
import { TileModal } from './TileModal';
import { PlotTile } from './PlotTile';
import { useEntity, useHass } from '../../hass';

interface ClimateThermostatTileProps {
  entityId: string;
  label?: string;
  icon?: ReactNode;
  showModeButtons?: boolean;
  showFanButtons?: boolean;
  showPresetButtons?: boolean;
  showHumidity?: boolean;
  showAction?: boolean;
  // Optional companion entity used in the detail modal for a temperature
  // trend chart. Climate entities themselves don't usually have numeric
  // long-term history, but a paired sensor (e.g. `sensor.living_room_temp`)
  // does. Falls back to plotting the climate target if omitted.
  temperatureHistoryEntityId?: string;
}

export const ClimateThermostatTile: FC<ClimateThermostatTileProps> = ({
  entityId, label, icon,
  showModeButtons = true,
  showFanButtons = true,
  showPresetButtons = true,
  showHumidity = true,
  showAction = true,
  temperatureHistoryEntityId,
}) => {
  const entity = useEntity(entityId);
  const store = useHass();
  const [modalOpen, setModalOpen] = useState(false);
  const friendly = label ?? (entity?.attributes.friendly_name as string | undefined) ?? entityId;

  if (!entity) {
    return <BaseTile label={friendly} status="stale" icon={icon} pill="unavail"><div>n/a</div></BaseTile>;
  }

  const mode = entity.state;
  const action = (entity.attributes.hvac_action as string | undefined) ?? 'idle';
  const current = entity.attributes.current_temperature as number | undefined;
  const target = entity.attributes.temperature as number | undefined;
  const humidity = entity.attributes.current_humidity as number | undefined;
  const unit = (entity.attributes.unit_of_measurement as string | undefined) ?? '°F';
  const hvacModes = (entity.attributes.hvac_modes as string[] | undefined) ?? ['off', 'heat', 'cool', 'auto'];
  const fanModes = (entity.attributes.fan_modes as string[] | undefined) ?? ['auto', 'on'];
  const presetModes = (entity.attributes.preset_modes as string[] | undefined) ?? [];
  const fanMode = (entity.attributes.fan_mode as string | undefined) ?? '';
  const presetMode = (entity.attributes.preset_mode as string | undefined) ?? '';
  const minTemp = (entity.attributes.min_temp as number | undefined) ?? 50;
  const maxTemp = (entity.attributes.max_temp as number | undefined) ?? 90;
  const step = (entity.attributes.target_temp_step as number | undefined) ?? 1;

  const status: TileStatus =
    action === 'heating' ? 'warn' :
    action === 'cooling' ? 'info' :
    action === 'fan' ? 'info' :
    mode === 'off' ? 'idle' : 'ok';

  const call = (service: string, data?: Record<string, unknown>) => (e: MouseEvent) => {
    e.stopPropagation();
    store.callService('climate', service, data, { entity_id: entityId });
  };

  const adjustTarget = (delta: number) => (e: MouseEvent) => {
    e.stopPropagation();
    if (target == null) return;
    const next = Math.max(minTemp, Math.min(maxTemp, target + delta));
    store.callService('climate', 'set_temperature', { temperature: next }, { entity_id: entityId });
  };

  return (
    <>
    <BaseTile label={friendly} status={status} icon={icon} pill={showAction ? action.toUpperCase() : undefined} onClick={() => setModalOpen(true)}>
      <div className="thermo-tile">
        <div className="thermo-tile__ring">
          <div className="thermo-tile__current">
            <span className="thermo-tile__current-num">{current?.toFixed(1) ?? 'n/a'}</span>
            <span className="thermo-tile__current-unit">{unit}</span>
          </div>
          <div className="thermo-tile__target-row">
            <button type="button" className="thermo-tile__adj" onClick={adjustTarget(-step)}>−</button>
            <span className={`thermo-tile__target thermo-tile__target--${status}`}>{target ?? 'n/a'}{unit}</span>
            <button type="button" className="thermo-tile__adj" onClick={adjustTarget(step)}>+</button>
          </div>
          {showHumidity && humidity != null && <div className="thermo-tile__humidity">HUMID {humidity}%</div>}
        </div>
        <div className="thermo-tile__modes">
          {showModeButtons && (
            <div className="thermo-tile__group">
              <span className="thermo-tile__group-label">MODE</span>
              <div className="thermo-tile__btns">
                {hvacModes.map((m) => (
                  <button
                    key={m}
                    type="button"
                    className={`thermo-tile__btn${mode === m ? ` thermo-tile__btn--active thermo-tile__btn--active-${m}` : ''}`}
                    onClick={call('set_hvac_mode', { hvac_mode: m })}
                  >
                    {m.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>
          )}
          {showFanButtons && fanModes.length > 0 && (
            <div className="thermo-tile__group">
              <span className="thermo-tile__group-label">FAN</span>
              <div className="thermo-tile__btns">
                {fanModes.map((m) => (
                  <button
                    key={m}
                    type="button"
                    className={`thermo-tile__btn${fanMode === m ? ' thermo-tile__btn--active' : ''}`}
                    onClick={call('set_fan_mode', { fan_mode: m })}
                  >
                    {m.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>
          )}
          {showPresetButtons && presetModes.length > 0 && (
            <div className="thermo-tile__group">
              <span className="thermo-tile__group-label">PRESET</span>
              <div className="thermo-tile__btns">
                {presetModes.map((p) => (
                  <button
                    key={p}
                    type="button"
                    className={`thermo-tile__btn${presetMode === p ? ' thermo-tile__btn--active' : ''}`}
                    onClick={call('set_preset_mode', { preset_mode: p })}
                  >
                    {p.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </BaseTile>
    {modalOpen && (
      <ClimateThermostatModal
        entityId={entityId}
        title={friendly}
        pill={showAction ? action.toUpperCase() : undefined}
        temperatureHistoryEntityId={temperatureHistoryEntityId}
        onClose={() => setModalOpen(false)}
      />
    )}
    </>
  );
};

interface ClimateThermostatModalProps {
  entityId: string;
  title: string;
  pill?: string;
  temperatureHistoryEntityId?: string;
  onClose: () => void;
}

// Detail modal: bigger numbers, full mode/fan/preset rows, a trend chart of
// either the paired temperature sensor or the climate target. No raw
// attribute dump — the focused view is more useful for tablets.
const ClimateThermostatModal: FC<ClimateThermostatModalProps> = ({
  entityId, title, pill, temperatureHistoryEntityId, onClose,
}) => {
  const entity = useEntity(entityId);
  const store = useHass();
  if (!entity) {
    return (
      <TileModal title={title} subtitle={entityId} onClose={onClose} size="md">
        <div className="thermo-modal__empty">Entity unavailable.</div>
      </TileModal>
    );
  }

  const mode = entity.state;
  const action = (entity.attributes.hvac_action as string | undefined) ?? 'idle';
  const current = entity.attributes.current_temperature as number | undefined;
  const target = entity.attributes.temperature as number | undefined;
  const humidity = entity.attributes.current_humidity as number | undefined;
  const targetHumidity = entity.attributes.humidity as number | undefined;
  const unit = (entity.attributes.unit_of_measurement as string | undefined) ?? '°F';
  const hvacModes = (entity.attributes.hvac_modes as string[] | undefined) ?? ['off', 'heat', 'cool', 'auto'];
  const fanModes = (entity.attributes.fan_modes as string[] | undefined) ?? [];
  const presetModes = (entity.attributes.preset_modes as string[] | undefined) ?? [];
  const fanMode = (entity.attributes.fan_mode as string | undefined) ?? '';
  const presetMode = (entity.attributes.preset_mode as string | undefined) ?? '';
  const minTemp = (entity.attributes.min_temp as number | undefined) ?? 50;
  const maxTemp = (entity.attributes.max_temp as number | undefined) ?? 90;
  const step = (entity.attributes.target_temp_step as number | undefined) ?? 1;
  const chartEntity = temperatureHistoryEntityId || entityId;

  const call = (service: string, data?: Record<string, unknown>) => (e: MouseEvent) => {
    e.stopPropagation();
    store.callService('climate', service, data, { entity_id: entityId });
  };
  const adjustTarget = (delta: number) => (e: MouseEvent) => {
    e.stopPropagation();
    if (target == null) return;
    const next = Math.max(minTemp, Math.min(maxTemp, target + delta));
    store.callService('climate', 'set_temperature', { temperature: next }, { entity_id: entityId });
  };

  return (
    <TileModal title={title} subtitle={entityId} pill={pill} onClose={onClose} size="lg">
      <div className="thermo-modal">
        <div className="thermo-modal__hero">
          <div className="thermo-modal__hero-cell">
            <div className="thermo-modal__hero-label">CURRENT</div>
            <div className="thermo-modal__hero-value">{current?.toFixed(1) ?? '—'}<span className="thermo-modal__hero-unit">{unit}</span></div>
          </div>
          <div className="thermo-modal__hero-cell">
            <div className="thermo-modal__hero-label">TARGET</div>
            <div className="thermo-modal__hero-value">
              <button type="button" className="thermo-modal__adj" onClick={adjustTarget(-step)} aria-label="lower">−</button>
              <span>{target ?? '—'}<span className="thermo-modal__hero-unit">{unit}</span></span>
              <button type="button" className="thermo-modal__adj" onClick={adjustTarget(step)} aria-label="raise">+</button>
            </div>
          </div>
          {humidity != null && (
            <div className="thermo-modal__hero-cell">
              <div className="thermo-modal__hero-label">HUMIDITY</div>
              <div className="thermo-modal__hero-value">{humidity}%{targetHumidity != null && <span className="thermo-modal__hero-unit"> / {targetHumidity}%</span>}</div>
            </div>
          )}
          <div className="thermo-modal__hero-cell">
            <div className="thermo-modal__hero-label">ACTION</div>
            <div className={`thermo-modal__hero-action thermo-modal__hero-action--${action}`}>{action.toUpperCase()}</div>
          </div>
        </div>

        {hvacModes.length > 0 && (
          <div className="thermo-modal__group">
            <span className="thermo-modal__group-label">MODE</span>
            <div className="thermo-modal__btns">
              {hvacModes.map((m) => (
                <button
                  key={m}
                  type="button"
                  className={`thermo-modal__btn${mode === m ? ` thermo-modal__btn--active thermo-modal__btn--active-${m}` : ''}`}
                  onClick={call('set_hvac_mode', { hvac_mode: m })}
                >{m.toUpperCase()}</button>
              ))}
            </div>
          </div>
        )}
        {fanModes.length > 0 && (
          <div className="thermo-modal__group">
            <span className="thermo-modal__group-label">FAN</span>
            <div className="thermo-modal__btns">
              {fanModes.map((m) => (
                <button
                  key={m}
                  type="button"
                  className={`thermo-modal__btn${fanMode === m ? ' thermo-modal__btn--active' : ''}`}
                  onClick={call('set_fan_mode', { fan_mode: m })}
                >{m.toUpperCase()}</button>
              ))}
            </div>
          </div>
        )}
        {presetModes.length > 0 && (
          <div className="thermo-modal__group">
            <span className="thermo-modal__group-label">PRESET</span>
            <div className="thermo-modal__btns">
              {presetModes.map((p) => (
                <button
                  key={p}
                  type="button"
                  className={`thermo-modal__btn${presetMode === p ? ' thermo-modal__btn--active' : ''}`}
                  onClick={call('set_preset_mode', { preset_mode: p })}
                >{p.toUpperCase()}</button>
              ))}
            </div>
          </div>
        )}

        <div className="thermo-modal__chart">
          <div className="thermo-modal__chart-head">RECENT TEMPERATURE — {chartEntity}</div>
          <div className="thermo-modal__chart-body">
            <PlotTile entityId={chartEntity} points={60} timeRange="60m" />
          </div>
        </div>
      </div>
    </TileModal>
  );
};
