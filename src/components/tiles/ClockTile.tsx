import type { FC, ReactNode } from 'react';
import { useEffect, useState } from 'react';
import { BaseTile } from './BaseTile';

interface ClockTileProps {
  label?: string;
  icon?: ReactNode;
  showSeconds?: boolean;
  hour12?: boolean;
}

export const ClockTile: FC<ClockTileProps> = ({
  label = 'TIME',
  icon,
  showSeconds = false,
  hour12 = false,
}) => {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    // Tick every second if showing seconds, otherwise align to the next minute.
    if (showSeconds) {
      const t = setInterval(() => setNow(new Date()), 1000);
      return () => clearInterval(t);
    }
    const toNextMinute = 60_000 - (Date.now() % 60_000);
    const initial = setTimeout(() => {
      setNow(new Date());
      const t = setInterval(() => setNow(new Date()), 60_000);
      // Replace cleanup with the new interval id.
      cleanupRef = () => clearInterval(t);
    }, toNextMinute);
    let cleanupRef: (() => void) | null = () => clearTimeout(initial);
    return () => {
      cleanupRef?.();
    };
  }, [showSeconds]);

  const timeStr = now.toLocaleTimeString('en-US', {
    hour12,
    hour: '2-digit',
    minute: '2-digit',
    ...(showSeconds ? { second: '2-digit' } : {}),
  });

  const dateStr = now.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });

  return (
    <BaseTile label={label} icon={icon}>
      <div className="clock-tile">
        <div className="clock-tile__time">{timeStr}</div>
        <div className="clock-tile__date">{dateStr}</div>
      </div>
    </BaseTile>
  );
};
