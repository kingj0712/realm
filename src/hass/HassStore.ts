import type { HassEntity, ServiceTarget } from '../types';
import { uid } from './uid';

type EntityListener = (entity: HassEntity | null) => void;
type ServiceHandler = (
  domain: string,
  service: string,
  serviceData?: Record<string, unknown>,
  target?: ServiceTarget,
) => Promise<void> | void;
type HistoryProvider = (entityId: string, points: number) => number[];

function getTargetEntityIds(target?: ServiceTarget): string[] {
  const entityId = target?.entity_id;
  if (Array.isArray(entityId)) return entityId;
  if (typeof entityId === 'string' && entityId) return [entityId];
  return [];
}

// Per-entity pub/sub keyed by entity_id. Designed to back useSyncExternalStore:
// each subscriber gets called when its entity_id changes, so React re-renders
// only the components whose entity actually moved.
export class HassStore {
  private states: Record<string, HassEntity>;
  private listeners = new Map<string, Set<EntityListener>>();
  private serviceHandler: ServiceHandler | null = null;
  private liveServiceHandler: ServiceHandler | null = null;
  private liveEntityIds = new Set<string>();
  private historyProvider: HistoryProvider | null = null;

  constructor(initialStates: Record<string, HassEntity> = {}) {
    this.states = { ...initialStates };
  }

  getEntity(entityId: string): HassEntity | null {
    return this.states[entityId] ?? null;
  }

  getAllEntities(): Record<string, HassEntity> {
    return this.states;
  }

  isLiveEntity(entityId: string): boolean {
    return this.liveEntityIds.has(entityId);
  }

  getEntitySource(entityId: string): 'live' | 'demo' {
    return this.isLiveEntity(entityId) ? 'live' : 'demo';
  }

  // Merge `partial` into the entity and notify subscribers.
  // last_changed only advances when `state` actually changes (matches HA semantics).
  setEntity(entityId: string, partial: Partial<HassEntity>): void {
    const prev = this.states[entityId];
    const now = new Date().toISOString();
    const stateChanged = partial.state != null && partial.state !== prev?.state;
    const next: HassEntity = {
      entity_id: entityId,
      state: partial.state ?? prev?.state ?? 'unknown',
      attributes: { ...(prev?.attributes ?? {}), ...(partial.attributes ?? {}) },
      last_changed: stateChanged ? now : (prev?.last_changed ?? now),
      last_updated: now,
      context: prev?.context ?? { id: uid(), user_id: null, parent_id: null },
    };
    this.states[entityId] = next;
    this.listeners.get(entityId)?.forEach((l) => l(next));
  }

  subscribe(entityId: string, listener: EntityListener): () => void {
    let set = this.listeners.get(entityId);
    if (!set) {
      set = new Set();
      this.listeners.set(entityId, set);
    }
    set.add(listener);
    return () => {
      set?.delete(listener);
      if (set && set.size === 0) this.listeners.delete(entityId);
    };
  }

  setServiceHandler(handler: ServiceHandler): void {
    this.serviceHandler = handler;
  }

  setLiveServiceHandler(handler: ServiceHandler): void {
    this.liveServiceHandler = handler;
  }

  async callService(
    domain: string,
    service: string,
    serviceData?: Record<string, unknown>,
    target?: ServiceTarget,
  ): Promise<void> {
    const targetedIds = getTargetEntityIds(target);
    const shouldUseLive = targetedIds.length > 0 && targetedIds.some((id) => this.isLiveEntity(id));
    const handler = shouldUseLive ? this.liveServiceHandler : this.serviceHandler;
    if (handler) {
      await handler(domain, service, serviceData, target);
    }
  }

  // History (mock: generated; real HA: WebSocket history/statistics call).
  // Components consume via useHistory(entityId).
  setHistoryProvider(provider: HistoryProvider): void {
    this.historyProvider = provider;
  }

  getHistory(entityId: string, points: number = 24): number[] {
    return this.historyProvider?.(entityId, points) ?? [];
  }

  // Bulk update from a real HA `hass.states` snapshot. Live is authoritative,
  // so attributes are replaced (not merged). Entities the live snapshot
  // doesn't include are left untouched — so the mock pool fills gaps. Only
  // listeners whose entity actually changed get notified, so unchanged tiles
  // don't re-render.
  syncFromLive(liveStates: Record<string, HassEntity>): void {
    for (const id of Object.keys(liveStates)) {
      const live = liveStates[id];
      if (!live || !live.state) continue;
      this.liveEntityIds.add(id);
      const prev = this.states[id];
      if (
        prev
        && prev.state === live.state
        && JSON.stringify(prev.attributes) === JSON.stringify(live.attributes)
      ) {
        continue;
      }
      const now = new Date().toISOString();
      this.states[id] = {
        entity_id: id,
        state: live.state,
        attributes: live.attributes ?? {},
        last_changed: live.last_changed ?? prev?.last_changed ?? now,
        last_updated: live.last_updated ?? now,
        context: live.context ?? prev?.context ?? { id: uid(), user_id: null, parent_id: null },
      };
      this.listeners.get(id)?.forEach((l) => l(this.states[id]));
    }
  }
}
