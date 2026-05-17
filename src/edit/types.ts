// Edit-mode schema. Tile configs are JSON-serializable so the whole layout
// can persist to localStorage (or HA frontend.set_user_data later) and be
// re-rendered from config alone.

export interface LayoutItem {
  id: string;
  type: string;
  // iOS-style explicit grid coordinates. (x, y) is the top-left cell; (w, h)
  // is the span in cells. Stored in the "lg" (12-col) layout; RGL handles
  // smaller breakpoints. Maps directly to react-grid-layout's { i, x, y, w, h }.
  x: number;
  y: number;
  w: number;
  h: number;
  // Legacy aliases (still readable from old saved configs during transition,
  // but new code uses w/h above).
  colSpan?: number;
  rowSpan?: number;
  props: Record<string, unknown>;
}

export interface DashboardLayout {
  version: number;
  items: LayoutItem[];
}

export type PropKind =
  | 'entity'
  | 'entity-multi'
  | 'string'
  | 'number'
  | 'boolean'
  | 'icon'
  | 'select'
  | 'json'
  | 'rows';

export interface PropDescriptor {
  kind: PropKind;
  label: string;
  optional?: boolean;
  domains?: string[]; // for entity pickers
  options?: string[]; // for select
  rowKind?: 'area' | 'multi-metric' | 'status-list' | 'irrigation' | 'presence' | 'simple-entities';
  hint?: string;
}

export type PropsSchema = Record<string, PropDescriptor>;

export interface TileMeta {
  type: string;
  name: string;
  category: 'Visualization' | 'Control' | 'Info' | 'Group' | 'Homestead' | 'Misc';
  description: string;
  defaultColSpan: number;
  // Optional. Most tiles render comfortably in 2 grid rows; specify only when
  // the tile needs more (charts, group/list tiles) or less (compact tiles).
  defaultRowSpan?: number;
  defaultProps: Record<string, unknown>;
  schema: PropsSchema;
}

export const COL_SPAN_PRESETS = [
  { label: 'XS', value: 2 },
  { label: 'SM', value: 3 },
  { label: 'MD', value: 4 },
  { label: 'LG', value: 6 },
  { label: 'XL', value: 8 },
  { label: 'FULL', value: 12 },
];

// Heights in 20px row units. Drag the corner resize handle for fine control;
// these are just convenient snap-to-common-size shortcuts.
export const ROW_SPAN_PRESETS = [
  { label: 'XS', value: 3 },   // 60px
  { label: 'SM', value: 5 },   // 100px
  { label: 'MD', value: 7 },   // 140px
  { label: 'LG', value: 10 },  // 200px
  { label: 'XL', value: 14 },  // 280px
];

export const DEFAULT_FALLBACK_ROW_SPAN = 7;  // 140px when defaultRowSpan is unset
