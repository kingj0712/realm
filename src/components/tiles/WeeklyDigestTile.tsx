import type { FC, ReactNode } from 'react';
import { useEffect, useState } from 'react';
import { BaseTile, type TileStatus } from './BaseTile';

interface WeeklyDigestTileProps {
  label?: string;
  icon?: ReactNode;
  // Endpoint that returns either JSON ({ title, date, content/text/body }) or plain text.
  // Empty by default; the tile falls back to the SAMPLE digest below until you
  // point it at a real endpoint in the inspector.
  url?: string;
  refreshMinutes?: number;
  // When true, the tile skips the fetch entirely and renders a designed
  // sample digest. Used by the Showcase tab so the Homestead section reads
  // as intentional out of the box without console noise from failed fetches.
  demo?: boolean;
}

// Generic-flavored placeholder content. Anything specific is clearly a
// "for example" — this is what a finished digest could look like, not a
// real one. Tagged as SAMPLE in the UI so users don't mistake it for data.
const SAMPLE_DIGEST = `Sample Weekly Digest

Weather:
  Mild week overall, highs in the mid 60s. A pair of thunderstorms
  midweek delivered enough rain that no irrigation was needed.

Yields:
  Hens: 41 eggs (avg 5.9/day)
  Beehive #1 weight gain: +2.8 lb
  First strawberries ripening soon.

Systems:
  Generator self-test passed early Sunday. Fuel at 78%.
  Sump cycled 14 times during the storm; high-water alarm did not trigger.
  WAN uptime 99.96%. Router rebooted Thursday for firmware.

Coming up:
  Equipment service due. Order replacement filters.
  Field mowing before the weekend.

(Configure URL in the inspector to replace this sample with live content.)`;

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
  url = '',
  refreshMinutes = 60,
  demo = false,
}) => {
  // A blank URL is treated the same as demo mode: the tile renders the SAMPLE
  // digest instead of trying (and failing) to fetch a hallucinated host.
  const sampleMode = demo || !url.trim();

  const [data, setData] = useState<DigestPayload | null>(null);
  const [loading, setLoading] = useState(!sampleMode);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (sampleMode) return undefined; // Skip fetch entirely; render SAMPLE.
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
  }, [url, refreshMinutes, sampleMode]);

  if (sampleMode) {
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
            <div className="digest-tile__error-hint">Endpoint must allow CORS from this origin.</div>
          </div>
        )}
        {data && <div className="digest-tile__content">{data.content}</div>}
      </div>
    </BaseTile>
  );
};
