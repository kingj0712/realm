import type { CSSProperties, FC } from 'react';

interface IconProps {
  // mdi path string (import the constant from @mdi/js, e.g. mdiGarage)
  path: string;
  size?: number;
  color?: string;
  style?: CSSProperties;
  title?: string;
}

export const Icon: FC<IconProps> = ({
  path,
  size = 16,
  color = 'currentColor',
  style,
  title,
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    aria-hidden={title ? undefined : true}
    style={{ display: 'inline-block', verticalAlign: 'middle', flexShrink: 0, ...style }}
  >
    {title && <title>{title}</title>}
    <path d={path} fill={color} />
  </svg>
);
