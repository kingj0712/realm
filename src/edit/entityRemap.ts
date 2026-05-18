// Entity remap helpers. Walks a LayoutItem.props tree to find string values
// that look like HA entity IDs, then rebuilds the tree with replacements
// applied. Structured recursion (not regex/string-replace) keeps shape exact
// and avoids touching strings that happen to contain a "domain.object_id"
// substring inside larger sentences.

import type { LayoutItem } from './types';

// HA entity IDs are `<domain>.<object_id>`. Domains are lower snake_case
// letters/underscore (no digits at the start). object_ids allow letters,
// digits, and underscores. We anchor the regex to the entire string — values
// like "Hello sensor.foo!" should NOT be treated as entity IDs.
const ENTITY_ID_RE = /^[a-z_][a-z_]*\.[a-z0-9_]+$/;

export function looksLikeEntityId(value: string): boolean {
  return ENTITY_ID_RE.test(value);
}

// Recursively collect every entity-id-looking string in a value tree. Returns
// duplicates as-is so callers can count usages; de-dupe at the caller.
export function findEntityIds(value: unknown): string[] {
  const found: string[] = [];
  walk(value, (id) => found.push(id));
  return found;
}

function walk(value: unknown, visit: (id: string) => void): void {
  if (typeof value === 'string') {
    if (looksLikeEntityId(value)) visit(value);
    return;
  }
  if (Array.isArray(value)) {
    for (const v of value) walk(v, visit);
    return;
  }
  if (value && typeof value === 'object') {
    for (const v of Object.values(value as Record<string, unknown>)) walk(v, visit);
  }
}

// Replace entity IDs anywhere in a value tree according to `mappings`. Empty
// mapping targets (or targets equal to the source) are treated as no-op.
// Non-string nodes pass through unchanged. The returned tree is a deep copy of
// the input — callers can safely store it without sharing references.
export function replaceEntityIds(value: unknown, mappings: Record<string, string>): unknown {
  if (typeof value === 'string') {
    if (looksLikeEntityId(value)) {
      const target = mappings[value];
      if (target && target !== value) return target;
    }
    return value;
  }
  if (Array.isArray(value)) {
    return value.map((v) => replaceEntityIds(v, mappings));
  }
  if (value && typeof value === 'object') {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      out[k] = replaceEntityIds(v, mappings);
    }
    return out;
  }
  return value;
}

export interface EntityUsage {
  entityId: string;
  count: number;
}

// Tally every entity-id-looking string used across a set of layout items
// (typically the items of the active tab). Sorted by count desc, then id asc.
export function tallyEntityUsage(items: LayoutItem[]): EntityUsage[] {
  const counts = new Map<string, number>();
  for (const item of items) {
    for (const id of findEntityIds(item.props)) {
      counts.set(id, (counts.get(id) ?? 0) + 1);
    }
  }
  return Array.from(counts.entries())
    .map(([entityId, count]) => ({ entityId, count }))
    .sort((a, b) => (b.count - a.count) || a.entityId.localeCompare(b.entityId));
}
