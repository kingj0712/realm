import {
  createContext, useCallback, useContext, useEffect, useMemo, useState,
  type FC, type ReactNode,
} from 'react';
import type { LayoutItem } from './types';
import { TILE_BY_TYPE } from './tileRegistry';
import { welcomeLayout, showcaseLayout } from './sampleLayouts';
import { uid } from '../hass/uid';

const STORAGE_KEY = 'realm:layout:overview';
const SNAPSHOT_KEY = 'realm:layout:snapshots';
// v5: new installs ship with 2 tabs (Welcome + Demo). v4 layouts preserved
// as-is; v3 (single items array) auto-migrates into one tab.
const LAYOUT_VERSION = 5;

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

export interface LayoutSnapshot {
  id: string;
  name: string;
  createdAt: string;
  state: DashboardState;
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
  addTabWithLayout: (name: string, items: LayoutItem[]) => void;
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
  exportLayout: () => string;
  importLayout: (raw: string) => void;
  resetLayout: () => void;
  // Named local snapshots. Independent of the file export/import flow.
  snapshots: LayoutSnapshot[];
  saveSnapshot: (name: string) => LayoutSnapshot;
  restoreSnapshot: (id: string) => void;
  renameSnapshot: (id: string, name: string) => void;
  deleteSnapshot: (id: string) => void;
  exportSnapshot: (id: string) => string | null;
}

const LayoutContext = createContext<LayoutContextValue | null>(null);

function freshDefault(): DashboardState {
  // New install: Welcome (active) + Showcase. User can delete Showcase if
  // they want. Welcome holds first-run instructions; Showcase is a curated
  // polished example (not an exhaustive tile catalog — see /components for
  // that).
  const welcome: Tab = { id: uid(), name: 'Welcome', items: welcomeLayout(), alarmEntities: [] };
  const showcase: Tab = { id: uid(), name: 'Showcase', items: showcaseLayout(), alarmEntities: [] };
  return { version: LAYOUT_VERSION, tabs: [welcome, showcase], activeTabId: welcome.id };
}

function loadState(): DashboardState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<DashboardState> & { items?: LayoutItem[] };
      // v4 and v5 share the same shape; treat v4 as still-valid so existing
      // users don't get wiped when we bump the version.
      if ((parsed.version === 5 || parsed.version === 4) && Array.isArray(parsed.tabs) && typeof parsed.activeTabId === 'string') {
        return { ...parsed, version: LAYOUT_VERSION } as DashboardState;
      }
      // Migrate v3 (single layout) → wrap into one tab
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

