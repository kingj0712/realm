import type { HassEntity, ServiceTarget } from '../types';
import { uid } from './uid';

type EntityListener = (entity: HassEntity | null) => void;
type ServiceHandler = (
  domain: string,
  service: string,
  serviceData?: Record<string, unknown>,
  target?: ServiceTarget,
) => Promise<void> | void;
type HistoryProvider = (entityId: string, points: number) => number[] | Promise<number[]>;

// Result event surfaced by every callService() round-trip. Subscribers (e.g.
// the global ToastHost) render UI feedback without each tile needing its own
// toast logic. `source` is whichever handler actually ran; `entityIds` is the
// list resolved from the target (may be empty for broadcast services).
export interface ServiceEvent {
  type: 'success' | 'error' | 'no-handler';
  domain: string;
  service: string;
  entityIds: string[];
  source: 'live' | 'demo' | 'none';
  message?: string;
  error?: unknown;
}
type ServiceListener = (event: ServiceEvent) => void;

function getTargetEntityIds(target?: ServiceTarget): string[] {
  const entityId = target?.entity_id;
  if (Array.isArray(entityId)) return entityId;
  if (typeof entityId === 'string' && entityId) return [entityId];
  return [];
}

function historyKey(entityId: string, points: number): string {
  return `${entityId}:${points}`;
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
  private liveHistoryProvider: HistoryProvider | null = null;
  private historyCache = new Map<string, number[]>();
  private serviceListeners = new Set<ServiceListener>();

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

  private clearHistoryCache(entityId: string): void {
    for (const key of this.historyCache.keys()) {
      if (key.startsWith(`${entityId}:`)) this.historyCache.delete(key);
    }
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
    if (stateChanged) this.clearHistoryCache(entityId);
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

  subscribeServiceEvents(listener: ServiceListener): () => void {
    this.serviceListeners.add(listener);
    return () => { this.serviceListeners.delete(listener); };
  }

  private emitServiceEvent(event: ServiceEvent): void {
    this.serviceListeners.forEach((l) => {
      try { l(event); } catch (e) { console.warn('[realm] service listener threw:', e); }
    });
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
    if (!handler) {
      this.emitServiceEvent({
        type: 'no-handler',
        domain, service,
        entityIds: targetedIds,
        source: 'none',
        message: 'No service handler registered',
      });
      return;
    }
    try {
      await handler(domain, service, serviceData, target);
      this.emitServiceEvent({
        type: 'success',
        domain, service,
        entityIds: targetedIds,
        source: shouldUseLive ? 'live' : 'demo',
      });
    } catch (e) {
      this.emitServiceEvent({
        type: 'error',
        domain, service,
        entityIds: targetedIds,
        source: shouldUseLive ? 'live' : 'demo',
        error: e,
        message: e instanceof Error ? e.message : String(e),
      });
      console.warn('[realm] callService failed:', domain, service, e);
    }
  }

  // History (mock: generated; real HA: WebSocket history/statistics call).
  // Components consume via useHistory(entityId).
  setHistoryProvider(provider: HistoryProvider): void {
    this.historyProvider = provider;
    this.historyCache.clear();
  }

  setLiveHistoryProvider(provider: HistoryProvider): void {
    this.liveHistoryProvider = provider;
    this.historyCache.clear();
  }

  getHistory(entityId: string, points: number = 24): number[] {
    const key = historyKey(entityId, points);
    const cached = this.historyCache.get(key);
    if (cached) return cached;
    const provider = this.isLiveEntity(entityId) && this.liveHistoryProvider
      ? this.liveHistoryProvider
      : this.historyProvider;
    const result = provider?.(entityId, points);
    if (Array.isArray(result)) {
      this.historyCache.set(key, result);
      return result;
    }
    return [];
  }

  async loadHistory(entityId: string, points: number = 24): Promise<number[]> {
    const key = historyKey(entityId, points);
    const cached = this.historyCache.get(key);
    if (cached) return cached;
    const provider = this.isLiveEntity(entityId) && this.liveHistoryProvider
      ? this.liveHistoryProvider
      : this.historyProvider;
    const result = await provider?.(entityId, points);
    const history = Array.isArray(result) ? result : [];
    this.historyCache.set(key, history);
    return history;
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
      const stateChanged = live.state !== prev?.state;
      this.states[id] = {
        entity_id: id,
        state: live.state,
        attributes: live.attributes ?? {},
        last_changed: live.last_changed ?? prev?.last_changed ?? now,
        last_updated: live.last_updated ?? now,
        context: live.context ?? prev?.context ?? { id: uid(), user_id: null, parent_id: null },
      };
      if (stateChanged) this.clearHistoryCache(id);
      this.listeners.get(id)?.forEach((l) => l(this.states[id]));
    }
  }
}
