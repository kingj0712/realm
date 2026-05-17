import {
  createContext, useCallback, useContext, useEffect, useMemo, useState,
  type FC, type ReactNode,
} from 'react';
import type { LayoutItem } from './types';
import { TILE_BY_TYPE } from './tileRegistry';
import { defaultOverviewLayout } from './defaultLayouts';
import { uid } from '../hass/uid';

const STORAGE_KEY = 'realm:layout:overview';
// v4: multi-tab system + per-tab alarm-entity list. v3 layouts auto-migrate
// into the first tab.
const LAYOUT_VERSION = 4;

export interface Tab {
  id: string;
  name: string;
  items: LayoutItem[];
  alarmEntities?: string[];
}

interface DashboardState {
  version: number;
  tabs: Tab[];
  activeTabId: string;
}

interface LayoutContextValue {
  tabs: Tab[];
  activeTabId: string;
  activeTab: Tab;
  isEditing: boolean;
  selectedTileId: string | null;
  setEditing: (v: boolean) => void;
  selectTile: (id: string | null) => void;
  // Tab management
  addTab: (name?: string) => void;
  renameTab: (id: string, name: string) => void;
  deleteTab: (id: string) => void;
  switchTab: (id: string) => void;
  // Tile operations (act on the active tab)
  addTile: (type: string) => void;
  removeTile: (id: string) => void;
  duplicateTile: (id: string) => void;
  updateTile: (id: string, patch: Partial<LayoutItem> | ((it: LayoutItem) => LayoutItem)) => void;
  reorderTiles: (orderedIds: string[]) => void;
  setActiveTabAlarmEntities: (entities: string[]) => void;
  resetLayout: () => void;
}

const LayoutContext = createContext<LayoutContextValue | null>(null);

function freshDefault(): DashboardState {
  const t: Tab = { id: uid(), name: 'Overview', items: defaultOverviewLayout(), alarmEntities: [] };
  return { version: LAYOUT_VERSION, tabs: [t], activeTabId: t.id };
}

function loadState(): DashboardState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<DashboardState> & { items?: LayoutItem[] };
      if (parsed.version === LAYOUT_VERSION && Array.isArray(parsed.tabs) && typeof parsed.activeTabId === 'string') {
        return parsed as DashboardState;
      }
      // Migrate v3 (single layout) → v4 (one-tab wrap)
      if (parsed.version === 3 && Array.isArray(parsed.items)) {
        const t: Tab = { id: uid(), name: 'Overview', items: parsed.items, alarmEntities: [] };
        return { version: LAYOUT_VERSION, tabs: [t], activeTabId: t.id };
      }
    }
  } catch {
    // fall through
  }
  return freshDefault();
}

function saveState(state: DashboardState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // non-fatal
  }
}

