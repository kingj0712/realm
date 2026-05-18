import { useState, type FC, type ReactNode } from 'react';
import { createPortal } from 'react-dom';

// Modals need to render OUTSIDE the grid's transform/stacking context, or
// react-grid-layout's CSS transforms scope them inside the dragging tile.
// We portal into a sibling div inside the shadow root (or document.body in
// pure dev) so the modal's `position: fixed` is anchored to the viewport.
function findOrCreatePortalRoot(): HTMLElement {
  const panel = document.querySelector('realm-panel') as HTMLElement | null;
  const root: ShadowRoot | HTMLElement = panel?.shadowRoot ?? document.body;
  let target = root.querySelector('#realm-modal-root') as HTMLElement | null;
  if (!target) {
    target = document.createElement('div');
    target.id = 'realm-modal-root';
    root.appendChild(target);
  }
  return target;
}

export const ModalPortal: FC<{ children: ReactNode }> = ({ children }) => {
  const [target] = useState(() => findOrCreatePortalRoot());
  return createPortal(children, target);
};
