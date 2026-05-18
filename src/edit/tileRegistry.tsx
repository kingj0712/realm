import type { ReactNode } from 'react';
import {
  StatusTile, ValueTile, ToggleTile, SetpointTile, AlarmTile, TankTile, BarTile, ButtonTile,
  GaugeTile, DonutTile, SparklineTile, MultiMetricTile, StatusListTile, AreaListTile,
  SliderTile, ClockTile, PlotTile, WeatherTile, CameraTile, EnergyFlowTile, MediaPlayerTile,
  ColorPickerTile, CalendarTile, TodoListTile, PersonTile, PresenceListTile, SceneButtonTile,
  NotificationFeedTile, WindCompassTile, SunMoonTile, HeatmapTile, NetworkTile, ServerStatsTile,
  VacuumTile, BeehiveTile, IrrigationTile, TrashScheduleTile, GeneratorTile, MailboxTile,
  TimerTile, HVACScheduleTile, HistoryBarsTile,
  ClimateThermostatTile, AirPurifierTile, LightFanTile, CurtainTile, NASTile, SpeedTestTile,
  StarlinkTile, UDMTile, VehicleTile, LaundryTile, SankeyTile, CountdownTile, WeatherRadarTile,
  ApplianceTile, HomelabTile, BlindsTile, WeeklyDigestTile, HeaderTile,
  type AreaCell, type AreaRow,
} from '../components/tiles';
import { Icon } from '../components/Icon';
import type { TileMeta } from './types';
import { resolveIcon } from './iconLookup';

// Wrap icon name → React element (the only non-serializable prop on tiles).
function iconEl(name: unknown): ReactNode {
  if (typeof name !== 'string') return undefined;
  const path = resolveIcon(name);
  return path ? <Icon path={path} /> : undefined;
}

// Helper for cells inside AreaListTile rows: resolve icon strings to JSX.
function resolveAreaCells(cells: unknown): AreaCell[] {
  if (!Array.isArray(cells)) return [];
  return cells.map((c) => {
    const cell = { ...(c as Record<string, unknown>) };
    if (typeof cell.icon === 'string') {
      const path = resolveIcon(cell.icon as string);
      cell.icon = path ? <Icon path={path} size={14} /> : undefined;
    }
    return cell as unknown as AreaCell;
  });
}

function resolveAreaRows(rows: unknown): AreaRow[] {
  if (!Array.isArray(rows)) return [];
  return rows.map((r) => {
    const row = r as Record<string, unknown>;
    return { label: row.label as string, cells: resolveAreaCells(row.cells) };
  });
}

type Renderer = (props: Record<string, unknown>) => ReactNode;

export interface TileRegistryEntry extends TileMeta {
  render: Renderer;
}