export const LayoutProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [state, setState] = useState<DashboardState>(() => loadState());
  const [isEditing, setIsEditing] = useState(false);
  const [selectedTileId, setSelectedTileId] = useState<string | null>(null);

  useEffect(() => { saveState(state); }, [state]);

  // Helper: update items of the active tab via a transformer.
  const updateActiveItems = useCallback(
    (transform: (items: LayoutItem[]) => LayoutItem[]) => {
      setState((prev) => ({
        ...prev,
        tabs: prev.tabs.map((t) =>
          t.id === prev.activeTabId ? { ...t, items: transform(t.items) } : t,
        ),
      }));
    },
    [],
  );

  // ---- Tab management --------------------------------------------------
  const addTab = useCallback((name?: string) => {
    setState((prev) => {
      const t: Tab = { id: uid(), name: name ?? `Tab ${prev.tabs.length + 1}`, items: [], alarmEntities: [] };
      return { ...prev, tabs: [...prev.tabs, t], activeTabId: t.id };
    });
    setSelectedTileId(null);
  }, []);

  const renameTab = useCallback((id: string, name: string) => {
    setState((prev) => ({
      ...prev,
      tabs: prev.tabs.map((t) => (t.id === id ? { ...t, name } : t)),
    }));
  }, []);

  const deleteTab = useCallback((id: string) => {
    setState((prev) => {
      if (prev.tabs.length <= 1) return prev; // keep at least one tab
      const remaining = prev.tabs.filter((t) => t.id !== id);
      const activeTabId = prev.activeTabId === id ? remaining[0].id : prev.activeTabId;
      return { ...prev, tabs: remaining, activeTabId };
    });
    setSelectedTileId(null);
  }, []);

  const switchTab = useCallback((id: string) => {
    setState((prev) => ({ ...prev, activeTabId: id }));
    setSelectedTileId(null);
  }, []);

  // ---- Tile operations -------------------------------------------------
  const addTile = useCallback((type: string) => {
    const meta = TILE_BY_TYPE[type];
    if (!meta) return;
    const newId = uid();
    updateActiveItems((items) => {
      const maxY = items.reduce((acc, it) => Math.max(acc, it.y + it.h), 0);
      const item: LayoutItem = {
        id: newId, type, x: 0, y: maxY,
        w: meta.defaultColSpan, h: meta.defaultRowSpan ?? 7,
        props: { ...meta.defaultProps },
      };
      return [...items, item];
    });
    setSelectedTileId(newId);
  }, [updateActiveItems]);

  const removeTile = useCallback((id: string) => {
    updateActiveItems((items) => items.filter((i) => i.id !== id));
    setSelectedTileId((prev) => (prev === id ? null : prev));
  }, [updateActiveItems]);

  const duplicateTile = useCallback((id: string) => {
    const newId = uid();
    updateActiveItems((items) => {
      const src = items.find((i) => i.id === id);
      if (!src) return items;
      // Place duplicate to the right of the source if there's room, otherwise below.
      const copy: LayoutItem = {
        ...src,
        id: newId,
        x: src.x + src.w <= 12 - src.w ? src.x + src.w : 0,
        y: src.x + src.w <= 12 - src.w ? src.y : src.y + src.h,
        props: structuredClone(src.props),
      };
      return [...items, copy];
    });
    setSelectedTileId(newId);
  }, [updateActiveItems]);

  const updateTile = useCallback(
    (id: string, patch: Partial<LayoutItem> | ((it: LayoutItem) => LayoutItem)) => {
      updateActiveItems((items) =>
        items.map((it) => {
          if (it.id !== id) return it;
          return typeof patch === 'function' ? patch(it) : { ...it, ...patch };
        }),
      );
    },
    [updateActiveItems],
  );

  const reorderTiles = useCallback((orderedIds: string[]) => {
    updateActiveItems((items) => {
      const byId = new Map(items.map((it) => [it.id, it]));
      return orderedIds.map((id) => byId.get(id)).filter((x): x is LayoutItem => !!x);
    });
  }, [updateActiveItems]);

  const setActiveTabAlarmEntities = useCallback((entities: string[]) => {
    setState((prev) => ({
      ...prev,
      tabs: prev.tabs.map((t) => (t.id === prev.activeTabId ? { ...t, alarmEntities: entities } : t)),
    }));
  }, []);

  const resetLayout = useCallback(() => {
    setState(() => freshDefault());
    setSelectedTileId(null);
  }, []);

  const activeTab = useMemo(
    () => state.tabs.find((t) => t.id === state.activeTabId) ?? state.tabs[0],
    [state.tabs, state.activeTabId],
  );

  const value = useMemo<LayoutContextValue>(
    () => ({
      tabs: state.tabs,
      activeTabId: state.activeTabId,
      activeTab,
      isEditing,
      selectedTileId,
      setEditing: setIsEditing,
      selectTile: setSelectedTileId,
      addTab, renameTab, deleteTab, switchTab,
      addTile, removeTile, duplicateTile, updateTile, reorderTiles,
      setActiveTabAlarmEntities,
      resetLayout,
    }),
    [state.tabs, state.activeTabId, activeTab, isEditing, selectedTileId,
     addTab, renameTab, deleteTab, switchTab, addTile, removeTile, duplicateTile,
     updateTile, reorderTiles, setActiveTabAlarmEntities, resetLayout],
  );

  return <LayoutContext.Provider value={value}>{children}</LayoutContext.Provider>;
};

export function useLayout(): LayoutContextValue {
  const ctx = useContext(LayoutContext);
  if (!ctx) throw new Error('useLayout must be used inside a LayoutProvider');
  return ctx;
}
