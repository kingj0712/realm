// Mock data for offline development and demo. Many entity IDs and friendly
// names reflect the author's own setup as concrete examples — replace with
// your own entities or wire to a real HassStore (see phase-6+ TODO in WIKI.md).
import type { HassEntity } from '../types';
import { HassStore } from './HassStore';
import { uid } from './uid';

function ent(
  entity_id: string,
  state: string,
  attributes: Record<string, unknown> = {},
): HassEntity {
  const now = new Date().toISOString();
  return {
    entity_id,
    state,
    attributes,
    last_changed: now,
    last_updated: now,
    context: { id: uid(), user_id: null, parent_id: null },
  };
}

const initialStates: Record<string, HassEntity> = {
  // -- existing entities (unchanged) ----------------------------------------
  'binary_sensor.garage_door': ent('binary_sensor.garage_door', 'off', { friendly_name: 'Garage Door', device_class: 'garage_door' }),
  'binary_sensor.front_door': ent('binary_sensor.front_door', 'on', { friendly_name: 'Front Door', device_class: 'door' }),
  'binary_sensor.back_door': ent('binary_sensor.back_door', 'off', { friendly_name: 'Back Door', device_class: 'door' }),
  'binary_sensor.patio_door': ent('binary_sensor.patio_door', 'on', { friendly_name: 'Patio Door', device_class: 'door' }),
  'binary_sensor.basement_motion': ent('binary_sensor.basement_motion', 'off', { friendly_name: 'Basement Motion', device_class: 'motion' }),
  'sensor.outdoor_temperature': ent('sensor.outdoor_temperature', '54.3', { friendly_name: 'Outdoor Temp', unit_of_measurement: '°F', device_class: 'temperature' }),
  'sensor.fuel_oil_tank': ent('sensor.fuel_oil_tank', '47', { friendly_name: 'Oil Tank', unit_of_measurement: '%' }),
  'sensor.sump_pit_level': ent('sensor.sump_pit_level', '12.4', { friendly_name: 'Sump Pit Level', unit_of_measurement: 'in' }),
  'sensor.basement_humidity': ent('sensor.basement_humidity', '78', { friendly_name: 'Basement Humidity', unit_of_measurement: '%', device_class: 'humidity' }),
  'switch.porch_light': ent('switch.porch_light', 'off', { friendly_name: 'Porch Light' }),
  'light.kitchen_main': ent('light.kitchen_main', 'on', { friendly_name: 'Kitchen Main', brightness: 220 }),
  'light.basement_workshop': ent('light.basement_workshop', 'off', { friendly_name: 'Workshop' }),
  'light.living_room_dimmer': ent('light.living_room_dimmer', 'on', { friendly_name: 'Living Room', brightness: 128, supported_features: 33 }),
  'light.living_room_accent': ent('light.living_room_accent', 'on', { friendly_name: 'Accent Light', brightness: 200, rgb_color: [255, 128, 64], supported_color_modes: ['rgb'] }),
  'cover.garage_door': ent('cover.garage_door', 'closed', { friendly_name: 'Garage Door', device_class: 'garage', current_position: 0, supported_features: 11 }),
  'sensor.fuel_oil_level': ent('sensor.fuel_oil_level', '47', { friendly_name: 'Fuel Oil', unit_of_measurement: '%', capacity_gal: 275 }),
  'sensor.propane_level': ent('sensor.propane_level', '18', { friendly_name: 'Propane', unit_of_measurement: '%', capacity_gal: 500 }),
  'sensor.ups_battery': ent('sensor.ups_battery', '87', { friendly_name: 'UPS Battery', unit_of_measurement: '%', device_class: 'battery' }),
  'sensor.softener_salt': ent('sensor.softener_salt', '22', { friendly_name: 'Softener Salt', unit_of_measurement: '%' }),
  'sensor.boiler_pressure': ent('sensor.boiler_pressure', '14.2', { friendly_name: 'Boiler PSI', unit_of_measurement: 'PSI' }),
  'sensor.boiler_supply_temp': ent('sensor.boiler_supply_temp', '162.4', { friendly_name: 'Supply Temp', unit_of_measurement: '°F', device_class: 'temperature' }),
  'sensor.boiler_return_temp': ent('sensor.boiler_return_temp', '148.7', { friendly_name: 'Return Temp', unit_of_measurement: '°F', device_class: 'temperature' }),
  'sensor.boiler_delta_t': ent('sensor.boiler_delta_t', '13.7', { friendly_name: 'Delta-T', unit_of_measurement: '°F' }),
  'sensor.power_consumption': ent('sensor.power_consumption', '2.4', { friendly_name: 'Power Draw', unit_of_measurement: 'kW', device_class: 'power' }),
  'climate.living_room': ent('climate.living_room', 'heat', { friendly_name: 'Living Room', current_temperature: 68, temperature: 70, hvac_modes: ['off', 'heat', 'cool', 'auto'], min_temp: 50, max_temp: 85, target_temp_step: 1, unit_of_measurement: '°F' }),
  'climate.bedroom': ent('climate.bedroom', 'cool', { friendly_name: 'Bedroom', current_temperature: 73, temperature: 68, hvac_modes: ['off', 'heat', 'cool', 'auto'], min_temp: 50, max_temp: 85, target_temp_step: 1, unit_of_measurement: '°F' }),
  'binary_sensor.smoke_basement': ent('binary_sensor.smoke_basement', 'off', { friendly_name: 'Basement Smoke', device_class: 'smoke' }),
  'binary_sensor.water_leak_basement': ent('binary_sensor.water_leak_basement', 'on', { friendly_name: 'Basement Water Leak', device_class: 'moisture' }),
  'binary_sensor.sump_high_water': ent('binary_sensor.sump_high_water', 'on', { friendly_name: 'Sump High Water', device_class: 'moisture' }),
  'sensor.master_bedroom_temp': ent('sensor.master_bedroom_temp', '72', { friendly_name: 'Master Temp', unit_of_measurement: '°F', device_class: 'temperature' }),
  'sensor.master_bedroom_humidity': ent('sensor.master_bedroom_humidity', '45', { friendly_name: 'Master Humidity', unit_of_measurement: '%', device_class: 'humidity' }),
  'binary_sensor.master_bedroom_occupancy': ent('binary_sensor.master_bedroom_occupancy', 'on', { friendly_name: 'Master Occupancy', device_class: 'occupancy' }),
  'light.master_bedroom': ent('light.master_bedroom', 'on', { friendly_name: 'Master Light', brightness: 180 }),
  'sensor.kids_bedroom_temp': ent('sensor.kids_bedroom_temp', '70', { friendly_name: 'Kids Temp', unit_of_measurement: '°F', device_class: 'temperature' }),
  'sensor.kids_bedroom_humidity': ent('sensor.kids_bedroom_humidity', '52', { friendly_name: 'Kids Humidity', unit_of_measurement: '%', device_class: 'humidity' }),
  'binary_sensor.kids_bedroom_occupancy': ent('binary_sensor.kids_bedroom_occupancy', 'off', { friendly_name: 'Kids Occupancy', device_class: 'occupancy' }),
  'light.kids_bedroom': ent('light.kids_bedroom', 'off', { friendly_name: 'Kids Light' }),
  'sensor.guest_bedroom_temp': ent('sensor.guest_bedroom_temp', '67', { friendly_name: 'Guest Temp', unit_of_measurement: '°F', device_class: 'temperature' }),
  'sensor.guest_bedroom_humidity': ent('sensor.guest_bedroom_humidity', '48', { friendly_name: 'Guest Humidity', unit_of_measurement: '%', device_class: 'humidity' }),
  'binary_sensor.guest_bedroom_occupancy': ent('binary_sensor.guest_bedroom_occupancy', 'off', { friendly_name: 'Guest Occupancy', device_class: 'occupancy' }),
  'light.guest_bedroom': ent('light.guest_bedroom', 'off', { friendly_name: 'Guest Light' }),
  'weather.home': ent('weather.home', 'partlycloudy', {
    friendly_name: 'Home Weather', temperature: 54, temperature_unit: '°F', humidity: 62, pressure: 30.1, wind_speed: 8, wind_bearing: 270,
    forecast: [
      { datetime: '2026-05-15T12:00:00', condition: 'cloudy', temperature: 58, templow: 42 },
      { datetime: '2026-05-16T12:00:00', condition: 'rainy', temperature: 55, templow: 41 },
      { datetime: '2026-05-17T12:00:00', condition: 'sunny', temperature: 64, templow: 46 },
    ],
  }),
  'camera.front_porch': ent('camera.front_porch', 'idle', { friendly_name: 'Front Porch', entity_picture: null }),
  'camera.backyard': ent('camera.backyard', 'recording', { friendly_name: 'Backyard', entity_picture: null }),
  'sensor.grid_power': ent('sensor.grid_power', '1.8', { friendly_name: 'Grid', unit_of_measurement: 'kW', device_class: 'power' }),
  'sensor.solar_power': ent('sensor.solar_power', '3.2', { friendly_name: 'Solar', unit_of_measurement: 'kW', device_class: 'power' }),
  'sensor.battery_power': ent('sensor.battery_power', '-0.5', { friendly_name: 'Battery', unit_of_measurement: 'kW', device_class: 'power' }),
  'sensor.home_consumption': ent('sensor.home_consumption', '4.5', { friendly_name: 'Home', unit_of_measurement: 'kW', device_class: 'power' }),
  'media_player.living_room': ent('media_player.living_room', 'playing', { friendly_name: 'Living Room', media_title: 'Time', media_artist: 'Pink Floyd', media_album_name: 'The Dark Side of the Moon', media_duration: 412, media_position: 158, entity_picture: null, supported_features: 152431 }),

  // -- new entities for the 20-tile expansion -------------------------------
  // CalendarTile
  'calendar.home': ent('calendar.home', 'on', {
    friendly_name: 'Home Calendar',
    all_events: [
      { start: '2026-05-14T15:00:00', end: '2026-05-14T16:00:00', summary: 'Dentist' },
      { start: '2026-05-15T09:00:00', end: '2026-05-15T10:00:00', summary: 'Stand-up' },
      { start: '2026-05-16T14:00:00', end: '2026-05-16T17:00:00', summary: 'Yard work' },
      { start: '2026-05-18T19:00:00', end: '2026-05-18T21:00:00', summary: 'Dinner with User 2' },
    ],
  }),

  // TodoListTile
  'todo.house_chores': ent('todo.house_chores', '4', {
    friendly_name: 'House Chores',
    items: [
      { uid: '1', summary: 'Take out trash', status: 'needs_action' },
      { uid: '2', summary: 'Mow lawn', status: 'needs_action' },
      { uid: '3', summary: 'Replace furnace filter', status: 'completed' },
      { uid: '4', summary: 'Order propane', status: 'needs_action' },
      { uid: '5', summary: 'Check trail cameras', status: 'completed' },
    ],
  }),

  // Person / PresenceList
  'person.user_1': ent('person.user_1', 'home', { friendly_name: 'User 1', source: 'device_tracker.user_1_phone', gps_accuracy: 12, entity_picture: null }),
  'person.user_2': ent('person.user_2', 'away', { friendly_name: 'User 2', source: 'device_tracker.user_2_phone', gps_accuracy: 25, entity_picture: null }),
  'person.guest': ent('person.guest', 'not_home', { friendly_name: 'Guest', source: 'device_tracker.guest_phone', gps_accuracy: 0, entity_picture: null }),

  // Scenes
  'scene.movie_night': ent('scene.movie_night', 'unknown', { friendly_name: 'Movie Night' }),
  'scene.good_morning': ent('scene.good_morning', 'unknown', { friendly_name: 'Good Morning' }),
  'scene.bedtime': ent('scene.bedtime', 'unknown', { friendly_name: 'Bedtime' }),
  'scene.away_mode': ent('scene.away_mode', 'unknown', { friendly_name: 'Away Mode' }),

  // Notifications
  'sensor.notifications': ent('sensor.notifications', '5', {
    friendly_name: 'Notifications',
    items: [
      { time: '2026-05-14T10:30:00', level: 'info', text: 'Garage door opened' },
      { time: '2026-05-14T10:15:00', level: 'warn', text: 'Sump high water alarm' },
      { time: '2026-05-14T09:45:00', level: 'info', text: 'Front door unlocked' },
      { time: '2026-05-14T08:20:00', level: 'alarm', text: 'Basement water leak' },
      { time: '2026-05-14T07:00:00', level: 'info', text: 'Good Morning scene activated' },
    ],
  }),

  // Wind
  'sensor.wind_speed': ent('sensor.wind_speed', '8.4', { friendly_name: 'Wind Speed', unit_of_measurement: 'mph' }),
  'sensor.wind_direction': ent('sensor.wind_direction', '247', { friendly_name: 'Wind Direction', unit_of_measurement: '°' }),

  // Sun / Moon
  'sun.sun': ent('sun.sun', 'above_horizon', {
    next_dawn: '2026-05-15T05:30:00',
    next_dusk: '2026-05-14T20:15:00',
    next_midnight: '2026-05-15T00:30:00',
    next_noon: '2026-05-14T12:45:00',
    next_rising: '2026-05-15T06:00:00',
    next_setting: '2026-05-14T20:30:00',
    elevation: 42,
    azimuth: 220,
  }),
  'sensor.moon_phase': ent('sensor.moon_phase', 'waxing_gibbous', { friendly_name: 'Moon' }),

  // Heatmap source: 28 days of daily energy
  'sensor.daily_energy': ent('sensor.daily_energy', '38.2', {
    friendly_name: 'Daily Energy',
    unit_of_measurement: 'kWh',
    history_28d: [22, 27, 31, 28, 24, 35, 41, 38, 29, 26, 30, 33, 36, 42, 45, 39, 32, 28, 25, 27, 31, 34, 38, 41, 36, 30, 33, 38],
  }),

  // Network
  'sensor.internet_status': ent('sensor.internet_status', 'online', { friendly_name: 'Internet', download_mbps: 940, upload_mbps: 38, ping_ms: 14 }),

  // Server stats
  'sensor.ha_cpu': ent('sensor.ha_cpu', '23.4', { friendly_name: 'HA CPU', unit_of_measurement: '%' }),
  'sensor.ha_memory': ent('sensor.ha_memory', '58.7', { friendly_name: 'HA Memory', unit_of_measurement: '%' }),
  'sensor.ha_disk': ent('sensor.ha_disk', '34.2', { friendly_name: 'HA Disk', unit_of_measurement: '%' }),

  // Vacuum
  'vacuum.living_room': ent('vacuum.living_room', 'docked', { friendly_name: 'Roomba', battery_level: 87, fan_speed: 'auto', supported_features: 12347 }),

  // Beehive
  'sensor.beehive_weight': ent('sensor.beehive_weight', '47.3', { friendly_name: 'Hive 1 Weight', unit_of_measurement: 'lb' }),
  'sensor.beehive_temp': ent('sensor.beehive_temp', '92', { friendly_name: 'Hive 1 Temp', unit_of_measurement: '°F' }),
  'sensor.beehive_humidity': ent('sensor.beehive_humidity', '58', { friendly_name: 'Hive 1 Humidity', unit_of_measurement: '%' }),

  // Irrigation zones
  'switch.irrigation_zone_1': ent('switch.irrigation_zone_1', 'off', { friendly_name: 'Lawn Front' }),
  'switch.irrigation_zone_2': ent('switch.irrigation_zone_2', 'on',  { friendly_name: 'Garden' }),
  'switch.irrigation_zone_3': ent('switch.irrigation_zone_3', 'off', { friendly_name: 'Beds' }),
  'switch.irrigation_zone_4': ent('switch.irrigation_zone_4', 'off', { friendly_name: 'Orchard' }),

  // Trash schedule
  'sensor.trash_pickup': ent('sensor.trash_pickup', '2', { friendly_name: 'Trash Pickup', next_date: '2026-05-16', next_type: 'recycling', days_until: 2 }),

  // Generator
  'sensor.generator': ent('sensor.generator', 'standby', { friendly_name: 'Generac', fuel_level: 78, last_run: '2026-05-10T14:20:00', runtime_hours: 42.5 }),

  // Mailbox
  'sensor.mailbox': ent('sensor.mailbox', '3', { friendly_name: 'Mailbox', packages: 2, mail: 1, last_delivery: '2026-05-14T11:30:00' }),

  // Timer
  'timer.oven': ent('timer.oven', 'active', { friendly_name: 'Oven Timer', duration: '01:30:00', remaining: '00:24:18', finishes_at: '2026-05-14T13:45:00' }),
  'timer.irrigation': ent('timer.irrigation', 'idle', { friendly_name: 'Irrigation', duration: '00:30:00', remaining: '00:00:00' }),

  // HVAC schedule (custom: setpoints by hour 0-23)
  'sensor.hvac_schedule_living_room': ent('sensor.hvac_schedule_living_room', 'active', {
    friendly_name: 'Living Room Schedule',
    schedule: [
      62, 62, 62, 62, 62, 62, 68, 70, 70, 68, 68, 68,
      68, 68, 68, 68, 68, 70, 72, 72, 70, 68, 66, 64,
    ],
    current_hour: 13,
  }),

  // ---- new in round 5 -----------------------------------------------------

  // ClimateThermostatTile (richer climate entity)
  'climate.thermostat_main': ent('climate.thermostat_main', 'heat', {
    friendly_name: 'Main Thermostat',
    current_temperature: 68.5,
    temperature: 70,
    hvac_modes: ['off', 'heat', 'cool', 'auto', 'heat_cool'],
    hvac_action: 'heating',
    fan_modes: ['auto', 'on', 'circulate'],
    fan_mode: 'auto',
    preset_modes: ['none', 'eco', 'comfort', 'away', 'sleep'],
    preset_mode: 'comfort',
    current_humidity: 42,
    unit_of_measurement: '°F',
    min_temp: 50, max_temp: 90, target_temp_step: 1,
  }),

  // AirPurifierTile
  'fan.living_room_purifier': ent('fan.living_room_purifier', 'on', {
    friendly_name: 'Air Purifier', percentage: 50,
    preset_modes: ['auto', 'sleep', 'turbo'], preset_mode: 'auto',
  }),
  'sensor.air_pm1':  ent('sensor.air_pm1',  '4',  { friendly_name: 'PM1',   unit_of_measurement: 'µg/m³' }),
  'sensor.air_pm25': ent('sensor.air_pm25', '12', { friendly_name: 'PM2.5', unit_of_measurement: 'µg/m³' }),
  'sensor.air_pm10': ent('sensor.air_pm10', '18', { friendly_name: 'PM10',  unit_of_measurement: 'µg/m³' }),
  'sensor.air_filter_life': ent('sensor.air_filter_life', '67', { friendly_name: 'Filter Life', unit_of_measurement: '%' }),

  // LightFanTile
  'fan.ceiling_fan': ent('fan.ceiling_fan', 'on', {
    friendly_name: 'Ceiling Fan', percentage: 50, direction: 'forward',
    preset_modes: ['breeze', 'whoosh'], preset_mode: null,
  }),

  // CurtainTile
  'cover.living_room_curtains': ent('cover.living_room_curtains', 'open', {
    friendly_name: 'Living Curtains', device_class: 'curtain', current_position: 80, supported_features: 15,
  }),

  // BlindsTile
  'cover.bedroom_blinds': ent('cover.bedroom_blinds', 'open', {
    friendly_name: 'Bedroom Blinds', device_class: 'blind', current_position: 60, supported_features: 15,
  }),

  // NASTile
  'sensor.nas_storage': ent('sensor.nas_storage', '42', {
    friendly_name: 'NAS Storage', unit_of_measurement: '%',
    total_tb: 24, used_tb: 10.1, read_mbps: 12.4, write_mbps: 5.7, connected_users: 3,
  }),

  // SpeedTestTile
  'sensor.speedtest': ent('sensor.speedtest', 'idle', {
    friendly_name: 'Speedtest', download: 942.1, upload: 35.8, ping: 16, last_run: '2026-05-14T11:00:00',
  }),

  // StarlinkTile
  'sensor.starlink': ent('sensor.starlink', 'online', {
    friendly_name: 'Starlink', download_mbps: 187, upload_mbps: 18, ping_ms: 38, obstruction_pct: 1.2, uptime_pct: 99.4,
  }),

  // UDMTile
  'sensor.udm': ent('sensor.udm', 'online', {
    friendly_name: 'UDM Pro', wan_status: 'connected', clients_count: 28, download_mbps: 124, upload_mbps: 8, uptime_days: 42,
  }),

  // VehicleTile
  'sensor.tesla_model3': ent('sensor.tesla_model3', 'parked', {
    friendly_name: 'Model 3', battery_level: 67, range_miles: 192, locked: true, climate_on: false, charging: false,
  }),
  'lock.tesla_model3_lock': ent('lock.tesla_model3_lock', 'locked', { friendly_name: 'Tesla Lock' }),
  'climate.tesla_model3_climate': ent('climate.tesla_model3_climate', 'off', { friendly_name: 'Tesla Climate' }),

  // LaundryTile
  'sensor.washing_machine': ent('sensor.washing_machine', 'running', { friendly_name: 'Washer', cycle: 'Heavy Duty', time_remaining: '0:48' }),
  'sensor.dryer': ent('sensor.dryer', 'idle', { friendly_name: 'Dryer', cycle: '—', time_remaining: '0:00' }),

  // CountdownTile
  'sensor.vacation_countdown': ent('sensor.vacation_countdown', '23', {
    friendly_name: 'Vacation', target_iso: '2026-06-06T00:00:00', repeat: 'none',
  }),

  // ApplianceTile (Samsung-ish via SmartThings)
  'sensor.dishwasher':   ent('sensor.dishwasher',   'running',     { friendly_name: 'Dishwasher',   cycle: 'Normal',  time_remaining: '0:32', power_w: 1400 }),
  'sensor.oven':         ent('sensor.oven',         'preheating',  { friendly_name: 'Oven',         current_temp: 387, target_temp: 425, unit: '°F', power_w: 2400 }),
  'sensor.microwave':    ent('sensor.microwave',    'idle',        { friendly_name: 'Microwave',    cycle: '—',       time_remaining: '0:00' }),
  'sensor.stovetop':     ent('sensor.stovetop',     'on',          { friendly_name: 'Stovetop',     power_w: 1800 }),
  'sensor.refrigerator': ent('sensor.refrigerator', 'cooling',     { friendly_name: 'Refrigerator', fridge_temp: 38, freezer_temp: 0, unit: '°F', door_open: false, power_w: 110 }),

  // HomelabTile hosts
  'sensor.nas_cpu':         ent('sensor.nas_cpu',         '12.3', { friendly_name: 'NAS CPU',    unit_of_measurement: '%' }),
  'sensor.nas_memory':      ent('sensor.nas_memory',      '64.1', { friendly_name: 'NAS RAM',    unit_of_measurement: '%' }),
  'sensor.docker_host_cpu': ent('sensor.docker_host_cpu', '38.4', { friendly_name: 'Docker CPU', unit_of_measurement: '%' }),
  'sensor.docker_host_memory': ent('sensor.docker_host_memory', '47.2', { friendly_name: 'Docker RAM', unit_of_measurement: '%' }),
};

