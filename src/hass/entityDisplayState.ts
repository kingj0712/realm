import type { HassEntity } from '../types';
import type { HassStore } from './HassStore';

export type EntityDisplayKind =
  | 'live-ok'      // entity exists, state is a meaningful value
  | 'live-unavailable' // real HA entity in `unavailable`/`unknown` state
  | 'unmapped'     // entity id refers to nothing (demo placeholder or typo)
  | 'no-id';       // tile has no entityId configured at all

export interface EntityDisplayState {
  kind: EntityDisplayKind;
  // Short uppercase pill text suitable for BaseTile's `pill` slot.
  pill: string;
  // Plain-text body fallback for tiles that just need "what to render".
  text: string;
  source: 'live' | 'demo' | 'none';
}

const UNAVAILABLE_STATES = new Set(['unavailable', 'unknown']);

// Centralized "missing entity" classifier. Tiles call this when they don't
// have a numeric/usable state to render so the UX is consistent: live HA
// entities in `unavailable` look different from demo placeholders the user
// hasn't remapped yet, and from blank/typo entity IDs.
export function getEntityDisplayState(
  entityId: string | null | undefined,
  entity: HassEntity | null,
  store: HassStore,
): EntityDisplayState {
  if (!entityId) {
    return { kind: 'no-id', pill: 'NO ENTITY', text: '—', source: 'none' };
  }
  if (!entity) {
    // No entity at all in the store — either the user removed it from HA or
    // the demo placeholder doesn't exist. Treat as unmapped so they know to
    // hit REMAP in edit mode.
    return { kind: 'unmapped', pill: 'UNMAPPED', text: 'unmapped', source: 'none' };
  }
  if (UNAVAILABLE_STATES.has(entity.state)) {
    const source = store.getEntitySource(entityId);
    return {
      kind: 'live-unavailable',
      pill: 'UNAVAILABLE',
      text: 'unavailable',
      source,
    };
  }
  return {
    kind: 'live-ok',
    pill: entity.state.toUpperCase(),
    text: entity.state,
    source: store.getEntitySource(entityId),
  };
}
