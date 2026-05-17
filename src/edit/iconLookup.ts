import {
  mdiAccount, mdiAccountGroup, mdiAlarmLight, mdiAutoFix, mdiBarrel, mdiBatteryHigh, mdiBed,
  mdiBeehiveOutline, mdiBell, mdiBrightness6, mdiCalendarMonth, mdiCalendarClock, mdiCamera,
  mdiChartBar, mdiChartLine, mdiChartTimelineVariant, mdiCheckboxMultipleMarked, mdiClock,
  mdiCompass, mdiCounter, mdiDoor, mdiDoorOpen, mdiEngine, mdiFan, mdiFire, mdiFlash,
  mdiFlashTriangle, mdiGarage, mdiGarageOpen, mdiGauge, mdiHome, mdiHomeThermometer,
  mdiLightbulbOn, mdiLockOutline, mdiMailbox, mdiMotionSensor, mdiMusic, mdiPalette,
  mdiPaw, mdiPowerPlug, mdiRobotVacuum, mdiServerNetwork, mdiShakerOutline,
  mdiSmokeDetectorVariant, mdiSprinkler, mdiThermometer, mdiTimerOutline, mdiToolbox,
  mdiTransmissionTower, mdiTrashCan, mdiTrendingUp, mdiViewDashboard, mdiWater, mdiWaterAlert,
  mdiWaterPercent, mdiWaterPump, mdiWeatherCloudy, mdiWeatherFog, mdiWeatherLightning,
  mdiWeatherPartlyCloudy, mdiWeatherPouring, mdiWeatherSnowy, mdiWeatherSunny, mdiWeatherWindy,
  mdiWifi, mdiWindowOpen, mdiWrench,
} from '@mdi/js';

// Curated icon library. Edit-mode picker shows these as a searchable grid.
// Extend freely; tile configs reference icons by NAME (string) for serialization.
export const ICON_LIBRARY: Record<string, string> = {
  mdiAccount, mdiAccountGroup, mdiAlarmLight, mdiAutoFix, mdiBarrel, mdiBatteryHigh, mdiBed,
  mdiBeehiveOutline, mdiBell, mdiBrightness6, mdiCalendarMonth, mdiCalendarClock, mdiCamera,
  mdiChartBar, mdiChartLine, mdiChartTimelineVariant, mdiCheckboxMultipleMarked, mdiClock,
  mdiCompass, mdiCounter, mdiDoor, mdiDoorOpen, mdiEngine, mdiFan, mdiFire, mdiFlash,
  mdiFlashTriangle, mdiGarage, mdiGarageOpen, mdiGauge, mdiHome, mdiHomeThermometer,
  mdiLightbulbOn, mdiLockOutline, mdiMailbox, mdiMotionSensor, mdiMusic, mdiPalette,
  mdiPaw, mdiPowerPlug, mdiRobotVacuum, mdiServerNetwork, mdiShakerOutline,
  mdiSmokeDetectorVariant, mdiSprinkler, mdiThermometer, mdiTimerOutline, mdiToolbox,
  mdiTransmissionTower, mdiTrashCan, mdiTrendingUp, mdiViewDashboard, mdiWater, mdiWaterAlert,
  mdiWaterPercent, mdiWaterPump, mdiWeatherCloudy, mdiWeatherFog, mdiWeatherLightning,
  mdiWeatherPartlyCloudy, mdiWeatherPouring, mdiWeatherSnowy, mdiWeatherSunny, mdiWeatherWindy,
  mdiWifi, mdiWindowOpen, mdiWrench,
};

export function resolveIcon(name: string | undefined | null): string | null {
  if (!name) return null;
  return ICON_LIBRARY[name] ?? null;
}

export const ICON_NAMES = Object.keys(ICON_LIBRARY).sort();