// All registered tile types. defaultProps fills new instances; schema drives Inspector.
export const TILE_REGISTRY: TileRegistryEntry[] = [
  // ---- single-entity value tiles -----------------------------------------
  {
    type: 'ValueTile', name: 'Value', category: 'Info',
    description: 'Single numeric value with unit and optional thresholds.',
    defaultColSpan: 3, defaultRowSpan: 4,
    defaultProps: { entityId: 'sensor.outdoor_temperature', precision: 1, icon: 'mdiThermometer' },
    schema: {
      entityId: { kind: 'entity', label: 'Entity' },
      label: { kind: 'string', label: 'Label override', optional: true },
      icon: { kind: 'icon', label: 'Icon', optional: true },
      precision: { kind: 'number', label: 'Precision', optional: true },
      thresholds: { kind: 'json', label: 'Thresholds', optional: true, hint: '{ "warn": { "gt": 70 }, "alarm": { "gt": 85 } }' },
    },
    render: (p) => <ValueTile entityId={p.entityId as string} label={p.label as string | undefined} precision={p.precision as number | undefined} thresholds={p.thresholds as never} icon={iconEl(p.icon)} />,
  },
  {
    type: 'StatusTile', name: 'Status', category: 'Info',
    description: 'Binary entity rendered as a labeled state (e.g. OPEN / CLOSED).',
    defaultColSpan: 3, defaultRowSpan: 4,
    defaultProps: { entityId: 'binary_sensor.garage_door', icon: 'mdiDoor' },
    schema: {
      entityId: { kind: 'entity', label: 'Entity', domains: ['binary_sensor'] },
      label: { kind: 'string', label: 'Label override', optional: true },
      icon: { kind: 'icon', label: 'Icon', optional: true },
      states: { kind: 'json', label: 'State map', optional: true, hint: '{ "on": {"text":"OPEN","status":"warn"}, "off": {"text":"CLOSED","status":"ok"} }' },
    },
    render: (p) => <StatusTile entityId={p.entityId as string} label={p.label as string | undefined} icon={iconEl(p.icon)} states={p.states as never} />,
  },
  {
    type: 'AlarmTile', name: 'Alarm', category: 'Info',
    description: 'Active/clear binary alarm with pulsing accent.',
    defaultColSpan: 3, defaultRowSpan: 4,
    defaultProps: { entityId: 'binary_sensor.smoke_basement', icon: 'mdiSmokeDetectorVariant' },
    schema: {
      entityId: { kind: 'entity', label: 'Entity', domains: ['binary_sensor'] },
      label: { kind: 'string', label: 'Label', optional: true },
      icon: { kind: 'icon', label: 'Icon', optional: true },
      alarmWhen: { kind: 'select', label: 'Alarm state', optional: true, options: ['on', 'off'] },
    },
    render: (p) => <AlarmTile entityId={p.entityId as string} label={p.label as string | undefined} icon={iconEl(p.icon)} alarmWhen={p.alarmWhen as 'on' | 'off' | undefined} />,
  },
  {
    type: 'ToggleTile', name: 'Toggle', category: 'Control',
    description: 'Click to toggle a switch or light.',
    defaultColSpan: 3, defaultRowSpan: 4,
    defaultProps: { entityId: 'switch.porch_light', icon: 'mdiPowerPlug' },
    schema: {
      entityId: { kind: 'entity', label: 'Entity', domains: ['switch', 'light'] },
      label: { kind: 'string', label: 'Label', optional: true },
      icon: { kind: 'icon', label: 'Icon', optional: true },
    },
    render: (p) => <ToggleTile entityId={p.entityId as string} label={p.label as string | undefined} icon={iconEl(p.icon)} />,
  },
  {
    type: 'ButtonTile', name: 'Button', category: 'Control',
    description: 'Action button with state-aware pill and label.',
    defaultColSpan: 3, defaultRowSpan: 4,
    defaultProps: { entityId: 'cover.garage_door', icon: 'mdiGarage', buttonText: 'OPERATE' },
    schema: {
      entityId: { kind: 'entity', label: 'Entity' },
      label: { kind: 'string', label: 'Label', optional: true },
      icon: { kind: 'icon', label: 'Icon', optional: true },
      buttonText: { kind: 'string', label: 'Button text', optional: true },
      service: { kind: 'json', label: 'Service override', optional: true, hint: '{ "domain":"cover", "service":"toggle" }' },
      states: { kind: 'json', label: 'States map', optional: true },
      confirmBeforeAction: { kind: 'boolean', label: 'Confirm before action', optional: true },
      confirmMessage: { kind: 'string', label: 'Confirm message', optional: true },
    },
    render: (p) => <ButtonTile
      entityId={p.entityId as string} label={p.label as string | undefined} icon={iconEl(p.icon)}
      buttonText={p.buttonText as string | undefined} service={p.service as never} states={p.states as never}
      confirmBeforeAction={p.confirmBeforeAction as boolean | undefined}
      confirmMessage={p.confirmMessage as string | undefined}
    />,
  },
  {
    type: 'SetpointTile', name: 'Setpoint', category: 'Control',
    description: 'Climate current / target with −/+ adjusters.',
    defaultColSpan: 3, defaultRowSpan: 4,
    defaultProps: { entityId: 'climate.living_room', icon: 'mdiHomeThermometer' },
    schema: {
      entityId: { kind: 'entity', label: 'Entity', domains: ['climate'] },
      label: { kind: 'string', label: 'Label', optional: true },
      icon: { kind: 'icon', label: 'Icon', optional: true },
      step: { kind: 'number', label: 'Step', optional: true },
    },
    render: (p) => <SetpointTile entityId={p.entityId as string} label={p.label as string | undefined} icon={iconEl(p.icon)} step={p.step as number | undefined} />,
  },
  {
    type: 'SliderTile', name: 'Slider', category: 'Control',
    description: 'Drag to set light brightness (or 0–100 value).',
    defaultColSpan: 3, defaultRowSpan: 4,
    defaultProps: { entityId: 'light.living_room_dimmer', icon: 'mdiBrightness6' },
    schema: {
      entityId: { kind: 'entity', label: 'Entity', domains: ['light'] },
      label: { kind: 'string', label: 'Label', optional: true },
      icon: { kind: 'icon', label: 'Icon', optional: true },
    },
    render: (p) => <SliderTile entityId={p.entityId as string} label={p.label as string | undefined} icon={iconEl(p.icon)} />,
  },
  {
    type: 'ColorPickerTile', name: 'Color Picker', category: 'Control',
    description: 'Hue + brightness control for RGB lights.',
    defaultColSpan: 3,
    defaultProps: { entityId: 'light.living_room_accent', icon: 'mdiPalette' },
    schema: {
      entityId: { kind: 'entity', label: 'Entity', domains: ['light'] },
      label: { kind: 'string', label: 'Label', optional: true },
      icon: { kind: 'icon', label: 'Icon', optional: true },
    },
    render: (p) => <ColorPickerTile entityId={p.entityId as string} label={p.label as string | undefined} icon={iconEl(p.icon)} />,
  },
  // ---- visualization tiles -----------------------------------------------
  {
    type: 'TankTile', name: 'Tank', category: 'Visualization',
    description: 'Vertical tank visual that fills with liquid based on entity %.',
    defaultColSpan: 3,
    defaultProps: { entityId: 'sensor.fuel_oil_level', icon: 'mdiBarrel', capacity: '275 GAL', warnBelow: 25, alarmBelow: 10 },
    schema: {
      entityId: { kind: 'entity', label: 'Entity' },
      label: { kind: 'string', label: 'Label', optional: true },
      icon: { kind: 'icon', label: 'Icon', optional: true },
      capacity: { kind: 'string', label: 'Capacity hint', optional: true },
      warnBelow: { kind: 'number', label: 'Warn below %', optional: true },
      alarmBelow: { kind: 'number', label: 'Alarm below %', optional: true },
    },
    render: (p) => <TankTile entityId={p.entityId as string} label={p.label as string | undefined} icon={iconEl(p.icon)} capacity={p.capacity as string | undefined} warnBelow={p.warnBelow as number | undefined} alarmBelow={p.alarmBelow as number | undefined} />,
  },
  {
    type: 'GaugeTile', name: 'Gauge', category: 'Visualization',
    description: '270° arc gauge for continuous values.',
    defaultColSpan: 3,
    defaultProps: { entityId: 'sensor.boiler_pressure', icon: 'mdiGauge', min: 0, max: 30, precision: 1 },
    schema: {
      entityId: { kind: 'entity', label: 'Entity' },
      label: { kind: 'string', label: 'Label', optional: true },
      icon: { kind: 'icon', label: 'Icon', optional: true },
      min: { kind: 'number', label: 'Min', optional: true },
      max: { kind: 'number', label: 'Max', optional: true },
      precision: { kind: 'number', label: 'Precision', optional: true },
      thresholds: { kind: 'json', label: 'Thresholds', optional: true },
    },
    render: (p) => <GaugeTile entityId={p.entityId as string} label={p.label as string | undefined} icon={iconEl(p.icon)} min={p.min as number | undefined} max={p.max as number | undefined} precision={p.precision as number | undefined} thresholds={p.thresholds as never} />,
  },
  {
    type: 'DonutTile', name: 'Donut', category: 'Visualization',
    description: 'Full radial percentage with center label.',
    defaultColSpan: 3,
    defaultProps: { entityId: 'sensor.ups_battery', icon: 'mdiBatteryHigh' },
    schema: {
      entityId: { kind: 'entity', label: 'Entity' },
      label: { kind: 'string', label: 'Label', optional: true },
      icon: { kind: 'icon', label: 'Icon', optional: true },
      warnBelow: { kind: 'number', label: 'Warn below %', optional: true },
      alarmBelow: { kind: 'number', label: 'Alarm below %', optional: true },
    },
    render: (p) => <DonutTile entityId={p.entityId as string} label={p.label as string | undefined} icon={iconEl(p.icon)} warnBelow={p.warnBelow as number | undefined} alarmBelow={p.alarmBelow as number | undefined} />,
  },
  {
    type: 'BarTile', name: 'Bar', category: 'Visualization',
    description: 'Horizontal level meter with scale labels.',
    defaultColSpan: 3,
    defaultProps: { entityId: 'sensor.sump_pit_level', icon: 'mdiWater', min: 0, max: 20, precision: 1 },
    schema: {
      entityId: { kind: 'entity', label: 'Entity' },
      label: { kind: 'string', label: 'Label', optional: true },
      icon: { kind: 'icon', label: 'Icon', optional: true },
      min: { kind: 'number', label: 'Min', optional: true },
      max: { kind: 'number', label: 'Max', optional: true },
      precision: { kind: 'number', label: 'Precision', optional: true },
      thresholds: { kind: 'json', label: 'Thresholds', optional: true },
    },
    render: (p) => <BarTile entityId={p.entityId as string} label={p.label as string | undefined} icon={iconEl(p.icon)} min={p.min as number | undefined} max={p.max as number | undefined} precision={p.precision as number | undefined} thresholds={p.thresholds as never} />,
  },
  {
    type: 'SparklineTile', name: 'Sparkline', category: 'Visualization',
    description: 'Current value with mini trend line under it.',
    defaultColSpan: 3,
    defaultProps: { entityId: 'sensor.outdoor_temperature', icon: 'mdiTrendingUp', precision: 1, points: 30 },
    schema: {
      entityId: { kind: 'entity', label: 'Entity' },
      label: { kind: 'string', label: 'Label', optional: true },
      icon: { kind: 'icon', label: 'Icon', optional: true },
      precision: { kind: 'number', label: 'Precision', optional: true },
      points: { kind: 'number', label: 'Points', optional: true },
    },
    render: (p) => <SparklineTile entityId={p.entityId as string} label={p.label as string | undefined} icon={iconEl(p.icon)} precision={p.precision as number | undefined} points={p.points as number | undefined} />,
  },
  {
    type: 'PlotTile', name: 'Plot', category: 'Visualization',
    description: 'Interactive ECharts line plot with hover crosshair + value tooltip.',
    defaultColSpan: 6, defaultRowSpan: 13,
    defaultProps: { entityId: 'sensor.power_consumption', icon: 'mdiChartLine', precision: 2, points: 60, timeRange: '60m' },
    schema: {
      entityId: { kind: 'entity', label: 'Entity' },
      label: { kind: 'string', label: 'Label', optional: true },
      icon: { kind: 'icon', label: 'Icon', optional: true },
      precision: { kind: 'number', label: 'Precision', optional: true },
      points: { kind: 'number', label: 'Points', optional: true },
      timeRange: { kind: 'string', label: 'Time range label', optional: true },
    },
    render: (p) => <PlotTile entityId={p.entityId as string} label={p.label as string | undefined} icon={iconEl(p.icon)} precision={p.precision as number | undefined} points={p.points as number | undefined} timeRange={p.timeRange as string | undefined} />,
  },
  {
    type: 'HistoryBarsTile', name: 'History Bars', category: 'Visualization',
    description: 'Vertical bar chart for daily/aggregated history.',
    defaultColSpan: 4,
    defaultProps: { entityId: 'sensor.daily_energy', icon: 'mdiChartBar', bars: 14, attributeKey: 'history_28d' },
    schema: {
      entityId: { kind: 'entity', label: 'Entity' },
      label: { kind: 'string', label: 'Label', optional: true },
      icon: { kind: 'icon', label: 'Icon', optional: true },
      bars: { kind: 'number', label: 'Bar count', optional: true },
      precision: { kind: 'number', label: 'Precision', optional: true },
      attributeKey: { kind: 'string', label: 'Attribute key', optional: true },
    },
    render: (p) => <HistoryBarsTile entityId={p.entityId as string} label={p.label as string | undefined} icon={iconEl(p.icon)} bars={p.bars as number | undefined} precision={p.precision as number | undefined} attributeKey={p.attributeKey as string | undefined} />,
  },
  {
    type: 'HeatmapTile', name: 'Heatmap', category: 'Visualization',
    description: 'Calendar-style heatmap grid colored by intensity.',
    defaultColSpan: 4,
    defaultProps: { entityId: 'sensor.daily_energy', icon: 'mdiChartTimelineVariant', cols: 7, historyAttribute: 'history_28d' },
    schema: {
      entityId: { kind: 'entity', label: 'Entity' },
      label: { kind: 'string', label: 'Label', optional: true },
      icon: { kind: 'icon', label: 'Icon', optional: true },
      cols: { kind: 'number', label: 'Columns', optional: true },
      historyAttribute: { kind: 'string', label: 'Attribute key', optional: true },
    },
    render: (p) => <HeatmapTile entityId={p.entityId as string} label={p.label as string | undefined} icon={iconEl(p.icon)} cols={p.cols as number | undefined} historyAttribute={p.historyAttribute as string | undefined} />,
  },
  // ---- info & data tiles -------------------------------------------------
  {
    type: 'ClockTile', name: 'Clock', category: 'Info',
    description: 'Current time and date.',
    defaultColSpan: 3, defaultRowSpan: 4,
    defaultProps: { icon: 'mdiClock', showSeconds: false, hour12: false },
    schema: {
      label: { kind: 'string', label: 'Label', optional: true },
      icon: { kind: 'icon', label: 'Icon', optional: true },
      showSeconds: { kind: 'boolean', label: 'Show seconds', optional: true },
      hour12: { kind: 'boolean', label: '12-hour format', optional: true },
    },
    render: (p) => <ClockTile label={p.label as string | undefined} icon={iconEl(p.icon)} showSeconds={p.showSeconds as boolean | undefined} hour12={p.hour12 as boolean | undefined} />,
  },
  {
    type: 'WeatherTile', name: 'Weather', category: 'Info',
    description: 'Current conditions + 3-day forecast.',
    defaultColSpan: 6, defaultRowSpan: 13,
    defaultProps: { entityId: 'weather.home', icon: 'mdiWeatherPartlyCloudy' },
    schema: {
      entityId: { kind: 'entity', label: 'Entity', domains: ['weather'] },
      label: { kind: 'string', label: 'Label', optional: true },
      icon: { kind: 'icon', label: 'Icon', optional: true },
    },
    render: (p) => <WeatherTile entityId={p.entityId as string} label={p.label as string | undefined} icon={iconEl(p.icon)} />,
  },
  {
    type: 'CameraTile', name: 'Camera', category: 'Info',
    description: 'Camera snapshot with REC overlay and timestamp.',
    defaultColSpan: 4,
    defaultProps: { entityId: 'camera.front_porch', icon: 'mdiCamera' },
    schema: {
      entityId: { kind: 'entity', label: 'Entity', domains: ['camera'] },
      label: { kind: 'string', label: 'Label', optional: true },
      icon: { kind: 'icon', label: 'Icon', optional: true },
      snapshotUrl: { kind: 'string', label: 'Snapshot URL', optional: true },
    },
    render: (p) => <CameraTile entityId={p.entityId as string} label={p.label as string | undefined} icon={iconEl(p.icon)} snapshotUrl={p.snapshotUrl as string | undefined} />,
  },
  {
    type: 'MediaPlayerTile', name: 'Media Player', category: 'Control',
    description: 'Now-playing info with transport controls.',
    defaultColSpan: 4,
    defaultProps: { entityId: 'media_player.living_room', icon: 'mdiMusic' },
    schema: {
      entityId: { kind: 'entity', label: 'Entity', domains: ['media_player'] },
      label: { kind: 'string', label: 'Label', optional: true },
      icon: { kind: 'icon', label: 'Icon', optional: true },
    },
    render: (p) => <MediaPlayerTile entityId={p.entityId as string} label={p.label as string | undefined} icon={iconEl(p.icon)} />,
  },
  {
    type: 'NetworkTile', name: 'Network', category: 'Info',
    description: 'Internet status with throughput and ping.',
    defaultColSpan: 3, defaultRowSpan: 4,
    defaultProps: { entityId: 'sensor.internet_status', icon: 'mdiWifi' },
    schema: {
      entityId: { kind: 'entity', label: 'Entity' },
      label: { kind: 'string', label: 'Label', optional: true },
      icon: { kind: 'icon', label: 'Icon', optional: true },
    },
    render: (p) => <NetworkTile entityId={p.entityId as string} label={p.label as string | undefined} icon={iconEl(p.icon)} />,
  },
  {
    type: 'ServerStatsTile', name: 'Server Stats', category: 'Info',
    description: 'CPU / RAM / Disk bars for a host.',
    defaultColSpan: 4,
    defaultProps: { icon: 'mdiServerNetwork', cpuEntityId: 'sensor.ha_cpu', memoryEntityId: 'sensor.ha_memory', diskEntityId: 'sensor.ha_disk' },
    schema: {
      label: { kind: 'string', label: 'Label', optional: true },
      icon: { kind: 'icon', label: 'Icon', optional: true },
      cpuEntityId: { kind: 'entity', label: 'CPU entity' },
      memoryEntityId: { kind: 'entity', label: 'Memory entity' },
      diskEntityId: { kind: 'entity', label: 'Disk entity' },
    },
    render: (p) => <ServerStatsTile label={p.label as string | undefined} icon={iconEl(p.icon)} cpuEntityId={p.cpuEntityId as string} memoryEntityId={p.memoryEntityId as string} diskEntityId={p.diskEntityId as string} />,
  },
  {
    type: 'WindCompassTile', name: 'Wind Compass', category: 'Visualization',
    description: 'Compass rose with wind speed and direction.',
    defaultColSpan: 3,
    defaultProps: { icon: 'mdiCompass', speedEntityId: 'sensor.wind_speed', directionEntityId: 'sensor.wind_direction' },
    schema: {
      label: { kind: 'string', label: 'Label', optional: true },
      icon: { kind: 'icon', label: 'Icon', optional: true },
      speedEntityId: { kind: 'entity', label: 'Speed entity' },
      directionEntityId: { kind: 'entity', label: 'Direction entity' },
    },
    render: (p) => <WindCompassTile label={p.label as string | undefined} icon={iconEl(p.icon)} speedEntityId={p.speedEntityId as string} directionEntityId={p.directionEntityId as string} />,
  },
  {
    type: 'SunMoonTile', name: 'Sun & Moon', category: 'Visualization',
    description: 'Sunrise/sunset arc and moon phase glyph.',
    defaultColSpan: 4,
    defaultProps: { icon: 'mdiWeatherSunny', sunEntityId: 'sun.sun', moonEntityId: 'sensor.moon_phase' },
    schema: {
      label: { kind: 'string', label: 'Label', optional: true },
      icon: { kind: 'icon', label: 'Icon', optional: true },
      sunEntityId: { kind: 'entity', label: 'Sun entity' },
      moonEntityId: { kind: 'entity', label: 'Moon entity', optional: true },
    },
    render: (p) => <SunMoonTile label={p.label as string | undefined} icon={iconEl(p.icon)} sunEntityId={p.sunEntityId as string} moonEntityId={p.moonEntityId as string | undefined} />,
  },
  {
    type: 'EnergyFlowTile', name: 'Energy Flow', category: 'Visualization',
    description: 'Animated flow diagram between sources and home.',
    defaultColSpan: 6, defaultRowSpan: 13,
    defaultProps: { icon: 'mdiFlashTriangle', gridEntityId: 'sensor.grid_power', solarEntityId: 'sensor.solar_power', batteryEntityId: 'sensor.battery_power', homeEntityId: 'sensor.home_consumption' },
    schema: {
      label: { kind: 'string', label: 'Label', optional: true },
      icon: { kind: 'icon', label: 'Icon', optional: true },
      gridEntityId: { kind: 'entity', label: 'Grid entity' },
      solarEntityId: { kind: 'entity', label: 'Solar entity', optional: true },
      batteryEntityId: { kind: 'entity', label: 'Battery entity', optional: true },
      homeEntityId: { kind: 'entity', label: 'Home entity' },
    },
    render: (p) => <EnergyFlowTile label={p.label as string | undefined} icon={iconEl(p.icon)} gridEntityId={p.gridEntityId as string} solarEntityId={p.solarEntityId as string | undefined} batteryEntityId={p.batteryEntityId as string | undefined} homeEntityId={p.homeEntityId as string} />,
  },
  // ---- group tiles -------------------------------------------------------
  {
    type: 'AreaListTile', name: 'Area List', category: 'Group',
    description: 'Multiple entities per row (value / binary / toggle cells).',
    defaultColSpan: 6, defaultRowSpan: 13,
    defaultProps: {
      label: 'BEDROOMS', icon: 'mdiBed',
      rows: [
        { label: 'MASTER', cells: [
          { type: 'value', entityId: 'sensor.master_bedroom_temp', precision: 0 },
          { type: 'value', entityId: 'sensor.master_bedroom_humidity', precision: 0 },
          { type: 'binary', entityId: 'binary_sensor.master_bedroom_occupancy', icon: 'mdiMotionSensor', activeStatus: 'info' },
          { type: 'toggle', entityId: 'light.master_bedroom', icon: 'mdiLightbulbOn' },
        ] },
      ],
    },
    schema: {
      label: { kind: 'string', label: 'Label' },
      icon: { kind: 'icon', label: 'Icon', optional: true },
      rows: { kind: 'rows', label: 'Rows', rowKind: 'area' },
    },
    render: (p) => <AreaListTile label={p.label as string} icon={iconEl(p.icon)} rows={resolveAreaRows(p.rows)} />,
  },
  {
    type: 'MultiMetricTile', name: 'Multi-Metric', category: 'Group',
    description: 'Grid of metric cells (label + value) in one tile.',
    defaultColSpan: 6,
    defaultProps: {
      label: 'BOILER', icon: 'mdiFire', columns: 4,
      metrics: [
        { entityId: 'sensor.boiler_supply_temp', label: 'SUPPLY', precision: 1 },
        { entityId: 'sensor.boiler_return_temp', label: 'RETURN', precision: 1 },
        { entityId: 'sensor.boiler_delta_t', label: 'DELTA-T', precision: 1 },
        { entityId: 'sensor.boiler_pressure', label: 'PSI', precision: 1 },
      ],
    },
    schema: {
      label: { kind: 'string', label: 'Label' },
      icon: { kind: 'icon', label: 'Icon', optional: true },
      pill: { kind: 'string', label: 'Pill text', optional: true },
      columns: { kind: 'number', label: 'Columns', optional: true },
      metrics: { kind: 'rows', label: 'Metrics', rowKind: 'multi-metric' },
    },
    render: (p) => <MultiMetricTile label={p.label as string} icon={iconEl(p.icon)} pill={p.pill as string | undefined} columns={p.columns as number | undefined} metrics={p.metrics as never} />,
  },
  {
    type: 'StatusListTile', name: 'Status List', category: 'Group',
    description: 'List of binary states with ● / ○ symbology.',
    defaultColSpan: 3,
    defaultProps: {
      label: 'DOORS', icon: 'mdiDoor',
      entries: [
        { entityId: 'binary_sensor.front_door', label: 'FRONT', stateLabels: { on: 'OPEN', off: 'CLOSED' }, activeStatus: 'warn' },
      ],
    },
    schema: {
      label: { kind: 'string', label: 'Label' },
      icon: { kind: 'icon', label: 'Icon', optional: true },
      pill: { kind: 'string', label: 'Pill', optional: true },
      entries: { kind: 'rows', label: 'Entries', rowKind: 'status-list' },
    },
    render: (p) => <StatusListTile label={p.label as string} icon={iconEl(p.icon)} pill={p.pill as string | undefined} entries={p.entries as never} />,
  },
  {
    type: 'PresenceListTile', name: 'Presence List', category: 'Group',
    description: 'List of people with home/away state and avatar.',
    defaultColSpan: 3,
    defaultProps: { label: 'PRESENCE', icon: 'mdiAccountGroup', personIds: ['person.user_1', 'person.user_2'] },
    schema: {
      label: { kind: 'string', label: 'Label' },
      icon: { kind: 'icon', label: 'Icon', optional: true },
      personIds: { kind: 'rows', label: 'People', rowKind: 'presence' },
    },
    render: (p) => <PresenceListTile label={p.label as string} icon={iconEl(p.icon)} personIds={p.personIds as string[]} />,
  },
  {
    type: 'IrrigationTile', name: 'Irrigation', category: 'Homestead',
    description: 'Irrigation zones with running indicator and toggles.',
    defaultColSpan: 3,
    defaultProps: {
      label: 'IRRIGATION', icon: 'mdiSprinkler',
      zones: [
        { entityId: 'switch.irrigation_zone_1', label: 'LAWN' },
        { entityId: 'switch.irrigation_zone_2', label: 'GARDEN' },
      ],
    },
    schema: {
      label: { kind: 'string', label: 'Label' },
      icon: { kind: 'icon', label: 'Icon', optional: true },
      zones: { kind: 'rows', label: 'Zones', rowKind: 'irrigation' },
    },
    render: (p) => <IrrigationTile label={p.label as string} icon={iconEl(p.icon)} zones={p.zones as never} />,
  },
  // ---- single-purpose tiles ---------------------------------------------
  {
    type: 'PersonTile', name: 'Person', category: 'Info',
    description: 'Single person with avatar and presence state.',
    defaultColSpan: 3, defaultRowSpan: 4,
    defaultProps: { entityId: 'person.user_1', icon: 'mdiAccount' },
    schema: {
      entityId: { kind: 'entity', label: 'Person entity', domains: ['person'] },
      label: { kind: 'string', label: 'Label override', optional: true },
      icon: { kind: 'icon', label: 'Icon', optional: true },
    },
    render: (p) => <PersonTile entityId={p.entityId as string} label={p.label as string | undefined} icon={iconEl(p.icon)} />,
  },
  {
    type: 'SceneButtonTile', name: 'Scene Button', category: 'Control',
    description: 'Large tap-to-activate scene button.',
    defaultColSpan: 3, defaultRowSpan: 4,
    defaultProps: { entityId: 'scene.movie_night', icon: 'mdiAutoFix' },
    schema: {
      entityId: { kind: 'entity', label: 'Scene entity', domains: ['scene'] },
      label: { kind: 'string', label: 'Label override', optional: true },
      icon: { kind: 'icon', label: 'Icon', optional: true },
      status: { kind: 'select', label: 'Status color', optional: true, options: ['info', 'ok', 'warn', 'alarm', 'idle'] },
    },
    render: (p) => <SceneButtonTile entityId={p.entityId as string} label={p.label as string | undefined} icon={iconEl(p.icon)} status={p.status as never} />,
  },
  {
    type: 'CalendarTile', name: 'Calendar', category: 'Info',
    description: 'Upcoming events from a calendar entity.',
    defaultColSpan: 4,
    defaultProps: { entityId: 'calendar.home', icon: 'mdiCalendarMonth', max: 4 },
    schema: {
      entityId: { kind: 'entity', label: 'Calendar entity', domains: ['calendar'] },
      label: { kind: 'string', label: 'Label', optional: true },
      icon: { kind: 'icon', label: 'Icon', optional: true },
      max: { kind: 'number', label: 'Max events', optional: true },
    },
    render: (p) => <CalendarTile entityId={p.entityId as string} label={p.label as string | undefined} icon={iconEl(p.icon)} max={p.max as number | undefined} />,
  },
  {
    type: 'TodoListTile', name: 'Todo List', category: 'Info',
    description: 'Checkable items from a todo entity.',
    defaultColSpan: 4,
    defaultProps: { entityId: 'todo.house_chores', icon: 'mdiCheckboxMultipleMarked', showCompleted: true },
    schema: {
      entityId: { kind: 'entity', label: 'Todo entity', domains: ['todo'] },
      label: { kind: 'string', label: 'Label', optional: true },
      icon: { kind: 'icon', label: 'Icon', optional: true },
      showCompleted: { kind: 'boolean', label: 'Show completed', optional: true },
    },
    render: (p) => <TodoListTile entityId={p.entityId as string} label={p.label as string | undefined} icon={iconEl(p.icon)} showCompleted={p.showCompleted as boolean | undefined} />,
  },
  {
    type: 'NotificationFeedTile', name: 'Notifications', category: 'Info',
    description: 'Recent notifications/events list.',
    defaultColSpan: 4, defaultRowSpan: 13,
    defaultProps: { entityId: 'sensor.notifications', icon: 'mdiBell', max: 6 },
    schema: {
      entityId: { kind: 'entity', label: 'Entity' },
      label: { kind: 'string', label: 'Label', optional: true },
      icon: { kind: 'icon', label: 'Icon', optional: true },
      max: { kind: 'number', label: 'Max items', optional: true },
    },
    render: (p) => <NotificationFeedTile entityId={p.entityId as string} label={p.label as string | undefined} icon={iconEl(p.icon)} max={p.max as number | undefined} />,
  },
  {
    type: 'VacuumTile', name: 'Vacuum', category: 'Control',
    description: 'Robot vacuum status with battery and controls.',
    defaultColSpan: 3,
    defaultProps: { entityId: 'vacuum.living_room', icon: 'mdiRobotVacuum' },
    schema: {
      entityId: { kind: 'entity', label: 'Vacuum entity', domains: ['vacuum'] },
      label: { kind: 'string', label: 'Label', optional: true },
      icon: { kind: 'icon', label: 'Icon', optional: true },
    },
    render: (p) => <VacuumTile entityId={p.entityId as string} label={p.label as string | undefined} icon={iconEl(p.icon)} />,
  },
  {
    type: 'BeehiveTile', name: 'Beehive', category: 'Homestead',
    description: 'Beehive weight + temperature + humidity.',
    defaultColSpan: 3,
    defaultProps: { label: 'HIVE', icon: 'mdiBeehiveOutline', weightEntityId: 'sensor.beehive_weight', tempEntityId: 'sensor.beehive_temp', humidityEntityId: 'sensor.beehive_humidity' },
    schema: {
      label: { kind: 'string', label: 'Label' },
      icon: { kind: 'icon', label: 'Icon', optional: true },
      weightEntityId: { kind: 'entity', label: 'Weight entity' },
      tempEntityId: { kind: 'entity', label: 'Temp entity', optional: true },
      humidityEntityId: { kind: 'entity', label: 'Humidity entity', optional: true },
    },
    render: (p) => <BeehiveTile label={p.label as string} icon={iconEl(p.icon)} weightEntityId={p.weightEntityId as string} tempEntityId={p.tempEntityId as string | undefined} humidityEntityId={p.humidityEntityId as string | undefined} />,
  },
  {
    type: 'TrashScheduleTile', name: 'Trash Schedule', category: 'Homestead',
    description: 'Countdown to next trash pickup with type pill.',
    defaultColSpan: 3, defaultRowSpan: 4,
    defaultProps: { entityId: 'sensor.trash_pickup', icon: 'mdiTrashCan' },
    schema: {
      entityId: { kind: 'entity', label: 'Entity' },
      label: { kind: 'string', label: 'Label', optional: true },
      icon: { kind: 'icon', label: 'Icon', optional: true },
    },
    render: (p) => <TrashScheduleTile entityId={p.entityId as string} label={p.label as string | undefined} icon={iconEl(p.icon)} />,
  },
  {
    type: 'GeneratorTile', name: 'Generator', category: 'Homestead',
    description: 'Generator state, fuel level, last run, runtime.',
    defaultColSpan: 4,
    defaultProps: { entityId: 'sensor.generator', icon: 'mdiEngine' },
    schema: {
      entityId: { kind: 'entity', label: 'Entity' },
      label: { kind: 'string', label: 'Label', optional: true },
      icon: { kind: 'icon', label: 'Icon', optional: true },
    },
    render: (p) => <GeneratorTile entityId={p.entityId as string} label={p.label as string | undefined} icon={iconEl(p.icon)} />,
  },
  {
    type: 'MailboxTile', name: 'Mailbox', category: 'Homestead',
    description: 'Package and mail counts with last delivery time.',
    defaultColSpan: 3, defaultRowSpan: 4,
    defaultProps: { entityId: 'sensor.mailbox', icon: 'mdiMailbox' },
    schema: {
      entityId: { kind: 'entity', label: 'Entity' },
      label: { kind: 'string', label: 'Label', optional: true },
      icon: { kind: 'icon', label: 'Icon', optional: true },
    },
    render: (p) => <MailboxTile entityId={p.entityId as string} label={p.label as string | undefined} icon={iconEl(p.icon)} />,
  },
  {
    type: 'TimerTile', name: 'Timer', category: 'Info',
    description: 'Countdown ring with start/pause/cancel.',
    defaultColSpan: 3,
    defaultProps: { entityId: 'timer.oven', icon: 'mdiTimerOutline' },
    schema: {
      entityId: { kind: 'entity', label: 'Timer entity', domains: ['timer'] },
      label: { kind: 'string', label: 'Label', optional: true },
      icon: { kind: 'icon', label: 'Icon', optional: true },
    },
    render: (p) => <TimerTile entityId={p.entityId as string} label={p.label as string | undefined} icon={iconEl(p.icon)} />,
  },
  {
    type: 'HVACScheduleTile', name: 'HVAC Schedule', category: 'Info',
    description: '24-hour setpoint visualization.',
    defaultColSpan: 4,
    defaultProps: { entityId: 'sensor.hvac_schedule_living_room', icon: 'mdiCalendarClock' },
    schema: {
      entityId: { kind: 'entity', label: 'Entity' },
      label: { kind: 'string', label: 'Label', optional: true },
      icon: { kind: 'icon', label: 'Icon', optional: true },
    },
    render: (p) => <HVACScheduleTile entityId={p.entityId as string} label={p.label as string | undefined} icon={iconEl(p.icon)} />,
  },
  // ---- round-5 additions -------------------------------------------------
  {
    type: 'ClimateThermostatTile', name: 'Thermostat (full)', category: 'Control',
    description: 'Full thermostat — mode/fan/preset buttons, current+target, humidity. Toggle which sections to show.',
    defaultColSpan: 4,
    defaultProps: {
      entityId: 'climate.thermostat_main', icon: 'mdiHomeThermometer',
      showModeButtons: true, showFanButtons: true, showPresetButtons: true,
      showHumidity: true, showAction: true,
    },
    schema: {
      entityId: { kind: 'entity', label: 'Climate entity', domains: ['climate'] },
      label: { kind: 'string', label: 'Label', optional: true },
      icon: { kind: 'icon', label: 'Icon', optional: true },
      showModeButtons:   { kind: 'boolean', label: 'Show mode buttons',   optional: true },
      showFanButtons:    { kind: 'boolean', label: 'Show fan buttons',    optional: true },
      showPresetButtons: { kind: 'boolean', label: 'Show preset buttons', optional: true },
      showHumidity:      { kind: 'boolean', label: 'Show humidity',       optional: true },
      showAction:        { kind: 'boolean', label: 'Show action pill',    optional: true },
      temperatureHistoryEntityId: { kind: 'entity', label: 'Temp history sensor (for modal chart)', optional: true, domains: ['sensor'] },
    },
    render: (p) => <ClimateThermostatTile
      entityId={p.entityId as string} label={p.label as string | undefined} icon={iconEl(p.icon)}
      showModeButtons={p.showModeButtons as boolean | undefined}
      showFanButtons={p.showFanButtons as boolean | undefined}
      showPresetButtons={p.showPresetButtons as boolean | undefined}
      showHumidity={p.showHumidity as boolean | undefined}
      showAction={p.showAction as boolean | undefined}
      temperatureHistoryEntityId={p.temperatureHistoryEntityId as string | undefined}
    />,
  },
  {
    type: 'AirPurifierTile', name: 'Air Purifier', category: 'Control',
    description: 'PM1/2.5/10 readings, filter life, fan + preset selector.',
    defaultColSpan: 4,
    defaultProps: { label: 'AIR PURIFIER', icon: 'mdiFan', fanEntityId: 'fan.living_room_purifier', pm1EntityId: 'sensor.air_pm1', pm25EntityId: 'sensor.air_pm25', pm10EntityId: 'sensor.air_pm10', filterLifeEntityId: 'sensor.air_filter_life' },
    schema: {
      label: { kind: 'string', label: 'Label' },
      icon: { kind: 'icon', label: 'Icon', optional: true },
      fanEntityId: { kind: 'entity', label: 'Fan entity', domains: ['fan'] },
      pm1EntityId: { kind: 'entity', label: 'PM1 entity', optional: true },
      pm25EntityId: { kind: 'entity', label: 'PM2.5 entity' },
      pm10EntityId: { kind: 'entity', label: 'PM10 entity', optional: true },
      filterLifeEntityId: { kind: 'entity', label: 'Filter life entity', optional: true },
    },
    render: (p) => <AirPurifierTile label={p.label as string} icon={iconEl(p.icon)} fanEntityId={p.fanEntityId as string} pm1EntityId={p.pm1EntityId as string | undefined} pm25EntityId={p.pm25EntityId as string} pm10EntityId={p.pm10EntityId as string | undefined} filterLifeEntityId={p.filterLifeEntityId as string | undefined} />,
  },
  {
    type: 'LightFanTile', name: 'Light + Fan', category: 'Control',
    description: 'Combined ceiling light + fan with brightness slider, speed picker, direction.',
    defaultColSpan: 4,
    defaultProps: { label: 'CEILING', icon: 'mdiFan', lightEntityId: 'light.living_room_dimmer', fanEntityId: 'fan.ceiling_fan' },
    schema: {
      label: { kind: 'string', label: 'Label' },
      icon: { kind: 'icon', label: 'Icon', optional: true },
      lightEntityId: { kind: 'entity', label: 'Light entity', domains: ['light'] },
      fanEntityId: { kind: 'entity', label: 'Fan entity', domains: ['fan'] },
    },
    render: (p) => <LightFanTile label={p.label as string} icon={iconEl(p.icon)} lightEntityId={p.lightEntityId as string} fanEntityId={p.fanEntityId as string} />,
  },
  {
    type: 'CurtainTile', name: 'Curtain', category: 'Control',
    description: 'Animated curtain panels that part with position.',
    defaultColSpan: 3, defaultRowSpan: 7,
    defaultProps: { entityId: 'cover.living_room_curtains', icon: 'mdiWindowOpen' },
    schema: {
      entityId: { kind: 'entity', label: 'Cover entity', domains: ['cover'] },
      label: { kind: 'string', label: 'Label', optional: true },
      icon: { kind: 'icon', label: 'Icon', optional: true },
    },
    render: (p) => <CurtainTile entityId={p.entityId as string} label={p.label as string | undefined} icon={iconEl(p.icon)} />,
  },
  {
    type: 'NASTile', name: 'NAS', category: 'Info',
    description: 'NAS storage donut + read/write throughput + active users.',
    defaultColSpan: 3,
    defaultProps: { entityId: 'sensor.nas_storage', icon: 'mdiServerNetwork' },
    schema: {
      entityId: { kind: 'entity', label: 'Storage entity' },
      label: { kind: 'string', label: 'Label', optional: true },
      icon: { kind: 'icon', label: 'Icon', optional: true },
    },
    render: (p) => <NASTile entityId={p.entityId as string} label={p.label as string | undefined} icon={iconEl(p.icon)} />,
  },
  {
    type: 'SpeedTestTile', name: 'Speed Test', category: 'Info',
    description: 'Down/up/ping with manual RUN TEST trigger.',
    defaultColSpan: 3,
    defaultProps: { entityId: 'sensor.speedtest', icon: 'mdiTrendingUp' },
    schema: {
      entityId: { kind: 'entity', label: 'Entity' },
      label: { kind: 'string', label: 'Label', optional: true },
      icon: { kind: 'icon', label: 'Icon', optional: true },
      runService: { kind: 'json', label: 'Run-test service', optional: true, hint: '{ "domain":"button", "service":"press" }' },
    },
    render: (p) => <SpeedTestTile entityId={p.entityId as string} label={p.label as string | undefined} icon={iconEl(p.icon)} runService={p.runService as never} />,
  },
  {
    type: 'StarlinkTile', name: 'Starlink', category: 'Info',
    description: 'Throughput + ping + uptime + obstruction bar.',
    defaultColSpan: 3,
    defaultProps: { entityId: 'sensor.starlink', icon: 'mdiWifi' },
    schema: {
      entityId: { kind: 'entity', label: 'Entity' },
      label: { kind: 'string', label: 'Label', optional: true },
      icon: { kind: 'icon', label: 'Icon', optional: true },
    },
    render: (p) => <StarlinkTile entityId={p.entityId as string} label={p.label as string | undefined} icon={iconEl(p.icon)} />,
  },
  {
    type: 'UDMTile', name: 'UDM', category: 'Info',
    description: 'UniFi Dream Machine: WAN status, client count, throughput, uptime.',
    defaultColSpan: 3,
    defaultProps: { entityId: 'sensor.udm', icon: 'mdiServerNetwork' },
    schema: {
      entityId: { kind: 'entity', label: 'Entity' },
      label: { kind: 'string', label: 'Label', optional: true },
      icon: { kind: 'icon', label: 'Icon', optional: true },
    },
    render: (p) => <UDMTile entityId={p.entityId as string} label={p.label as string | undefined} icon={iconEl(p.icon)} />,
  },
  {
    type: 'VehicleTile', name: 'Vehicle', category: 'Control',
    description: 'Battery + range + lock/start/climate buttons.',
    defaultColSpan: 4,
    defaultProps: { entityId: 'sensor.tesla_model3', icon: 'mdiHome', lockEntityId: 'lock.tesla_model3_lock', climateEntityId: 'climate.tesla_model3_climate' },
    schema: {
      entityId: { kind: 'entity', label: 'Vehicle status entity' },
      label: { kind: 'string', label: 'Label', optional: true },
      icon: { kind: 'icon', label: 'Icon', optional: true },
      lockEntityId: { kind: 'entity', label: 'Lock entity', optional: true, domains: ['lock'] },
      climateEntityId: { kind: 'entity', label: 'Climate entity', optional: true, domains: ['climate'] },
      startService: { kind: 'json', label: 'Remote start service', optional: true },
    },
    render: (p) => <VehicleTile entityId={p.entityId as string} label={p.label as string | undefined} icon={iconEl(p.icon)} lockEntityId={p.lockEntityId as string | undefined} climateEntityId={p.climateEntityId as string | undefined} startService={p.startService as never} />,
  },
  {
    type: 'LaundryTile', name: 'Laundry', category: 'Info',
    description: 'Washer + dryer side-by-side with spinning-drum animation when active. Add optional extra entity rows per appliance.',
    defaultColSpan: 6,
    defaultProps: {
      label: 'LAUNDRY', icon: 'mdiWrench',
      washerEntityId: 'sensor.washing_machine', dryerEntityId: 'sensor.dryer',
      washerExtras: [], dryerExtras: [],
    },
    schema: {
      label: { kind: 'string', label: 'Label' },
      icon: { kind: 'icon', label: 'Icon', optional: true },
      washerEntityId: { kind: 'entity', label: 'Washer entity' },
      dryerEntityId: { kind: 'entity', label: 'Dryer entity' },
      washerExtras: { kind: 'json', label: 'Washer extras', optional: true, hint: '[{ "label":"DOOR", "entityId":"binary_sensor.washer_door" }]' },
      dryerExtras:  { kind: 'json', label: 'Dryer extras',  optional: true, hint: '[{ "label":"DOOR", "entityId":"binary_sensor.dryer_door" }]' },
    },
    render: (p) => <LaundryTile
      label={p.label as string} icon={iconEl(p.icon)}
      washerEntityId={p.washerEntityId as string} dryerEntityId={p.dryerEntityId as string}
      washerExtras={p.washerExtras as never} dryerExtras={p.dryerExtras as never}
    />,
  },
  {
    type: 'SankeyTile', name: 'Power Sankey', category: 'Visualization',
    description: 'Source → consumer flow ribbons with proportional widths.',
    defaultColSpan: 6, defaultRowSpan: 13,
    defaultProps: {
      label: 'POWER FLOW', icon: 'mdiTransmissionTower',
      sources: [
        { entityId: 'sensor.grid_power', label: 'GRID' },
        { entityId: 'sensor.solar_power', label: 'SOLAR' },
      ],
      consumers: [
        { entityId: 'sensor.home_consumption', label: 'HOME' },
        { entityId: 'sensor.power_consumption', label: 'CIRCUITS' },
      ],
    },
    schema: {
      label: { kind: 'string', label: 'Label' },
      icon: { kind: 'icon', label: 'Icon', optional: true },
      sources: { kind: 'json', label: 'Sources', hint: '[{ "entityId":"sensor.grid_power", "label":"GRID" }, ...]' },
      consumers: { kind: 'json', label: 'Consumers', hint: '[{ "entityId":"sensor.home_consumption", "label":"HOME" }, ...]' },
    },
    render: (p) => <SankeyTile label={p.label as string} icon={iconEl(p.icon)} sources={p.sources as never} consumers={p.consumers as never} />,
  },
  {
    type: 'CountdownTile', name: 'Countdown', category: 'Info',
    description: 'D / H / M / S countdown to a target date/time with optional repeat.',
    defaultColSpan: 3, defaultRowSpan: 4,
    defaultProps: { entityId: 'sensor.vacation_countdown', icon: 'mdiTimerOutline' },
    schema: {
      entityId: { kind: 'entity', label: 'Entity', optional: true },
      label: { kind: 'string', label: 'Label', optional: true },
      icon: { kind: 'icon', label: 'Icon', optional: true },
      targetIso: { kind: 'string', label: 'Target ISO', optional: true, hint: '2026-06-06T00:00:00' },
      repeat: { kind: 'select', label: 'Repeat', optional: true, options: ['none', 'daily', 'weekly', 'monthly', 'yearly'] },
    },
    render: (p) => <CountdownTile entityId={p.entityId as string | undefined} label={p.label as string | undefined} icon={iconEl(p.icon)} targetIso={p.targetIso as string | undefined} repeat={p.repeat as never} />,
  },
  {
    type: 'WeatherRadarTile', name: 'Weather Radar', category: 'Visualization',
    description: 'Embedded weather radar (defaults to Casco Twp, MI windy.com embed).',
    defaultColSpan: 6, defaultRowSpan: 13,
    defaultProps: {
      label: 'RADAR', icon: 'mdiWeatherPouring',
      iframeUrl: 'https://embed.windy.com/embed2.html?lat=42.82&lon=-82.54&detailLat=42.82&detailLon=-82.54&width=650&height=450&zoom=8&level=surface&overlay=radar&product=ecmwf&menu=&message=&marker=&calendar=now&pressure=&type=map&location=coordinates&detail=&metricWind=mph&metricTemp=%C2%B0F&radarRange=-1',
    },
    schema: {
      label: { kind: 'string', label: 'Label' },
      icon: { kind: 'icon', label: 'Icon', optional: true },
      iframeUrl: { kind: 'string', label: 'Iframe URL', optional: true, hint: 'e.g. https://embed.windy.com/embed.html?...' },
    },
    render: (p) => <WeatherRadarTile label={p.label as string} icon={iconEl(p.icon)} iframeUrl={p.iframeUrl as string | undefined} />,
  },
  {
    type: 'ApplianceTile', name: 'Appliance', category: 'Info',
    description: 'Generic appliance (Samsung/SmartThings) showing cycle, time remaining, temps, door, power.',
    defaultColSpan: 3,
    defaultProps: { entityId: 'sensor.dishwasher', icon: 'mdiWrench' },
    schema: {
      entityId: { kind: 'entity', label: 'Appliance entity' },
      label: { kind: 'string', label: 'Label', optional: true },
      icon: { kind: 'icon', label: 'Icon', optional: true },
      showCycle: { kind: 'boolean', label: 'Show cycle', optional: true },
      showTimeRemaining: { kind: 'boolean', label: 'Show time remaining', optional: true },
      showPower: { kind: 'boolean', label: 'Show power', optional: true },
      showTemps: { kind: 'boolean', label: 'Show temps', optional: true },
      showDoor: { kind: 'boolean', label: 'Show door', optional: true },
    },
    render: (p) => <ApplianceTile entityId={p.entityId as string} label={p.label as string | undefined} icon={iconEl(p.icon)} showCycle={p.showCycle as boolean | undefined} showTimeRemaining={p.showTimeRemaining as boolean | undefined} showPower={p.showPower as boolean | undefined} showTemps={p.showTemps as boolean | undefined} showDoor={p.showDoor as boolean | undefined} />,
  },
  {
    type: 'HomelabTile', name: 'Homelab', category: 'Info',
    description: 'Multiple homelab hosts in one tile, each with CPU + RAM bars.',
    defaultColSpan: 4,
    defaultProps: {
      label: 'HOMELAB', icon: 'mdiServerNetwork',
      hosts: [
        { name: 'HA', cpuEntityId: 'sensor.ha_cpu', memoryEntityId: 'sensor.ha_memory' },
        { name: 'NAS', cpuEntityId: 'sensor.nas_cpu', memoryEntityId: 'sensor.nas_memory' },
        { name: 'DOCKER', cpuEntityId: 'sensor.docker_host_cpu', memoryEntityId: 'sensor.docker_host_memory' },
      ],
    },
    schema: {
      label: { kind: 'string', label: 'Label' },
      icon: { kind: 'icon', label: 'Icon', optional: true },
      hosts: { kind: 'json', label: 'Hosts', hint: '[{ "name":"HA", "cpuEntityId":"sensor.ha_cpu", "memoryEntityId":"sensor.ha_memory", "diskEntityId":"sensor.ha_disk", "uptimeEntityId":"sensor.ha_uptime", "statusEntityId":"binary_sensor.ha_up" }]' },
    },
    render: (p) => <HomelabTile label={p.label as string} icon={iconEl(p.icon)} hosts={p.hosts as never} />,
  },
  // ---- round-6 additions ------------------------------------------------
  {
    type: 'BlindsTile', name: 'Blinds', category: 'Control',
    description: 'Animated blinds that descend from the top of the window with cover position.',
    defaultColSpan: 3, defaultRowSpan: 7,
    defaultProps: { entityId: 'cover.bedroom_blinds', icon: 'mdiWindowOpen' },
    schema: {
      entityId: { kind: 'entity', label: 'Cover entity', domains: ['cover'] },
      label: { kind: 'string', label: 'Label', optional: true },
      icon: { kind: 'icon', label: 'Icon', optional: true },
      slatCount: { kind: 'number', label: 'Slat count', optional: true },
    },
    render: (p) => <BlindsTile entityId={p.entityId as string} label={p.label as string | undefined} icon={iconEl(p.icon)} slatCount={p.slatCount as number | undefined} />,
  },
  {
    type: 'WeeklyDigestTile', name: 'Weekly Digest', category: 'Info',
    description: 'Pulls weekly digest text from a custom endpoint (e.g. homestead-hq). Needs CORS on the server. Set the URL in the inspector.',
    defaultColSpan: 4, defaultRowSpan: 13,
    defaultProps: { label: 'WEEKLY DIGEST', icon: 'mdiViewDashboard', url: 'http://homestead-hq.local:3000/api/digest/weekly', refreshMinutes: 60 },
    schema: {
      label: { kind: 'string', label: 'Label', optional: true },
      icon: { kind: 'icon', label: 'Icon', optional: true },
      url: { kind: 'string', label: 'URL', hint: 'http://homestead-hq.local:3000/api/digest/weekly' },
      refreshMinutes: { kind: 'number', label: 'Refresh (min)', optional: true },
    },
    render: (p) => <WeeklyDigestTile label={p.label as string | undefined} icon={iconEl(p.icon)} url={p.url as string} refreshMinutes={p.refreshMinutes as number | undefined} />,
  },
  {
    type: 'HeaderTile', name: 'Section Header', category: 'Misc',
    description: 'Plain text header for organizing tiles into named groups on a page.',
    defaultColSpan: 12, defaultRowSpan: 2,
    defaultProps: { text: 'SECTION HEADER', accent: 'default' },
    schema: {
      text: { kind: 'string', label: 'Text' },
      subtitle: { kind: 'string', label: 'Subtitle', optional: true },
      accent: { kind: 'select', label: 'Accent color', optional: true, options: ['default', 'ok', 'warn', 'alarm', 'info'] },
    },
    render: (p) => <HeaderTile text={p.text as string} subtitle={p.subtitle as string | undefined} accent={p.accent as never} />,
  },
];

export const TILE_BY_TYPE: Record<string, TileRegistryEntry> = Object.fromEntries(
  TILE_REGISTRY.map((t) => [t.type, t]),
);

export const TILE_CATEGORIES = ['Visualization', 'Control', 'Info', 'Group', 'Homestead'] as const;
