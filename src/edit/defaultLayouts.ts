import type { LayoutItem } from './types';
import { TILE_BY_TYPE } from './tileRegistry';
import { uid } from '../hass/uid';

interface TileSpec {
  type: string;
  w?: number;
  h?: number;
  props?: Record<string, unknown>;
}

// Pack a list of tiles into the 12-col grid in reading order, wrapping rows.
// Each row's Y is anchored to the tallest tile in that row to avoid overlap.
function pack(specs: TileSpec[], cols = 12): LayoutItem[] {
  const items: LayoutItem[] = [];
  let x = 0, y = 0, rowMaxH = 0;
  for (const spec of specs) {
    const meta = TILE_BY_TYPE[spec.type];
    if (!meta) continue;
    const w = Math.min(cols, spec.w ?? meta.defaultColSpan);
    const h = spec.h ?? meta.defaultRowSpan ?? 7;
    if (x + w > cols) {
      x = 0;
      y += rowMaxH;
      rowMaxH = 0;
    }
    items.push({
      id: uid(),
      type: spec.type,
      x, y, w, h,
      props: { ...meta.defaultProps, ...(spec.props ?? {}) },
    });
    x += w;
    rowMaxH = Math.max(rowMaxH, h);
  }
  return items;
}

// Curated default layout — drop-in starting point that the user customizes
// freely via the iOS-style drag/resize interface in edit mode.
export function defaultOverviewLayout(): LayoutItem[] {
  return pack([
    { type: 'ClockTile' },
    { type: 'WeatherTile' },
    { type: 'PresenceListTile', props: { label: 'PRESENCE', icon: 'mdiAccountGroup', personIds: ['person.jake', 'person.sam', 'person.guest'] } },

    { type: 'SunMoonTile' },
    { type: 'WindCompassTile' },
    { type: 'NotificationFeedTile' },
    { type: 'TrashScheduleTile' },

    { type: 'AreaListTile', w: 8, props: {
      label: 'BEDROOMS', icon: 'mdiBed',
      rows: [
        { label: 'MASTER', cells: [
          { type: 'value', entityId: 'sensor.master_bedroom_temp', precision: 0 },
          { type: 'value', entityId: 'sensor.master_bedroom_humidity', precision: 0 },
          { type: 'binary', entityId: 'binary_sensor.master_bedroom_occupancy', icon: 'mdiMotionSensor', activeStatus: 'info' },
          { type: 'toggle', entityId: 'light.master_bedroom', icon: 'mdiLightbulbOn' },
        ] },
        { label: 'KIDS', cells: [
          { type: 'value', entityId: 'sensor.kids_bedroom_temp', precision: 0 },
          { type: 'value', entityId: 'sensor.kids_bedroom_humidity', precision: 0 },
          { type: 'binary', entityId: 'binary_sensor.kids_bedroom_occupancy', icon: 'mdiMotionSensor', activeStatus: 'info' },
          { type: 'toggle', entityId: 'light.kids_bedroom', icon: 'mdiLightbulbOn' },
        ] },
        { label: 'GUEST', cells: [
          { type: 'value', entityId: 'sensor.guest_bedroom_temp', precision: 0 },
          { type: 'value', entityId: 'sensor.guest_bedroom_humidity', precision: 0 },
          { type: 'binary', entityId: 'binary_sensor.guest_bedroom_occupancy', icon: 'mdiMotionSensor', activeStatus: 'info' },
          { type: 'toggle', entityId: 'light.guest_bedroom', icon: 'mdiLightbulbOn' },
        ] },
      ],
    } },
    { type: 'ClimateThermostatTile', w: 4 },

    { type: 'MultiMetricTile', w: 6 },
    { type: 'HVACScheduleTile', w: 6 },

    { type: 'StatusListTile', w: 3, props: {
      label: 'ENTRY POINTS', icon: 'mdiDoor',
      entries: [
        { entityId: 'binary_sensor.front_door', label: 'FRONT', stateLabels: { on: 'OPEN', off: 'CLOSED' }, activeStatus: 'warn' },
        { entityId: 'binary_sensor.back_door', label: 'BACK', stateLabels: { on: 'OPEN', off: 'CLOSED' }, activeStatus: 'warn' },
        { entityId: 'binary_sensor.patio_door', label: 'PATIO', stateLabels: { on: 'OPEN', off: 'CLOSED' }, activeStatus: 'warn' },
        { entityId: 'binary_sensor.garage_door', label: 'GARAGE', stateLabels: { on: 'OPEN', off: 'CLOSED' }, activeStatus: 'warn' },
      ],
    } },
    { type: 'AlarmTile', w: 3, props: { entityId: 'binary_sensor.water_leak_basement', icon: 'mdiWaterAlert' } },
    { type: 'AlarmTile', w: 3, props: { entityId: 'binary_sensor.sump_high_water', icon: 'mdiWaterAlert' } },
    { type: 'ButtonTile', w: 3, props: {
      entityId: 'cover.garage_door', icon: 'mdiGarage', buttonText: 'OPERATE',
      states: { open: { pill: 'OPEN', status: 'warn', buttonText: 'CLOSE' }, closed: { pill: 'CLOSED', status: 'ok', buttonText: 'OPEN' } },
    } },

    { type: 'CameraTile', w: 4, props: { entityId: 'camera.front_porch', icon: 'mdiCamera' } },
    { type: 'CameraTile', w: 4, props: { entityId: 'camera.backyard', icon: 'mdiCamera' } },
    { type: 'WeatherRadarTile', w: 4 },

    { type: 'EnergyFlowTile', w: 6 },
    { type: 'SankeyTile', w: 6 },
    { type: 'TankTile', w: 3 },
    { type: 'TankTile', w: 3, props: { entityId: 'sensor.propane_level', icon: 'mdiBarrel', capacity: '500 GAL' } },
    { type: 'DonutTile', w: 3 },
    { type: 'GaugeTile', w: 3 },
    { type: 'PlotTile', w: 6 },
    { type: 'HistoryBarsTile', w: 6 },

    { type: 'IrrigationTile', w: 3, props: {
      label: 'IRRIGATION', icon: 'mdiSprinkler',
      zones: [
        { entityId: 'switch.irrigation_zone_1', label: 'LAWN' },
        { entityId: 'switch.irrigation_zone_2', label: 'GARDEN' },
        { entityId: 'switch.irrigation_zone_3', label: 'BEDS' },
        { entityId: 'switch.irrigation_zone_4', label: 'ORCHARD' },
      ],
    } },
    { type: 'GeneratorTile', w: 3 },
    { type: 'BeehiveTile', w: 3 },
    { type: 'MailboxTile', w: 3 },
    { type: 'VehicleTile', w: 4 },
    { type: 'LaundryTile', w: 4 },
    { type: 'VacuumTile', w: 4 },

    { type: 'ApplianceTile', w: 3, props: { entityId: 'sensor.dishwasher',   icon: 'mdiWrench' } },
    { type: 'ApplianceTile', w: 3, props: { entityId: 'sensor.oven',         icon: 'mdiFire' } },
    { type: 'ApplianceTile', w: 3, props: { entityId: 'sensor.refrigerator', icon: 'mdiHome' } },
    { type: 'ApplianceTile', w: 3, props: { entityId: 'sensor.microwave',    icon: 'mdiWrench' } },

    { type: 'NetworkTile', w: 3 },
    { type: 'SpeedTestTile', w: 3 },
    { type: 'StarlinkTile', w: 3 },
    { type: 'UDMTile', w: 3 },
    { type: 'NASTile', w: 4 },
    { type: 'HomelabTile', w: 4 },
    { type: 'ServerStatsTile', w: 4 },

    { type: 'CalendarTile', w: 4 },
    { type: 'TodoListTile', w: 4 },
    { type: 'CountdownTile', w: 4 },
    { type: 'SceneButtonTile', w: 3, props: { entityId: 'scene.good_morning', icon: 'mdiWeatherSunny' } },
    { type: 'SceneButtonTile', w: 3, props: { entityId: 'scene.movie_night', icon: 'mdiAutoFix' } },
    { type: 'SceneButtonTile', w: 3, props: { entityId: 'scene.bedtime',     icon: 'mdiBed' } },
    { type: 'SceneButtonTile', w: 3, props: { entityId: 'scene.away_mode',   icon: 'mdiLockOutline' } },

    { type: 'AirPurifierTile', w: 4 },
    { type: 'LightFanTile', w: 4 },
    { type: 'BlindsTile', w: 4 },
    { type: 'WeeklyDigestTile', w: 6 },
    { type: 'ColorPickerTile', w: 3 },
    { type: 'SliderTile', w: 3 },
    { type: 'MediaPlayerTile', w: 6 },
    { type: 'TimerTile', w: 3 },
    { type: 'HeatmapTile', w: 4 },
  ]);
}
