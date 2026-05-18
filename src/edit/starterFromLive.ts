import type { HassStore } from '../hass/HassStore';
import type { LayoutItem } from './types';
import { uid } from '../hass/uid';

// Scan a HassStore for live entities by domain and propose a starter set of
// tiles. Pure builder — does not mutate state; the caller decides whether to
// keep, edit, or discard the suggestion. Designed to be conservative: pick
// representative entities, not all of them.

const MAX_PER_DOMAIN: Record<string, number> = {
  weather: 1,
  climate: 2,
  light: 4,
  switch: 4,
  cover: 3,
  camera: 2,
  sensor: 6,
  binary_sensor: 4,
  person: 4,
};

const STARTER_DOMAINS = Object.keys(MAX_PER_DOMAIN);

export interface StarterSuggestion {
  domain: string;
  entityId: string;
  tileType: string;
  description: string;
}

// Decide which tile type best represents a live entity. Numeric sensors get
// ValueTile; binary sensors get StatusTile; etc. Always biased toward the
// most general tile so suggestions stay reliable.
function pickTileType(entityId: string, store: HassStore): { type: string; rowSpan: number; colSpan: number } | null {
  const domain = entityId.split('.')[0];
  const entity = store.getEntity(entityId);
  if (!entity) return null;
  if (domain === 'weather') return { type: 'WeatherTile', rowSpan: 7, colSpan: 4 };
  if (domain === 'climate') return { type: 'SetpointTile', rowSpan: 4, colSpan: 3 };
  if (domain === 'light') return { type: 'ToggleTile', rowSpan: 4, colSpan: 3 };
  if (domain === 'switch') return { type: 'ToggleTile', rowSpan: 4, colSpan: 3 };
  if (domain === 'cover') return { type: 'ButtonTile', rowSpan: 4, colSpan: 3 };
  if (domain === 'camera') return { type: 'CameraTile', rowSpan: 7, colSpan: 4 };
  if (domain === 'person') return { type: 'PersonTile', rowSpan: 4, colSpan: 3 };
  if (domain === 'binary_sensor') return { type: 'StatusTile', rowSpan: 4, colSpan: 3 };
  if (domain === 'sensor') {
    const isNumeric = Number.isFinite(parseFloat(entity.state));
    return isNumeric
      ? { type: 'ValueTile', rowSpan: 4, colSpan: 3 }
      : { type: 'StatusTile', rowSpan: 4, colSpan: 3 };
  }
  return null;
}

export function scanStarterEntities(store: HassStore): StarterSuggestion[] {
  const all = Object.keys(store.getAllEntities()).filter((id) => store.isLiveEntity(id)).sort();
  const byDomain = new Map<string, string[]>();
  for (const id of all) {
    const dom = id.split('.')[0];
    if (!STARTER_DOMAINS.includes(dom)) continue;
    const arr = byDomain.get(dom) ?? [];
    arr.push(id);
    byDomain.set(dom, arr);
  }
  const suggestions: StarterSuggestion[] = [];
  for (const dom of STARTER_DOMAINS) {
    const ids = byDomain.get(dom) ?? [];
    const limit = MAX_PER_DOMAIN[dom] ?? 0;
    for (const id of ids.slice(0, limit)) {
      const pick = pickTileType(id, store);
      if (!pick) continue;
      suggestions.push({
        domain: dom,
        entityId: id,
        tileType: pick.type,
        description: (store.getEntity(id)?.attributes?.friendly_name as string | undefined) ?? id,
      });
    }
  }
  return suggestions;
}

// Lay suggestions out in a tidy grid. Each row gets up to 4 LG-column tiles
// (12 cols / 3 each). Larger tiles (camera, weather) take col=4. Y increments
// based on the tallest tile in the row.
export function buildStarterLayout(
  suggestions: StarterSuggestion[],
  store: HassStore,
): LayoutItem[] {
  const items: LayoutItem[] = [];
  let x = 0;
  let y = 0;
  let rowMaxH = 0;
  for (const s of suggestions) {
    const pick = pickTileType(s.entityId, store);
    if (!pick) continue;
    const { type, rowSpan, colSpan } = pick;
    if (x + colSpan > 12) {
      y += rowMaxH;
      x = 0;
      rowMaxH = 0;
    }
    items.push({
      id: uid(),
      type,
      x, y,
      w: colSpan,
      h: rowSpan,
      props: defaultPropsFor(type, s.entityId, store),
    });
    x += colSpan;
    if (rowSpan > rowMaxH) rowMaxH = rowSpan;
  }
  return items;
}

function defaultPropsFor(type: string, entityId: string, store: HassStore): Record<string, unknown> {
  // Keep this aligned with tileRegistry defaultProps for the tile types we
  // emit. We only need the entity binding for the v1 starter; users will
  // tweak the rest in Inspector.
  switch (type) {
    case 'WeatherTile': return { entityId };
    case 'CameraTile': return { entityId };
    case 'PersonTile': return { entityId };
    case 'SetpointTile': return { entityId };
    case 'ToggleTile': return { entityId };
    case 'StatusTile': return { entityId };
    case 'ButtonTile': {
      const friendly = store.getEntity(entityId)?.attributes?.friendly_name as string | undefined;
      return { entityId, buttonText: friendly ? 'OPERATE' : 'TOGGLE' };
    }
    case 'ValueTile': {
      const entity = store.getEntity(entityId);
      const precision = entity && Number.isFinite(parseFloat(entity.state)) ? 1 : undefined;
      return precision != null ? { entityId, precision } : { entityId };
    }
    default: return { entityId };
  }
}
