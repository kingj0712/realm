// Three roles, intentionally distinct:
//   1. welcomeLayout — first-run guidance only, zero entity dependencies.
//      Pure HeaderTiles. New installs land here so the dashboard never opens
//      to a wall of "unavailable" tiles.
//   2. showcaseLayout — curated polished example of what a finished Realm
//      dashboard looks like. ~25 tiles arranged in named sections. Loads as
//      the "Showcase" tab on fresh installs and via the TEMPLATES picker.
//   3. The Components page (`/components`) — exhaustive catalog of every
//      tile variant. NOT this file. Lives in `src/pages/ComponentsDemo.tsx`.
//
// Smart Home Starter and Homestead Ops are middle ground samples that load
// via the TEMPLATES picker only.

import type { LayoutItem } from './types';
import { TILE_BY_TYPE } from './tileRegistry';
import { uid } from '../hass/uid';

interface TileSpec {
  type: string;
  // Explicit grid placement is optional. pack() ignores x/y and lays tiles in
  // reading order; showcaseLayout supplies them so the rhythm is exact.
  x?: number;
  y?: number;
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

// Catalog entry for SampleBrowser. `build` returns fresh LayoutItems each
// call (with fresh uids) so the user can load the same sample twice.
export interface SampleLayout {
  id: string;
  name: string;
  description: string;
  build: () => LayoutItem[];
}

// First-run welcome layout: zero entity dependencies, all HeaderTiles, so a
// brand-new install looks intentional regardless of what HA entities exist.
export function welcomeLayout(): LayoutItem[] {
  return pack([
    { type: 'HeaderTile', w: 12, h: 4, props: {
      text: 'REALM',
      subtitle: 'A custom dashboard for Home Assistant — tiles, tabs, alarms, all yours.',
      accent: 'info',
    } },
    { type: 'HeaderTile', w: 12, h: 2, props: {
      text: 'GET STARTED',
      subtitle: 'Click the pencil in the top-right (or press E) to enter EDIT MODE.',
    } },
    { type: 'HeaderTile', w: 4, h: 5, props: {
      text: '+ ADD TILE',
      subtitle: 'Searchable palette with 60+ widget types — values, gauges, plots, controls, scenes, and more.',
      accent: 'ok',
    } },
    { type: 'HeaderTile', w: 4, h: 5, props: {
      text: 'TEMPLATES',
      subtitle: 'Load a starter layout (Smart Home, Homestead, full Showcase) into a brand-new tab.',
      accent: 'info',
    } },
    { type: 'HeaderTile', w: 4, h: 5, props: {
      text: '+ NEW TAB',
      subtitle: 'Build multiple dashboards. Per-tab alarm chips appear only when something fires.',
      accent: 'warn',
    } },
    { type: 'HeaderTile', w: 12, h: 2, props: {
      text: 'EVERYTHING SAVES AUTOMATICALLY',
      subtitle: 'Hit DONE to exit edit mode. RESET clears just the active tab if you want to start over.',
    } },
  ]);
}

// Smart-home essentials: presence, weather, locks, lights, thermostat, a
// camera. Generic enough to be useful on most installs after a quick
// entity remap.
export function smartHomeStarterLayout(): LayoutItem[] {
  return pack([
    { type: 'HeaderTile', w: 12, h: 2, props: { text: 'HOME', accent: 'info' } },
    { type: 'ClockTile', w: 3 },
    { type: 'WeatherTile', w: 3 },
    { type: 'PresenceListTile', w: 3 },
    { type: 'SunMoonTile', w: 3 },

    { type: 'HeaderTile', w: 12, h: 2, props: { text: 'CLIMATE', accent: 'ok' } },
    { type: 'ClimateThermostatTile', w: 4 },
    { type: 'GaugeTile', w: 4 },
    { type: 'DonutTile', w: 4 },

    { type: 'HeaderTile', w: 12, h: 2, props: { text: 'SECURITY', accent: 'warn' } },
    { type: 'StatusListTile', w: 4 },
    { type: 'CameraTile', w: 4 },
    { type: 'AlarmTile', w: 4 },

    { type: 'HeaderTile', w: 12, h: 2, props: { text: 'LIGHTING & SCENES', accent: 'info' } },
    { type: 'ToggleTile', w: 3 },
    { type: 'SliderTile', w: 3 },
    { type: 'ColorPickerTile', w: 3 },
    { type: 'SceneButtonTile', w: 3 },
  ]);
}

// Property/outdoor-systems flavor: tanks, generator, irrigation, beehive,
// weather radar. Built for the kind of operator who watches systems, not
// just toggles lights.
export function homesteadOpsLayout(): LayoutItem[] {
  return pack([
    { type: 'HeaderTile', w: 12, h: 2, props: { text: 'OPERATIONS', accent: 'info' } },
    { type: 'WeatherTile', w: 3 },
    { type: 'WeatherRadarTile', w: 6 },
    { type: 'WindCompassTile', w: 3 },

    { type: 'HeaderTile', w: 12, h: 2, props: { text: 'POWER & WATER', accent: 'ok' } },
    { type: 'TankTile', w: 3 },
    { type: 'TankTile', w: 3, props: { entityId: 'sensor.propane_level', icon: 'mdiBarrel', capacity: '500 GAL' } },
    { type: 'GeneratorTile', w: 3 },
    { type: 'EnergyFlowTile', w: 3 },

    { type: 'HeaderTile', w: 12, h: 2, props: { text: 'LAND & ANIMALS', accent: 'warn' } },
    { type: 'IrrigationTile', w: 4 },
    { type: 'BeehiveTile', w: 4 },
    { type: 'MailboxTile', w: 4 },

    { type: 'HeaderTile', w: 12, h: 2, props: { text: 'TRENDS', accent: 'info' } },
    { type: 'PlotTile', w: 6 },
    { type: 'HistoryBarsTile', w: 6 },
  ]);
}

// Showcase layout: curated, polished example of what a finished Realm
// dashboard looks like. Not exhaustive. Sectioned with HeaderTiles, packed
// tightly so it looks intentional out of the box at 1440p/2560p. The
// Components page (`/components`) remains the exhaustive catalog of every
// tile variant — this layout deliberately picks the ~25 most representative
// tiles and skips one-offs.
//
// Layout uses explicit x/y/w/h (not pack()) because the rhythm matters too
// much to leave to row-wrapping. Heights cluster per section so tiles align
// horizontally inside each band.
export function showcaseLayout(): LayoutItem[] {
  const tiles = (): TileSpec[] => [
    // ===== Section 1: Environment =====
    H('ENVIRONMENT', 'info', 0, 0),
    T('WeatherTile', 0, 2, 6, 9),
    T('PresenceListTile', 6, 2, 3, 9, { label: 'PRESENCE', icon: 'mdiAccountGroup', personIds: ['person.user_1', 'person.user_2', 'person.guest'] }),
    T('NotificationFeedTile', 9, 2, 3, 9),
    // Sub-row of compact environment readings — consistent h=5 keeps the band tight.
    T('SunMoonTile', 0, 11, 3, 7),
    T('WindCompassTile', 3, 11, 3, 7),
    T('ValueTile', 6, 11, 3, 5, { entityId: 'sensor.outdoor_temperature', precision: 0, icon: 'mdiThermometer', label: 'OUTDOOR TEMP' }),
    T('ValueTile', 9, 11, 3, 5, { entityId: 'sensor.outdoor_humidity', precision: 0, icon: 'mdiWaterPercent', label: 'HUMIDITY' }),
    T('ClockTile', 6, 16, 6, 2),

    // ===== Section 2: House Status =====
    H('HOUSE STATUS', 'warn', 0, 18),
    T('StatusListTile', 0, 20, 4, 7, {
      label: 'ENTRY POINTS', icon: 'mdiDoor',
      entries: [
        { entityId: 'binary_sensor.front_door',  label: 'FRONT',  stateLabels: { on: 'OPEN', off: 'CLOSED' }, activeStatus: 'warn' },
        { entityId: 'binary_sensor.back_door',   label: 'BACK',   stateLabels: { on: 'OPEN', off: 'CLOSED' }, activeStatus: 'warn' },
        { entityId: 'binary_sensor.patio_door',  label: 'PATIO',  stateLabels: { on: 'OPEN', off: 'CLOSED' }, activeStatus: 'warn' },
        { entityId: 'binary_sensor.garage_door', label: 'GARAGE', stateLabels: { on: 'OPEN', off: 'CLOSED' }, activeStatus: 'warn' },
      ],
    }),
    T('AlarmTile', 4, 20, 2, 7, { entityId: 'binary_sensor.water_leak_basement', icon: 'mdiWaterAlert', label: 'WATER LEAK' }),
    T('AlarmTile', 6, 20, 2, 7, { entityId: 'binary_sensor.sump_high_water', icon: 'mdiWaterAlert', label: 'SUMP HIGH' }),
    T('MailboxTile', 8, 20, 2, 7),
    T('TrashScheduleTile', 10, 20, 2, 7),

    // ===== Section 3: Energy =====
    H('ENERGY', 'ok', 0, 27),
    T('EnergyFlowTile', 0, 29, 6, 10),
    T('SankeyTile', 6, 29, 6, 10),
    T('TankTile', 0, 39, 3, 9),
    T('TankTile', 3, 39, 3, 9, { entityId: 'sensor.propane_level', icon: 'mdiBarrel', capacity: '500 GAL' }),
    T('GaugeTile', 6, 39, 3, 9),
    T('DonutTile', 9, 39, 3, 9),

    // ===== Section 4: Comfort =====
    H('COMFORT', 'info', 0, 48),
    T('ClimateThermostatTile', 0, 50, 4, 10),
    T('AirPurifierTile', 4, 50, 4, 10),
    T('LightFanTile', 8, 50, 4, 10),

    // ===== Section 5: Security =====
    H('SECURITY', 'warn', 0, 60),
    T('CameraTile', 0, 62, 4, 9, { entityId: 'camera.front_porch', icon: 'mdiCamera' }),
    T('CameraTile', 4, 62, 4, 9, { entityId: 'camera.backyard', icon: 'mdiCamera' }),
    T('ButtonTile', 8, 62, 2, 9, {
      entityId: 'cover.garage_door', icon: 'mdiGarage', buttonText: 'OPERATE',
      states: { open: { pill: 'OPEN', status: 'warn', buttonText: 'CLOSE' }, closed: { pill: 'CLOSED', status: 'ok', buttonText: 'OPEN' } },
      confirmBeforeAction: true,
      confirmMessage: 'Operate the garage door?',
    }),
    T('BlindsTile', 10, 62, 2, 9),

    // ===== Section 6: Systems =====
    H('SYSTEMS', 'info', 0, 71),
    T('NetworkTile', 0, 73, 3, 5),
    T('SpeedTestTile', 3, 73, 3, 5),
    T('NASTile', 6, 73, 3, 5),
    T('HomelabTile', 9, 73, 3, 5),

    // ===== Section 7: Household =====
    H('HOUSEHOLD', 'ok', 0, 78),
    T('LaundryTile', 0, 80, 4, 9),
    T('VehicleTile', 4, 80, 4, 9),
    T('CalendarTile', 8, 80, 4, 9),

    // ===== Section 8: Homestead =====
    H('HOMESTEAD', 'info', 0, 89),
    T('WeeklyDigestTile', 0, 91, 4, 10),
    T('BeehiveTile', 4, 91, 4, 10),
    T('GeneratorTile', 8, 91, 4, 10),
  ];

  return tiles().map((spec) => buildItem(spec));
}

// ---- Internal helpers used only by showcaseLayout -----------------------

// Section header — full width, short h=2 band. accent maps to HeaderTile prop.
function H(text: string, accent: string, x: number, y: number): TileSpec {
  return { type: 'HeaderTile', x, y, w: 12, h: 2, props: { text, accent } };
}

// Curated tile spec with explicit grid placement. props merge over registry defaults.
function T(type: string, x: number, y: number, w: number, h: number, props?: Record<string, unknown>): TileSpec {
  return { type, x, y, w, h, props };
}

// TileSpec → LayoutItem with registry defaults merged in. Caller supplies x/y/w/h.
function buildItem(spec: TileSpec): LayoutItem {
  const meta = TILE_BY_TYPE[spec.type];
  const w = spec.w ?? meta?.defaultColSpan ?? 3;
  const h = spec.h ?? meta?.defaultRowSpan ?? 7;
  return {
    id: uid(),
    type: spec.type,
    x: spec.x ?? 0,
    y: spec.y ?? 0,
    w,
    h,
    props: { ...(meta?.defaultProps ?? {}), ...(spec.props ?? {}) },
  };
}

export const SAMPLE_LAYOUTS: SampleLayout[] = [
  {
    id: 'welcome',
    name: 'Welcome',
    description: 'First-run intro screen. Zero entity dependencies — pure instruction tiles. Re-add any time you want a reminder of what each control does.',
    build: welcomeLayout,
  },
  {
    id: 'smart-home',
    name: 'Smart Home Starter',
    description: 'Essentials only: presence, weather, climate, security, lights, scenes. A good base to fork from for a typical install.',
    build: smartHomeStarterLayout,
  },
  {
    id: 'homestead',
    name: 'Homestead Ops',
    description: 'Property-systems flavor: tanks, generator, irrigation, beehive, weather radar, trend plots.',
    build: homesteadOpsLayout,
  },
  {
    id: 'showcase',
    name: 'Showcase',
    description: 'Curated polished dashboard example — Environment / House Status / Energy / Comfort / Security / Systems / Household / Homestead. ~25 tiles, sectioned and aligned. The /components page is the exhaustive tile catalog.',
    build: showcaseLayout,
  },
];
