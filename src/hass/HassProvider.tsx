import { createContext, useContext, type FC, type ReactNode } from 'react';
import type { HassStore } from './HassStore';

const HassContext = createContext<HassStore | null>(null);

interface HassProviderProps {
  store: HassStore;
  children: ReactNode;
}

export const HassProvider: FC<HassProviderProps> = ({ store, children }) => (
  <HassContext.Provider value={store}>{children}</HassContext.Provider>
);

export function useHass(): HassStore {
  const store = useContext(HassContext);
  if (!store) {
    throw new Error('useHass must be used inside a HassProvider');
  }
  return store;
}
