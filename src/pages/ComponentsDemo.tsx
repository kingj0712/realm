import type { FC } from 'react';
import {
  mdiAccount, mdiAccountGroup, mdiAutoFix, mdiBarrel, mdiBatteryHigh, mdiBed, mdiBeehiveOutline,
  mdiBell, mdiBrightness6, mdiCalendarClock, mdiCalendarMonth, mdiCamera, mdiChartBar, mdiChartLine,
  mdiChartTimelineVariant, mdiCheckboxMultipleMarked, mdiClock, mdiCompass, mdiDoor, mdiEngine,
  mdiFan, mdiFire, mdiFlash, mdiFlashTriangle, mdiGarage, mdiGarageOpen, mdiGauge, mdiHome,
  mdiHomeThermometer, mdiLightbulbOn, mdiLockOutline, mdiMailbox, mdiMotionSensor, mdiMusic,
  mdiPalette, mdiPowerPlug, mdiRobotVacuum, mdiServerNetwork, mdiShakerOutline,
  mdiSmokeDetectorVariant, mdiSprinkler, mdiThermometer, mdiTimerOutline, mdiTransmissionTower,
  mdiTrashCan, mdiTrendingUp, mdiWater, mdiWaterAlert, mdiWaterPercent, mdiWaterPump,
  mdiWeatherPartlyCloudy, mdiWeatherPouring, mdiWeatherSunny, mdiWifi, mdiWindowOpen, mdiWrench,
} from '@mdi/js';
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
  ApplianceTile, HomelabTile,
} from '../components/tiles';
import { Icon } from '../components/Icon';

