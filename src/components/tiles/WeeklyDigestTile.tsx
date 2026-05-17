import type { FC, ReactNode } from 'react';
import { useEffect, useState } from 'react';
import { BaseTile, type TileStatus } from './BaseTile';

interface WeeklyDigestTileProps {
  label?: string;
  icon?: ReactNode;
  // Endpoint that returns either JSON ({ title, date, content/text/body }) or plain text.
  // Default targets homestead-hq.
  url?: string;
  refreshMinutes?: number;
}

interface DigestPayload {
  title?: string;
  date?: string;
  content: string;
}

// Pulls weekly digest text from a custom endpoint. Accepts JSON
// (`content`/`text`/`body` field) or plain text. Needs CORS headers on the
// server side since the request is cross-origin from the HA frontend.
export const WeeklyDigestTile: FC<WeeklyDigestTileProps> = ({
  label = 'WEEKLY DIGEST',
  icon,
  url = 'http://homestead-hq.local:3000/api/digest/weekly',
  refreshMinutes = 60,
}) => {
  const [data, setData] = useState<DigestPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function fetchDigest() {
      try {
        if (!cancelled) setLoading(true);
        const res = await fetch(url, { mode: 'cors' });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const text = await res.text();
        if (cancelled) return;
        let payload: DigestPayload;
        try {
          const json = JSON.parse(text);
          payload = {
            title: typeof json.title === 'string' ? json.title : undefined,
            date: typeof json.date === 'string' ? json.date : undefined,
            content: typeof json.content === 'string' ? json.content
                  : typeof json.text === 'string' ? json.text
                  : typeof json.body === 'string' ? json.body
                  : text,
          };
        } catch {
          payload = { content: text };
        }
        if (!cancelled) {
          setData(payload);
          setError(null);
        }
      } catch (e) {
        if (cancelled) return;
        setError(e instanceof Error ? e.message : 'fetch failed');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    fetchDigest();
    const t = setInterval(fetchDigest, Math.max(1, refreshMinutes) * 60_000);
    return () => { cancelled = true; clearInterval(t); };
  }, [url, refreshMinutes]);

  const status: TileStatus = error ? 'alarm' : loading && !data ? 'idle' : 'info';
  const pillText = error ? 'OFFLINE' : data?.date ?? (loading ? 'LOADING' : 'OK');
  const tileLabel = data?.title ?? label;

  return (
    <BaseTile label={tileLabel} icon={icon} status={status} pill={pillText}>
      <div className="digest-tile">
        {loading && !data && !error && <div className="digest-tile__loading">Fetching from {new URL(url).host}…</div>}
        {error && (
          <div className="digest-tile__error">
            <div className="digest-tile__error-msg">{error}</div>
            <div className="digest-tile__error-hint">homestead-hq must allow CORS from this origin.</div>
          </div>
        )}
        {data && <div className="digest-tile__content">{data.content}</div>}
      </div>
    </BaseTile>
  );
};
