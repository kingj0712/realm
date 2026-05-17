import type { FC, ReactNode } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { mdiPencil, mdiPencilOff } from '@mdi/js';
import { Icon } from './Icon';
import { useLayout } from '../edit';

interface ShellProps {
  children: ReactNode;
}

const EditToggle: FC = () => {
  const { isEditing, setEditing } = useLayout();
  const location = useLocation();
  // Only show the edit toggle on the overview route (the only config-driven page right now).
  if (location.pathname !== '/' && location.pathname !== '') return null;
  return (
    <button
      type="button"
      className={`shell__edit-toggle${isEditing ? ' shell__edit-toggle--active' : ''}`}
      onClick={() => setEditing(!isEditing)}
      aria-label={isEditing ? 'exit edit mode' : 'enter edit mode'}
      title={isEditing ? 'Exit edit mode' : 'Edit layout'}
    >
      <Icon path={isEditing ? mdiPencilOff : mdiPencil} size={14} />
    </button>
  );
};

export const Shell: FC<ShellProps> = ({ children }) => (
  <div className="shell">
    <header className="shell__header">
      <span className="shell__mark">REALM</span>
      <nav className="shell__nav">
        <NavLink to="/" end className={({ isActive }) => `shell__nav-link${isActive ? ' shell__nav-link--active' : ''}`}>
          Overview
        </NavLink>
        <NavLink to="/components" className={({ isActive }) => `shell__nav-link${isActive ? ' shell__nav-link--active' : ''}`}>
          Components
        </NavLink>
      </nav>
      <EditToggle />
      <span className="shell__status">
        <span className="shell__dot" aria-hidden />
        online
      </span>
    </header>
    <main className="shell__main">{children}</main>
  </div>
);