function toArray(v: string | string[] | undefined): string[] {
  if (!v) return [];
  return Array.isArray(v) ? v : [v];
}

function fakeHistory(currentValue: number, totalPoints: number): number[] {
  const stepVariance = Math.max(Math.abs(currentValue) * 0.05, 0.5);
  let val = currentValue + (Math.random() - 0.5) * stepVariance * 8;
  const result: number[] = [];
  for (let i = 0; i < totalPoints - 1; i++) {
    val += (Math.random() - 0.5) * stepVariance;
    result.push(val);
  }
  result.push(currentValue);
  return result;
}

export function createMockStore(): HassStore {
  const store = new HassStore(initialStates);

  store.setServiceHandler((domain, service, serviceData, target) => {
    const ids = toArray(target?.entity_id);
    if (!ids.length) return;

    for (const id of ids) {
      const cur = store.getEntity(id);
      if (!cur) continue;

      const key = `${domain}.${service}`;
      switch (key) {
        case 'switch.turn_on':
          store.setEntity(id, { state: 'on' });
          break;
        case 'switch.turn_off':
          store.setEntity(id, { state: 'off' });
          break;
        case 'light.turn_on': {
          const attrs: Record<string, unknown> = { ...cur.attributes };
          const brightPct = serviceData?.brightness_pct;
          const brightAbs = serviceData?.brightness;
          const rgb = serviceData?.rgb_color;
          if (typeof brightPct === 'number') attrs.brightness = Math.round((brightPct / 100) * 255);
          else if (typeof brightAbs === 'number') attrs.brightness = brightAbs;
          if (Array.isArray(rgb) && rgb.length === 3) attrs.rgb_color = rgb;
          store.setEntity(id, { state: 'on', attributes: attrs });
          break;
        }
        case 'light.turn_off':
          store.setEntity(id, { state: 'off' });
          break;
        case 'switch.toggle':
        case 'light.toggle':
        case 'homeassistant.toggle':
          store.setEntity(id, { state: cur.state === 'on' ? 'off' : 'on' });
          break;
        case 'climate.set_temperature': {
          const t = serviceData?.temperature;
          if (typeof t === 'number') store.setEntity(id, { attributes: { ...cur.attributes, temperature: t } });
          break;
        }
        case 'climate.set_hvac_mode': {
          const m = serviceData?.hvac_mode;
          if (typeof m === 'string') store.setEntity(id, { state: m });
          break;
        }
        case 'climate.set_fan_mode': {
          const m = serviceData?.fan_mode;
          if (typeof m === 'string') store.setEntity(id, { attributes: { ...cur.attributes, fan_mode: m } });
          break;
        }
        case 'climate.set_preset_mode': {
          const m = serviceData?.preset_mode;
          if (typeof m === 'string') store.setEntity(id, { attributes: { ...cur.attributes, preset_mode: m } });
          break;
        }
        case 'climate.turn_on':
          store.setEntity(id, { state: 'heat' });
          break;
        case 'climate.turn_off':
          store.setEntity(id, { state: 'off' });
          break;
        case 'fan.turn_on': {
          const attrs: Record<string, unknown> = { ...cur.attributes };
          const pct = serviceData?.percentage;
          const preset = serviceData?.preset_mode;
          if (typeof pct === 'number') attrs.percentage = pct;
          if (typeof preset === 'string') attrs.preset_mode = preset;
          store.setEntity(id, { state: 'on', attributes: attrs });
          break;
        }
        case 'fan.turn_off':
          store.setEntity(id, { state: 'off' });
          break;
        case 'fan.set_percentage': {
          const pct = serviceData?.percentage;
          if (typeof pct === 'number') {
            store.setEntity(id, { state: pct > 0 ? 'on' : 'off', attributes: { ...cur.attributes, percentage: pct } });
          }
          break;
        }
        case 'fan.set_preset_mode': {
          const preset = serviceData?.preset_mode;
          if (typeof preset === 'string') store.setEntity(id, { state: 'on', attributes: { ...cur.attributes, preset_mode: preset } });
          break;
        }
        case 'fan.set_direction': {
          const dir = serviceData?.direction;
          if (typeof dir === 'string') store.setEntity(id, { attributes: { ...cur.attributes, direction: dir } });
          break;
        }
        case 'lock.lock':
          store.setEntity(id, { state: 'locked' });
          break;
        case 'lock.unlock':
          store.setEntity(id, { state: 'unlocked' });
          break;
        case 'cover.set_cover_position': {
          const pos = serviceData?.position;
          if (typeof pos === 'number') {
            store.setEntity(id, { state: pos > 0 ? 'open' : 'closed', attributes: { ...cur.attributes, current_position: pos } });
          }
          break;
        }
        case 'button.press':
          store.setEntity(id, { attributes: { ...cur.attributes } });
          break;
        case 'cover.open_cover':
          store.setEntity(id, { state: 'open', attributes: { ...cur.attributes, current_position: 100 } });
          break;
        case 'cover.close_cover':
          store.setEntity(id, { state: 'closed', attributes: { ...cur.attributes, current_position: 0 } });
          break;
        case 'cover.toggle': {
          const opening = cur.state !== 'open';
          store.setEntity(id, { state: opening ? 'open' : 'closed', attributes: { ...cur.attributes, current_position: opening ? 100 : 0 } });
          break;
        }
        case 'media_player.media_play':
          store.setEntity(id, { state: 'playing' });
          break;
        case 'media_player.media_pause':
          store.setEntity(id, { state: 'paused' });
          break;
        case 'media_player.media_play_pause':
          store.setEntity(id, { state: cur.state === 'playing' ? 'paused' : 'playing' });
          break;
        case 'media_player.media_stop':
          store.setEntity(id, { state: 'idle' });
          break;
        case 'media_player.media_next_track':
        case 'media_player.media_previous_track':
          store.setEntity(id, { attributes: { ...cur.attributes } });
          break;
        case 'scene.turn_on':
          // Briefly flash last_changed so subscribers re-render
          store.setEntity(id, { attributes: { ...cur.attributes } });
          break;
        case 'todo.update_item': {
          const uidArg = serviceData?.item;
          const status = serviceData?.status;
          if (typeof uidArg === 'string' && typeof status === 'string') {
            const items = (cur.attributes.items as Array<Record<string, unknown>> | undefined) ?? [];
            const next = items.map((it) => (it.uid === uidArg ? { ...it, status } : it));
            const remaining = next.filter((it) => it.status !== 'completed').length;
            store.setEntity(id, { state: String(remaining), attributes: { ...cur.attributes, items: next } });
          }
          break;
        }
        case 'vacuum.start':
          store.setEntity(id, { state: 'cleaning' });
          break;
        case 'vacuum.return_to_base':
          store.setEntity(id, { state: 'returning' });
          break;
        case 'vacuum.stop':
          store.setEntity(id, { state: 'idle' });
          break;
        case 'timer.start':
          store.setEntity(id, { state: 'active' });
          break;
        case 'timer.pause':
          store.setEntity(id, { state: 'paused' });
          break;
        case 'timer.cancel':
          store.setEntity(id, { state: 'idle' });
          break;
        default:
          break;
      }
    }
  });

  const historyCache = new Map<string, number[]>();
  store.setHistoryProvider((entityId, points) => {
    let h = historyCache.get(entityId);
    if (!h) {
      const entity = store.getEntity(entityId);
      if (!entity) return [];
      const cur = parseFloat(entity.state);
      if (!Number.isFinite(cur)) return [];
      h = fakeHistory(cur, Math.max(points, 120));
      historyCache.set(entityId, h);
    }
    return h.slice(-points);
  });

  return store;
}
