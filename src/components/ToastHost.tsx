import { useEffect, useState, type FC } from 'react';
import { useHass } from '../hass';
import { ModalPortal } from './ModalPortal';
import type { ServiceEvent } from '../hass/HassStore';
import { uid } from '../hass/uid';

type ToastKind = 'success' | 'error' | 'warn' | 'info';

interface Toast {
  id: string;
  kind: ToastKind;
  title: string;
  detail?: string;
  expiresAt: number;
}

const DURATION_MS: Record<ToastKind, number> = {
  success: 2200,
  info: 3000,
  warn: 4500,
  error: 5500,
};

const MAX_VISIBLE = 4;

// Render a friendly, short title for a ServiceEvent. Tile callers don't have
// to construct their own messages; the central host turns each event into UI.
function summarize(event: ServiceEvent, friendlyName: string | null): { kind: ToastKind; title: string; detail?: string } {
  const subject = friendlyName ?? event.entityIds[0] ?? '';
  const action = `${event.domain}.${event.service}`;
  if (event.type === 'success') {
    const title = subject ? `${action} → ${subject}` : action;
    return { kind: 'success', title };
  }
  if (event.type === 'no-handler') {
    return {
      kind: 'warn',
      title: subject ? `No handler for ${action}` : `No handler for ${action}`,
      detail: subject ? subject : undefined,
    };
  }
  return {
    kind: 'error',
    title: subject ? `${action} failed` : `${action} failed`,
    detail: event.message ?? (subject || undefined),
  };
}

export const ToastHost: FC = () => {
  const store = useHass();
  const [toasts, setToasts] = useState<Toast[]>([]);
  useEffect(() => {
    const off = store.subscribeServiceEvents((event) => {
      const friendly = event.entityIds.length === 1
        ? (store.getEntity(event.entityIds[0])?.attributes?.friendly_name as string | undefined) ?? null
        : null;
      const summary = summarize(event, friendly);
      const toast: Toast = {
        id: uid(),
        kind: summary.kind,
        title: summary.title,
        detail: summary.detail,
        expiresAt: Date.now() + DURATION_MS[summary.kind],
      };
      setToasts((prev) => {
        const next = [...prev, toast];
        return next.length > MAX_VISIBLE ? next.slice(next.length - MAX_VISIBLE) : next;
      });
    });
    return off;
  }, [store]);

  // Auto-dismiss: one interval that ticks while any toast is alive, then
  // shuts off. Lighter than each toast owning a setTimeout.
  useEffect(() => {
    if (toasts.length === 0) return undefined;
    const handle = window.setInterval(() => {
      const now = Date.now();
      setToasts((prev) => {
        const next = prev.filter((t) => t.expiresAt > now);
        return next.length === prev.length ? prev : next;
      });
    }, 250);
    return () => window.clearInterval(handle);
  }, [toasts.length === 0]);

  const dismiss = (id: string) => setToasts((prev) => prev.filter((t) => t.id !== id));

  if (toasts.length === 0) return null;

  return (
    <ModalPortal>
      <div className="toast-host" role="status" aria-live="polite">
        {toasts.map((t) => (
          <div key={t.id} className={`toast toast--${t.kind}`}>
            <div className="toast__body">
              <div className="toast__title">{t.title}</div>
              {t.detail && <div className="toast__detail">{t.detail}</div>}
            </div>
            <button type="button" className="toast__close" onClick={() => dismiss(t.id)} aria-label="dismiss">✕</button>
          </div>
        ))}
      </div>
    </ModalPortal>
  );
};
