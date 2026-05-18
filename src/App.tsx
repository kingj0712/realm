import { useMemo, type FC } from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import { HassProvider, createMockStore, type HassStore } from './hass';
import { LayoutProvider } from './edit';
import { Shell } from './components/Shell';
import { ToastHost } from './components/ToastHost';
import { Overview } from './pages/Overview';
import { ComponentsDemo } from './pages/ComponentsDemo';
import { EntityDetail } from './pages/EntityDetail';
import { RoomDetail } from './pages/RoomDetail';

interface AppProps {
  // Optional: when running inside the realm-panel custom element, main.tsx
  // creates a single mock-baseline store and syncs HA's live states onto it.
  // When omitted (e.g. tests, standalone), we fall back to a fresh mock store.
  store?: HassStore;
}

const App: FC<AppProps> = ({ store }) => {
  const fallback = useMemo(() => createMockStore(), []);
  const active = store ?? fallback;

  return (
    <HassProvider store={active}>
      <LayoutProvider>
        <HashRouter>
          <Shell>
            <Routes>
              <Route path="/" element={<Overview />} />
              <Route path="/components" element={<ComponentsDemo />} />
              <Route path="/entity/:entityId" element={<EntityDetail />} />
              <Route path="/room/:roomId" element={<RoomDetail />} />
            </Routes>
          </Shell>
          <ToastHost />
        </HashRouter>
      </LayoutProvider>
    </HassProvider>
  );
};

export default App;
