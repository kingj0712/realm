// Shape of what Home Assistant injects into a panel_custom element.
// Not exhaustive; expand as we touch more of the API.

export interface HassEntity {
  entity_id: string;
  state: string;
  attributes: Record<string, unknown>;
  last_changed: string;
  last_updated: string;
  context: { id: string; user_id: string | null; parent_id: string | null };
}

export interface HassUser {
  id: string;
  name: string;
  is_admin: boolean;
  is_owner: boolean;
}

export interface HassConfig {
  latitude: number;
  longitude: number;
  elevation: number;
  unit_system: { length: string; mass: string; temperature: string; volume: string };
  location_name: string;
  time_zone: string;
  version: string;
}

export interface HassThemes {
  darkMode: boolean;
  theme: string;
  themes: Record<string, unknown>;
}

export interface ServiceTarget {
  entity_id?: string | string[];
  device_id?: string | string[];
  area_id?: string | string[];
}

export interface Hass {
  states: Record<string, HassEntity>;
  user?: HassUser;
  themes?: HassThemes;
  language?: string;
  locale?: { language: string; number_format: string; time_format: string };
  config?: HassConfig;
  callService: (
    domain: string,
    service: string,
    serviceData?: Record<string, unknown>,
    target?: ServiceTarget,
  ) => Promise<unknown>;
  callApi: <T = unknown>(method: string, path: string, parameters?: Record<string, unknown>) => Promise<T>;
  connection: unknown;
}

export interface Route {
  prefix: string;
  path: string;
}

export interface PanelInfo {
  component_name: string;
  config: Record<string, unknown>;
  title: string;
  icon: string;
  url_path: string;
}
