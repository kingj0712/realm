import { useSyncExternalStore } from 'react';
import { useHass } from './HassProvider';
import type { HassEntity } from '../types';

// Subscribe to a single entity. Only re-renders the calling component when
// THIS entity changes, never on every hass state update.
export function useEntity(entityId: string): HassEntity | null {
  const store = useHass();
  return useSyncExternalStore(
    (cb) => store.subscribe(entityId, cb),
    () => store.getEntity(entityId),
  );
}