export const ComponentsDemo: FC = () => (
  <div className="page">
    <h1 className="page__title">Components</h1>
    <p className="page__lede">Every tile variant against the mock dataset. Click to interact.</p>

    <section className="demo-section">
      <h2 className="demo-section__title">ClimateThermostatTile (NEW)</h2>
      <p className="demo-section__note">Full thermostat with mode/fan/preset buttons, current+target+humidity. More detail than SetpointTile.</p>
      <div className="demo-grid demo-grid--multi">
        <ClimateThermostatTile entityId="climate.thermostat_main" icon={<Icon path={mdiHomeThermometer} />} />
      </div>
    </section>

    <section className="demo-section">
      <h2 className="demo-section__title">AirPurifierTile (NEW)</h2>
      <p className="demo-section__note">PM1/PM2.5/PM10 + filter life + fan presets. Animated airflow when active.</p>
      <div className="demo-grid demo-grid--multi">
        <AirPurifierTile fanEntityId="fan.living_room_purifier" pm1EntityId="sensor.air_pm1" pm25EntityId="sensor.air_pm25" pm10EntityId="sensor.air_pm10" filterLifeEntityId="sensor.air_filter_life" icon={<Icon path={mdiFan} />} />
      </div>
    </section>

    <section className="demo-section">
      <h2 className="demo-section__title">LightFanTile (NEW)</h2>
      <p className="demo-section__note">Combined ceiling light + fan. Brightness slider, speed selector, direction toggle.</p>
      <div className="demo-grid demo-grid--multi">
        <LightFanTile lightEntityId="light.living_room_dimmer" fanEntityId="fan.ceiling_fan" icon={<Icon path={mdiFan} />} />
      </div>
    </section>

    <section className="demo-section">
      <h2 className="demo-section__title">CurtainTile (NEW)</h2>
      <p className="demo-section__note">Animated curtains that slide open/closed based on cover position.</p>
      <div className="demo-grid">
        <CurtainTile entityId="cover.living_room_curtains" icon={<Icon path={mdiWindowOpen} />} />
      </div>
    </section>

    <section className="demo-section">
      <h2 className="demo-section__title">NASTile (NEW)</h2>
      <p className="demo-section__note">Storage donut + read/write throughput + connected users.</p>
      <div className="demo-grid">
        <NASTile entityId="sensor.nas_storage" icon={<Icon path={mdiServerNetwork} />} />
      </div>
    </section>

    <section className="demo-section">
      <h2 className="demo-section__title">SpeedTestTile / StarlinkTile / UDMTile (NEW)</h2>
      <p className="demo-section__note">Network family. Run-test button, obstruction bar, client count.</p>
      <div className="demo-grid">
        <SpeedTestTile entityId="sensor.speedtest" icon={<Icon path={mdiTrendingUp} />} />
        <StarlinkTile entityId="sensor.starlink" icon={<Icon path={mdiWifi} />} />
        <UDMTile entityId="sensor.udm" icon={<Icon path={mdiServerNetwork} />} />
      </div>
    </section>

    <section className="demo-section">
      <h2 className="demo-section__title">VehicleTile (NEW)</h2>
      <p className="demo-section__note">Car: battery + range + lock/start/climate controls.</p>
      <div className="demo-grid">
        <VehicleTile entityId="sensor.tesla_model3" icon={<Icon path={mdiHome} />} lockEntityId="lock.tesla_model3_lock" climateEntityId="climate.tesla_model3_climate" />
      </div>
    </section>

    <section className="demo-section">
      <h2 className="demo-section__title">LaundryTile (NEW)</h2>
      <p className="demo-section__note">Washer + dryer side-by-side. Drum spins (CSS rotation) when state = running.</p>
      <div className="demo-grid demo-grid--multi">
        <LaundryTile washerEntityId="sensor.washing_machine" dryerEntityId="sensor.dryer" icon={<Icon path={mdiWrench} />} />
      </div>
    </section>

    <section className="demo-section">
      <h2 className="demo-section__title">SankeyTile (NEW)</h2>
      <p className="demo-section__note">Power flow with proportional ribbons between sources and consumers.</p>
      <div className="demo-grid demo-grid--multi">
        <SankeyTile
          icon={<Icon path={mdiTransmissionTower} />}
          sources={[
            { entityId: 'sensor.grid_power', label: 'GRID' },
            { entityId: 'sensor.solar_power', label: 'SOLAR' },
          ]}
          consumers={[
            { entityId: 'sensor.home_consumption', label: 'HOME' },
            { entityId: 'sensor.power_consumption', label: 'CIRCUITS' },
          ]}
        />
      </div>
    </section>

    <section className="demo-section">
      <h2 className="demo-section__title">CountdownTile (NEW)</h2>
      <p className="demo-section__note">D/H/M/S countdown to a target. Optional repeat (daily/weekly/monthly/yearly).</p>
      <div className="demo-grid">
        <CountdownTile entityId="sensor.vacation_countdown" icon={<Icon path={mdiTimerOutline} />} />
      </div>
    </section>

    <section className="demo-section">
      <h2 className="demo-section__title">WeatherRadarTile (NEW)</h2>
      <p className="demo-section__note">Iframe slot for windy.com / rainviewer / etc. Animated radar placeholder when no URL set.</p>
      <div className="demo-grid demo-grid--multi">
        <WeatherRadarTile icon={<Icon path={mdiWeatherPouring} />} />
      </div>
    </section>

    <section className="demo-section">
      <h2 className="demo-section__title">ApplianceTile (NEW)</h2>
      <p className="demo-section__note">Generic appliance — wires to Samsung/SmartThings shaped sensors (cycle, time remaining, temps, door, power).</p>
      <div className="demo-grid">
        <ApplianceTile entityId="sensor.dishwasher" icon={<Icon path={mdiWrench} />} />
        <ApplianceTile entityId="sensor.oven" icon={<Icon path={mdiFire} />} />
        <ApplianceTile entityId="sensor.refrigerator" icon={<Icon path={mdiHome} />} />
        <ApplianceTile entityId="sensor.microwave" icon={<Icon path={mdiWrench} />} />
      </div>
    </section>

    <section className="demo-section">
      <h2 className="demo-section__title">HomelabTile (NEW)</h2>
      <p className="demo-section__note">Multiple homelab hosts in one tile, each with CPU + RAM bars.</p>
      <div className="demo-grid demo-grid--multi">
        <HomelabTile
          icon={<Icon path={mdiServerNetwork} />}
          hosts={[
            { name: 'HA', cpuEntityId: 'sensor.ha_cpu', memoryEntityId: 'sensor.ha_memory' },
            { name: 'NAS', cpuEntityId: 'sensor.nas_cpu', memoryEntityId: 'sensor.nas_memory' },
            { name: 'DOCKER', cpuEntityId: 'sensor.docker_host_cpu', memoryEntityId: 'sensor.docker_host_memory' },
          ]}
        />
      </div>
    </section>

    {/* === Round-4 tiles (the prior 20) === */}

    <section className="demo-section">
      <h2 className="demo-section__title">CalendarTile · TodoListTile · NotificationFeedTile</h2>
      <div className="demo-grid">
        <CalendarTile entityId="calendar.home" icon={<Icon path={mdiCalendarMonth} />} />
        <TodoListTile entityId="todo.house_chores" icon={<Icon path={mdiCheckboxMultipleMarked} />} />
        <NotificationFeedTile entityId="sensor.notifications" icon={<Icon path={mdiBell} />} />
      </div>
    </section>

    <section className="demo-section">
      <h2 className="demo-section__title">PersonTile · PresenceListTile</h2>
      <div className="demo-grid">
        <PersonTile entityId="person.jake" icon={<Icon path={mdiAccount} />} />
        <PersonTile entityId="person.sam" icon={<Icon path={mdiAccount} />} />
        <PresenceListTile icon={<Icon path={mdiAccountGroup} />} personIds={['person.jake', 'person.sam', 'person.guest']} />
      </div>
    </section>

    <section className="demo-section">
      <h2 className="demo-section__title">SceneButtonTile</h2>
      <div className="demo-grid">
        <SceneButtonTile entityId="scene.good_morning" icon={<Icon path={mdiWeatherSunny} />} />
        <SceneButtonTile entityId="scene.movie_night" icon={<Icon path={mdiAutoFix} />} />
        <SceneButtonTile entityId="scene.bedtime" icon={<Icon path={mdiBed} />} />
        <SceneButtonTile entityId="scene.away_mode" icon={<Icon path={mdiLockOutline} />} />
      </div>
    </section>

    <section className="demo-section">
      <h2 className="demo-section__title">WindCompassTile · SunMoonTile</h2>
      <div className="demo-grid">
        <WindCompassTile speedEntityId="sensor.wind_speed" directionEntityId="sensor.wind_direction" icon={<Icon path={mdiCompass} />} />
        <SunMoonTile sunEntityId="sun.sun" moonEntityId="sensor.moon_phase" icon={<Icon path={mdiWeatherSunny} />} />
      </div>
    </section>

    <section className="demo-section">
      <h2 className="demo-section__title">HeatmapTile · HistoryBarsTile · NetworkTile · ServerStatsTile</h2>
      <div className="demo-grid">
        <HeatmapTile entityId="sensor.daily_energy" icon={<Icon path={mdiChartTimelineVariant} />} />
        <HistoryBarsTile entityId="sensor.daily_energy" icon={<Icon path={mdiChartBar} />} attributeKey="history_28d" bars={14} />
        <NetworkTile entityId="sensor.internet_status" icon={<Icon path={mdiWifi} />} />
        <ServerStatsTile icon={<Icon path={mdiServerNetwork} />} cpuEntityId="sensor.ha_cpu" memoryEntityId="sensor.ha_memory" diskEntityId="sensor.ha_disk" />
      </div>
    </section>

    <section className="demo-section">
      <h2 className="demo-section__title">VacuumTile · BeehiveTile · IrrigationTile · TrashScheduleTile · GeneratorTile · MailboxTile</h2>
      <div className="demo-grid">
        <VacuumTile entityId="vacuum.living_room" icon={<Icon path={mdiRobotVacuum} />} />
        <BeehiveTile weightEntityId="sensor.beehive_weight" tempEntityId="sensor.beehive_temp" humidityEntityId="sensor.beehive_humidity" icon={<Icon path={mdiBeehiveOutline} />} />
        <IrrigationTile icon={<Icon path={mdiSprinkler} />} zones={[
          { entityId: 'switch.irrigation_zone_1', label: 'LAWN' },
          { entityId: 'switch.irrigation_zone_2', label: 'GARDEN' },
          { entityId: 'switch.irrigation_zone_3', label: 'BEDS' },
          { entityId: 'switch.irrigation_zone_4', label: 'ORCHARD' },
        ]} />
        <TrashScheduleTile entityId="sensor.trash_pickup" icon={<Icon path={mdiTrashCan} />} />
        <GeneratorTile entityId="sensor.generator" icon={<Icon path={mdiEngine} />} />
        <MailboxTile entityId="sensor.mailbox" icon={<Icon path={mdiMailbox} />} />
      </div>
    </section>

    <section className="demo-section">
      <h2 className="demo-section__title">TimerTile · HVACScheduleTile</h2>
      <div className="demo-grid">
        <TimerTile entityId="timer.oven" icon={<Icon path={mdiTimerOutline} />} />
        <HVACScheduleTile entityId="sensor.hvac_schedule_living_room" icon={<Icon path={mdiCalendarClock} />} />
      </div>
    </section>

    {/* === Original tiles === */}

    <section className="demo-section">
      <h2 className="demo-section__title">EnergyFlowTile</h2>
      <p className="demo-section__note">Animated dashed flow lines toward home. Reversed direction when battery is charging.</p>
      <div className="demo-grid demo-grid--energy">
        <EnergyFlowTile
          icon={<Icon path={mdiFlashTriangle} />}
          gridEntityId="sensor.grid_power"
          solarEntityId="sensor.solar_power"
          batteryEntityId="sensor.battery_power"
          homeEntityId="sensor.home_consumption"
        />
      </div>
    </section>

    <section className="demo-section">
      <h2 className="demo-section__title">WeatherTile</h2>
      <p className="demo-section__note">Current conditions + 3-day forecast strip.</p>
      <div className="demo-grid demo-grid--weather">
        <WeatherTile entityId="weather.home" icon={<Icon path={mdiWeatherPartlyCloudy} />} />
      </div>
    </section>

    <section className="demo-section">
      <h2 className="demo-section__title">PlotTile</h2>
      <p className="demo-section__note">Full chart with Y gridlines, axis labels, line + filled area. Hand-rolled SVG (no chart lib).</p>
      <div className="demo-grid demo-grid--plot">
        <PlotTile
          entityId="sensor.outdoor_temperature"
          icon={<Icon path={mdiChartLine} />}
          precision={1}
          points={60}
          timeRange="60m"
        />
        <PlotTile
          entityId="sensor.power_consumption"
          icon={<Icon path={mdiFlash} />}
          precision={2}
          points={90}
          timeRange="90m"
          thresholds={{ warn: { gt: 4 }, alarm: { gt: 6 } }}
        />
      </div>
    </section>

    <section className="demo-section">
      <h2 className="demo-section__title">CameraTile</h2>
      <p className="demo-section__note">Placeholder viewport with REC overlay and live timestamp. Real wiring: pass entity_picture as snapshotUrl.</p>
      <div className="demo-grid demo-grid--camera">
        <CameraTile entityId="camera.front_porch" icon={<Icon path={mdiCamera} />} />
        <CameraTile entityId="camera.backyard" icon={<Icon path={mdiCamera} />} />
      </div>
    </section>

    <section className="demo-section">
      <h2 className="demo-section__title">MediaPlayerTile</h2>
      <p className="demo-section__note">Track info + progress + transport. Animated equalizer when playing.</p>
      <div className="demo-grid demo-grid--media">
        <MediaPlayerTile entityId="media_player.living_room" icon={<Icon path={mdiMusic} />} />
      </div>
    </section>

    <section className="demo-section">
      <h2 className="demo-section__title">ColorPickerTile</h2>
      <p className="demo-section__note">Hue strip + brightness. Commits rgb_color on release.</p>
      <div className="demo-grid">
        <ColorPickerTile entityId="light.living_room_accent" icon={<Icon path={mdiPalette} />} />
      </div>
    </section>

    <section className="demo-section">
      <h2 className="demo-section__title">AreaListTile</h2>
      <p className="demo-section__note">Multiple entities per row (values, binary indicators, controls).</p>
      <div className="demo-grid demo-grid--multi">
        <AreaListTile
          label="BEDROOMS"
          icon={<Icon path={mdiBed} />}
          rows={[
            {
              label: 'MASTER',
              cells: [
                { type: 'value', entityId: 'sensor.master_bedroom_temp', precision: 0 },
                { type: 'value', entityId: 'sensor.master_bedroom_humidity', precision: 0 },
                { type: 'binary', entityId: 'binary_sensor.master_bedroom_occupancy', icon: <Icon path={mdiMotionSensor} size={14} />, activeStatus: 'info' },
                { type: 'toggle', entityId: 'light.master_bedroom', icon: <Icon path={mdiLightbulbOn} size={14} /> },
              ],
            },
            {
              label: 'KIDS',
              cells: [
                { type: 'value', entityId: 'sensor.kids_bedroom_temp', precision: 0 },
                { type: 'value', entityId: 'sensor.kids_bedroom_humidity', precision: 0 },
                { type: 'binary', entityId: 'binary_sensor.kids_bedroom_occupancy', icon: <Icon path={mdiMotionSensor} size={14} />, activeStatus: 'info' },
                { type: 'toggle', entityId: 'light.kids_bedroom', icon: <Icon path={mdiLightbulbOn} size={14} /> },
              ],
            },
            {
              label: 'GUEST',
              cells: [
                { type: 'value', entityId: 'sensor.guest_bedroom_temp', precision: 0, thresholds: { warn: { lt: 68 } } },
                { type: 'value', entityId: 'sensor.guest_bedroom_humidity', precision: 0 },
                { type: 'binary', entityId: 'binary_sensor.guest_bedroom_occupancy', icon: <Icon path={mdiMotionSensor} size={14} />, activeStatus: 'info' },
                { type: 'toggle', entityId: 'light.guest_bedroom', icon: <Icon path={mdiLightbulbOn} size={14} /> },
              ],
            },
          ]}
        />
      </div>
    </section>

    <section className="demo-section">
      <h2 className="demo-section__title">SliderTile</h2>
      <div className="demo-grid">
        <SliderTile entityId="light.living_room_dimmer" icon={<Icon path={mdiBrightness6} />} />
        <SliderTile entityId="light.kitchen_main" icon={<Icon path={mdiBrightness6} />} />
      </div>
    </section>

    <section className="demo-section">
      <h2 className="demo-section__title">ClockTile</h2>
      <div className="demo-grid">
        <ClockTile icon={<Icon path={mdiClock} />} />
        <ClockTile icon={<Icon path={mdiClock} />} showSeconds hour12 label="LOCAL TIME" />
      </div>
    </section>

    <section className="demo-section">
      <h2 className="demo-section__title">GaugeTile</h2>
      <div className="demo-grid demo-grid--gauge">
        <GaugeTile entityId="sensor.boiler_pressure" icon={<Icon path={mdiGauge} />} precision={1} min={0} max={30} thresholds={{ warn: { gt: 18 }, alarm: { gt: 22 } }} />
        <GaugeTile entityId="sensor.boiler_supply_temp" icon={<Icon path={mdiThermometer} />} precision={0} min={50} max={200} thresholds={{ warn: { gt: 175 } }} />
      </div>
    </section>

    <section className="demo-section">
      <h2 className="demo-section__title">DonutTile</h2>
      <div className="demo-grid demo-grid--gauge">
        <DonutTile entityId="sensor.ups_battery" icon={<Icon path={mdiBatteryHigh} />} />
        <DonutTile entityId="sensor.softener_salt" icon={<Icon path={mdiShakerOutline} />} />
      </div>
    </section>

    <section className="demo-section">
      <h2 className="demo-section__title">TankTile</h2>
      <div className="demo-grid demo-grid--tank">
        <TankTile entityId="sensor.fuel_oil_level" icon={<Icon path={mdiBarrel} />} capacity="275 GAL" />
        <TankTile entityId="sensor.propane_level" icon={<Icon path={mdiBarrel} />} capacity="500 GAL" />
      </div>
    </section>

    <section className="demo-section">
      <h2 className="demo-section__title">SparklineTile</h2>
      <div className="demo-grid">
        <SparklineTile entityId="sensor.outdoor_temperature" icon={<Icon path={mdiThermometer} />} precision={1} />
        <SparklineTile entityId="sensor.power_consumption" icon={<Icon path={mdiFlash} />} precision={2} thresholds={{ warn: { gt: 4 }, alarm: { gt: 6 } }} />
        <SparklineTile entityId="sensor.basement_humidity" icon={<Icon path={mdiWaterPercent} />} precision={0} thresholds={{ warn: { gt: 70 }, alarm: { gt: 85 } }} />
      </div>
    </section>

    <section className="demo-section">
      <h2 className="demo-section__title">MultiMetricTile</h2>
      <div className="demo-grid demo-grid--multi">
        <MultiMetricTile
          label="OIL BOILER" icon={<Icon path={mdiFire} />} status="warn" pill="FIRING" columns={4}
          metrics={[
            { entityId: 'sensor.boiler_supply_temp', label: 'SUPPLY', precision: 1, thresholds: { warn: { gt: 175 } } },
            { entityId: 'sensor.boiler_return_temp', label: 'RETURN', precision: 1 },
            { entityId: 'sensor.boiler_delta_t', label: 'DELTA-T', precision: 1, thresholds: { warn: { lt: 15 } } },
            { entityId: 'sensor.boiler_pressure', label: 'PSI', precision: 1, thresholds: { warn: { gt: 18 }, alarm: { gt: 22 } } },
          ]}
        />
      </div>
    </section>

    <section className="demo-section">
      <h2 className="demo-section__title">StatusListTile</h2>
      <div className="demo-grid">
        <StatusListTile
          label="ENTRY POINTS" icon={<Icon path={mdiDoor} />}
          entries={[
            { entityId: 'binary_sensor.front_door', label: 'FRONT', stateLabels: { on: 'OPEN', off: 'CLOSED' }, activeStatus: 'warn' },
            { entityId: 'binary_sensor.back_door', label: 'BACK', stateLabels: { on: 'OPEN', off: 'CLOSED' }, activeStatus: 'warn' },
            { entityId: 'binary_sensor.patio_door', label: 'PATIO', stateLabels: { on: 'OPEN', off: 'CLOSED' }, activeStatus: 'warn' },
            { entityId: 'binary_sensor.garage_door', label: 'GARAGE', stateLabels: { on: 'OPEN', off: 'CLOSED' }, activeStatus: 'warn' },
          ]}
        />
        <StatusListTile
          label="LIGHTS" icon={<Icon path={mdiLightbulbOn} />}
          entries={[
            { entityId: 'light.kitchen_main', label: 'KITCHEN', activeStatus: 'info' },
            { entityId: 'light.basement_workshop', label: 'WORKSHOP', activeStatus: 'info' },
            { entityId: 'switch.porch_light', label: 'PORCH', activeStatus: 'info' },
          ]}
        />
      </div>
    </section>

    <section className="demo-section">
      <h2 className="demo-section__title">BarTile</h2>
      <div className="demo-grid">
        <BarTile entityId="sensor.sump_pit_level" icon={<Icon path={mdiWater} />} precision={1} min={0} max={20} thresholds={{ warn: { gt: 10 }, alarm: { gt: 16 } }} />
        <BarTile entityId="sensor.basement_humidity" icon={<Icon path={mdiWaterPercent} />} min={0} max={100} thresholds={{ warn: { gt: 70 }, alarm: { gt: 85 } }} />
      </div>
    </section>

    <section className="demo-section">
      <h2 className="demo-section__title">ButtonTile</h2>
      <div className="demo-grid">
        <ButtonTile
          entityId="cover.garage_door" icon={<Icon path={mdiGarage} />} buttonText="OPERATE"
          states={{
            open:    { pill: 'OPEN',    status: 'warn',  buttonText: 'CLOSE' },
            closed:  { pill: 'CLOSED',  status: 'ok',    buttonText: 'OPEN' },
            opening: { pill: 'OPENING', status: 'info',  buttonText: 'STOP' },
            closing: { pill: 'CLOSING', status: 'info',  buttonText: 'STOP' },
          }}
        />
        <ButtonTile
          entityId="light.basement_workshop" icon={<Icon path={mdiLightbulbOn} />} buttonText="TOGGLE"
          states={{ on: { pill: 'ON', status: 'info' }, off: { pill: 'OFF', status: 'idle' } }}
        />
      </div>
    </section>

    <section className="demo-section">
      <h2 className="demo-section__title">StatusTile</h2>
      <div className="demo-grid">
        <StatusTile entityId="binary_sensor.garage_door" icon={<Icon path={mdiGarageOpen} />} states={{ on: { text: 'OPEN', status: 'warn' }, off: { text: 'CLOSED', status: 'ok' } }} />
        <StatusTile entityId="binary_sensor.front_door" icon={<Icon path={mdiDoor} />} states={{ on: { text: 'OPEN', status: 'alarm' }, off: { text: 'CLOSED', status: 'ok' } }} />
        <StatusTile entityId="binary_sensor.basement_motion" icon={<Icon path={mdiMotionSensor} />} states={{ on: { text: 'MOTION', status: 'info' }, off: { text: 'CLEAR', status: 'idle' } }} />
      </div>
    </section>

    <section className="demo-section">
      <h2 className="demo-section__title">ValueTile</h2>
      <div className="demo-grid">
        <ValueTile entityId="sensor.outdoor_temperature" icon={<Icon path={mdiThermometer} />} precision={1} />
        <ValueTile entityId="sensor.fuel_oil_tank" icon={<Icon path={mdiBarrel} />} thresholds={{ warn: { lt: 30 }, alarm: { lt: 15 } }} />
        <ValueTile entityId="sensor.sump_pit_level" icon={<Icon path={mdiWaterPump} />} precision={1} thresholds={{ warn: { gt: 10 }, alarm: { gt: 16 } }} />
        <ValueTile entityId="sensor.basement_humidity" icon={<Icon path={mdiWaterPercent} />} thresholds={{ warn: { gt: 70 }, alarm: { gt: 85 } }} />
      </div>
    </section>

    <section className="demo-section">
      <h2 className="demo-section__title">ToggleTile</h2>
      <div className="demo-grid">
        <ToggleTile entityId="switch.porch_light" icon={<Icon path={mdiPowerPlug} />} />
        <ToggleTile entityId="light.kitchen_main" icon={<Icon path={mdiLightbulbOn} />} />
        <ToggleTile entityId="light.basement_workshop" icon={<Icon path={mdiLightbulbOn} />} />
      </div>
    </section>

    <section className="demo-section">
      <h2 className="demo-section__title">SetpointTile</h2>
      <div className="demo-grid">
        <SetpointTile entityId="climate.living_room" icon={<Icon path={mdiHomeThermometer} />} />
        <SetpointTile entityId="climate.bedroom" icon={<Icon path={mdiHomeThermometer} />} />
      </div>
    </section>

    <section className="demo-section">
      <h2 className="demo-section__title">AlarmTile</h2>
      <div className="demo-grid">
        <AlarmTile entityId="binary_sensor.smoke_basement" icon={<Icon path={mdiSmokeDetectorVariant} />} />
        <AlarmTile entityId="binary_sensor.water_leak_basement" icon={<Icon path={mdiWaterAlert} />} />
        <AlarmTile entityId="binary_sensor.sump_high_water" icon={<Icon path={mdiWaterAlert} />} />
      </div>
    </section>

    <span style={{ display: 'none' }}><Icon path={mdiTransmissionTower} /></span>
  </div>
);
