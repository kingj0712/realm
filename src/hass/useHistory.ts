import { useMemo } from 'react';
import { useHass } from './HassProvider';
import { useEntity } from './useEntity';

// Returns N most-recent numeric history points for an entity.
// Re-evaluates when entity.last_changed advances (a state event), so the
// sparkline can refresh on updates without polling.
export function useHistory(entityId: string, points: number = 24): number[] {
  const store = useHass();
  const entity = useEntity(entityId);
  const lastChanged = entity?.last_changed;
  return useMemo(
    () => store.getHistory(entityId, points),
    [store, entityId, points, lastChanged],
  );
}