function loadSnapshots(): LayoutSnapshot[] {
  try {
    const raw = localStorage.getItem(SNAPSHOT_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    // Light validation. We don't deep-validate state here; restoreSnapshot
    // re-parses on the way out so a corrupt snapshot fails loudly only when
    // the user actually tries to restore it.
    return parsed.filter((s): s is LayoutSnapshot =>
      !!s && typeof s.id === 'string' && typeof s.name === 'string' && typeof s.createdAt === 'string' && !!s.state,
    );
  } catch {
    return [];
  }
}

function saveSnapshots(snapshots: LayoutSnapshot[]): void {
  try {
    localStorage.setItem(SNAPSHOT_KEY, JSON.stringify(snapshots));
  } catch {
    // non-fatal — typically quota exceeded.
  }
}

function isLayoutItem(value: unknown): value is LayoutItem {
  const item = value as LayoutItem;
  return !!item
    && typeof item.id === 'string'
    && typeof item.type === 'string'
    && typeof item.x === 'number'
    && typeof item.y === 'number'
    && typeof item.w === 'number'
    && typeof item.h === 'number'
    && typeof item.props === 'object'
    && item.props !== null;
}

function parseImport(raw: string): DashboardState {
  const parsed = JSON.parse(raw) as Partial<DashboardState>;
  if (!Array.isArray(parsed.tabs) || parsed.tabs.length === 0) {
    throw new Error('Snapshot must include at least one tab.');
  }
  const tabs: Tab[] = parsed.tabs.map((tab, index) => {
    if (!tab || typeof tab.id !== 'string' || typeof tab.name !== 'string' || !Array.isArray(tab.items)) {
      throw new Error(`Tab ${index + 1} is not valid.`);
    }
    if (!tab.items.every(isLayoutItem)) {
      throw new Error(`Tab ${tab.name} contains an invalid tile.`);
    }
    return {
      id: tab.id,
      name: tab.name,
      items: tab.items,
      alarmEntities: Array.isArray(tab.alarmEntities) ? tab.alarmEntities.filter((id): id is string => typeof id === 'string') : [],
    };
  });
  const activeTabId = typeof parsed.activeTabId === 'string' && tabs.some((t) => t.id === parsed.activeTabId)
    ? parsed.activeTabId
    : tabs[0].id;
  return { version: LAYOUT_VERSION, tabs, activeTabId };
}

export const LayoutProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [state, setState] = useState<DashboardState>(() => loadState());
  const [snapshots, setSnapshots] = useState<LayoutSnapshot[]>(() => loadSnapshots());
  const [isEditing, setIsEditing] = useState(false);
  const [selectedTileId, setSelectedTileId] = useState<string | null>(null);

  useEffect(() => { saveState(state); }, [state]);
  useEffect(() => { saveSnapshots(snapshots); }, [snapshots]);

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

  // Create a new tab pre-populated with a sample layout. Used by SampleBrowser.
  const addTabWithLayout = useCallback((name: string, items: LayoutItem[]) => {
    setState((prev) => {
      const t: Tab = { id: uid(), name, items, alarmEntities: [] };
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

  const exportLayout = useCallback(() => JSON.stringify({ ...state, version: LAYOUT_VERSION }, null, 2), [state]);

  const importLayout = useCallback((raw: string) => {
    const next = parseImport(raw);
    setState(next);
    setSelectedTileId(null);
  }, []);

  const resetLayout = useCallback(() => {
    setState(() => freshDefault());
    setSelectedTileId(null);
  }, []);

  // ---- Named snapshots -------------------------------------------------
  const saveSnapshot = useCallback((name: string): LayoutSnapshot => {
    const snapshot: LayoutSnapshot = {
      id: uid(),
      name: name.trim() || `Snapshot ${new Date().toLocaleString()}`,
      createdAt: new Date().toISOString(),
      state: structuredClone(state),
    };
    setSnapshots((prev) => [snapshot, ...prev]);
    return snapshot;
  }, [state]);

  const restoreSnapshot = useCallback((id: string) => {
    setSnapshots((prev) => {
      const snap = prev.find((s) => s.id === id);
      if (snap) {
        // Re-clone so future edits don't mutate the stored snapshot.
        setState({ ...structuredClone(snap.state), version: LAYOUT_VERSION });
        setSelectedTileId(null);
      }
      return prev;
    });
  }, []);

  const renameSnapshot = useCallback((id: string, name: string) => {
    setSnapshots((prev) => prev.map((s) => (s.id === id ? { ...s, name } : s)));
  }, []);

  const deleteSnapshot = useCallback((id: string) => {
    setSnapshots((prev) => prev.filter((s) => s.id !== id));
  }, []);

  const exportSnapshot = useCallback((id: string): string | null => {
    const snap = snapshots.find((s) => s.id === id);
    if (!snap) return null;
    return JSON.stringify({ ...snap.state, version: LAYOUT_VERSION }, null, 2);
  }, [snapshots]);

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
      addTab, addTabWithLayout, renameTab, deleteTab, switchTab,
      addTile, removeTile, duplicateTile, updateTile, reorderTiles,
      setActiveTabAlarmEntities,
      exportLayout,
      importLayout,
      resetLayout,
      snapshots,
      saveSnapshot, restoreSnapshot, renameSnapshot, deleteSnapshot, exportSnapshot,
    }),
    [state.tabs, state.activeTabId, activeTab, isEditing, selectedTileId,
     addTab, addTabWithLayout, renameTab, deleteTab, switchTab,
     addTile, removeTile, duplicateTile, updateTile, reorderTiles,
     setActiveTabAlarmEntities, exportLayout, importLayout, resetLayout,
     snapshots, saveSnapshot, restoreSnapshot, renameSnapshot, deleteSnapshot, exportSnapshot],
  );

  return <LayoutContext.Provider value={value}>{children}</LayoutContext.Provider>;
};

export function useLayout(): LayoutContextValue {
  const ctx = useContext(LayoutContext);
  if (!ctx) throw new Error('useLayout must be used inside a LayoutProvider');
  return ctx;
}
