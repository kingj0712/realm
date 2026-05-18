import { useEffect, useState } from 'react';
import { useHass } from './HassProvider';
import { useEntity } from './useEntity';

// Returns N most-recent numeric history points for an entity.
// Re-evaluates when entity.last_changed advances (a state event), so the
// sparkline can refresh on updates without polling.
export function useHistory(entityId: string, points: number = 24): number[] {
  const store = useHass();
  const entity = useEntity(entityId);
  const lastChanged = entity?.last_changed;
  const [history, setHistory] = useState<number[]>(() => store.getHistory(entityId, points));

  useEffect(() => {
    let cancelled = false;
    setHistory(store.getHistory(entityId, points));
    store.loadHistory(entityId, points).then((next) => {
      if (!cancelled) setHistory(next);
    });
    return () => { cancelled = true; };
  }, [store, entityId, points, lastChanged]);

  return history;
}
