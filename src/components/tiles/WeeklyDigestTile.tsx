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
  // When true, the tile skips the fetch entirely and renders a designed
  // sample digest. Used by the Showcase tab so the Homestead section reads
  // as intentional out of the box without console noise from failed fetches.
  demo?: boolean;
}

// Friendly placeholder content used in demo mode and on hosts where the
// homestead-hq endpoint isn't reachable. Tagged as SAMPLE in the UI so users
// don't think the data is real.
const SAMPLE_DIGEST = `Week of May 12 — Casco Township

Weather:
  Highs in the upper 60s, lows around 48. Two thunderstorms Wed/Thu
  dropped 1.4 in of rain. Garden beds saturated, no irrigation needed.

Yields:
  Chicken eggs: 41 (avg 5.9/day)
  Beehive #1 weight gain: +2.8 lb (good flow on basswood)
  First strawberries ripening — pick by Saturday.

Systems:
  Generator self-test passed Sunday 03:00. Fuel at 78%.
  Sump cycled 14 times during the storm; high-water alarm did not trigger.
  Starlink uptime 99.96%. UDM rebooted Thursday for firmware.

Coming up:
  Tractor service due (~340 hr). Order replacement air filter.
  Mow front pasture before holiday weekend.`;

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
  demo = false,
}) => {
  const [data, setData] = useState<DigestPayload | null>(null);
  const [loading, setLoading] = useState(!demo);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (demo) return undefined; // Skip fetch entirely in demo mode.
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
  }, [url, refreshMinutes, demo]);

  if (demo) {
    return (
      <BaseTile label={label} icon={icon} status="info" pill="SAMPLE">
        <div className="digest-tile">
          <div className="digest-tile__content">{SAMPLE_DIGEST}</div>
        </div>
      </BaseTile>
    );
  }

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
