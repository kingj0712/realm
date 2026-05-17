import { useMemo, type FC } from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import { HassProvider, createMockStore } from './hass';
import { LayoutProvider } from './edit';
import { Shell } from './components/Shell';
import { Overview } from './pages/Overview';
import { ComponentsDemo } from './pages/ComponentsDemo';

// Phase 2: always uses the mock store. Phase 6+ will swap to a HassStore
// bridged to the HA-injected hass object from main.tsx.
const App: FC = () => {
  const store = useMemo(() => createMockStore(), []);

  return (
    <HassProvider store={store}>
      <LayoutProvider>
        <HashRouter>
          <Shell>
            <Routes>
              <Route path="/" element={<Overview />} />
              <Route path="/components" element={<ComponentsDemo />} />
            </Routes>
          </Shell>
        </HashRouter>
      </LayoutProvider>
    </HassProvider>
  );
};

export default App;
