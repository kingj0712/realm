import type { FC, ReactNode, KeyboardEvent } from 'react';

export type TileStatus = 'ok' | 'warn' | 'alarm' | 'info' | 'stale' | 'idle';

interface BaseTileProps {
  label: string;
  status?: TileStatus;
  // Optional status chip rendered in the header right slot (SCADA-style).
  pill?: string;
  // Optional icon rendered to the left of the label.
  icon?: ReactNode;
  onClick?: () => void;
  children: ReactNode;
}

export const BaseTile: FC<BaseTileProps> = ({
  label,
  status = 'idle',
  pill,
  icon,
  onClick,
  children,
}) => {
  const classes = ['tile', `tile--${status}`];
  if (onClick) classes.push('tile--clickable');

  const handleKey = onClick
    ? (e: KeyboardEvent<HTMLDivElement>) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      }
    : undefined;

  return (
    <div
      className={classes.join(' ')}
      onClick={onClick}
      onKeyDown={handleKey}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      <div className="tile__header">
        <span className="tile__label-group">
          {icon && <span className="tile__icon">{icon}</span>}
          <span className="tile__label">{label}</span>
        </span>
        {pill && <span className="tile__pill">{pill}</span>}
      </div>
      <div className="tile__body">{children}</div>
    </div>
  );
};
