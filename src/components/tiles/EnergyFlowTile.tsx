import type { FC, ReactNode } from 'react';
import { BaseTile } from './BaseTile';
import { useEntity } from '../../hass';

interface EnergyFlowTileProps {
  label?: string;
  icon?: ReactNode;
  gridEntityId: string;
  solarEntityId?: string;
  batteryEntityId?: string;
  homeEntityId: string;
}

interface NodeData {
  label: string;
  power: number;
  unit: string;
}

function readPower(entity: ReturnType<typeof useEntity>): NodeData | null {
  if (!entity) return null;
  const v = parseFloat(entity.state);
  if (!Number.isFinite(v)) return null;
  const unit = (entity.attributes.unit_of_measurement as string | undefined) ?? 'kW';
  const label = (entity.attributes.friendly_name as string | undefined)?.toUpperCase() ?? '---';
  return { label, power: v, unit };
}

export const EnergyFlowTile: FC<EnergyFlowTileProps> = ({
  label = 'ENERGY',
  icon,
  gridEntityId,
  solarEntityId,
  batteryEntityId,
  homeEntityId,
}) => {
  const gridE = useEntity(gridEntityId);
  const solarE = useEntity(solarEntityId ?? '');
  const batteryE = useEntity(batteryEntityId ?? '');
  const homeE = useEntity(homeEntityId);
  const grid = readPower(gridE);
  const solar = solarEntityId ? readPower(solarE) : null;
  const battery = batteryEntityId ? readPower(batteryE) : null;
  const home = readPower(homeE);

  // viewBox 300x180. Top row: GRID (60,50) / SOLAR (150,50) / BATTERY (240,50). Bottom: HOME (150,150).
  // Each node is centered on its position. Lines connect node centers.
  const positions = {
    grid:    { x: 60,  y: 50 },
    solar:   { x: 150, y: 50 },
    battery: { x: 240, y: 50 },
    home:    { x: 150, y: 150 },
  };

  // Active means non-zero flow. Battery negative = charging (flow reversed).
  const gridActive = !!grid && Math.abs(grid.power) > 0.01;
  const solarActive = !!solar && Math.abs(solar.power) > 0.01;
  const batteryActive = !!battery && Math.abs(battery.power) > 0.01;

  return (
    <BaseTile label={label} icon={icon}>
      <div className="energy-flow-tile">
        <svg
          className="energy-flow-tile__svg"
          viewBox="0 0 300 180"
          preserveAspectRatio="xMidYMid meet"
          aria-hidden
        >
          {/* Flow paths */}
          {grid && (
            <path
              className={`flow-line${gridActive ? ' flow-line--active' : ''}${grid.power < 0 ? ' flow-line--reverse' : ''}`}
              d={`M ${positions.grid.x},${positions.grid.y + 12} Q ${positions.grid.x},${(positions.grid.y + positions.home.y) / 2} ${positions.home.x},${positions.home.y - 12}`}
            />
          )}
          {solar && (
            <path
              className={`flow-line${solarActive ? ' flow-line--active flow-line--solar' : ''}`}
              d={`M ${positions.solar.x},${positions.solar.y + 12} L ${positions.home.x},${positions.home.y - 12}`}
            />
          )}
          {battery && (
            <path
              className={`flow-line${batteryActive ? ' flow-line--active' : ''}${battery.power < 0 ? ' flow-line--reverse' : ''}`}
              d={`M ${positions.battery.x},${positions.battery.y + 12} Q ${positions.battery.x},${(positions.battery.y + positions.home.y) / 2} ${positions.home.x},${positions.home.y - 12}`}
            />
          )}

          {/* Nodes */}
          {grid && <EnergyNode {...positions.grid} data={grid} variant="grid" />}
          {solar && <EnergyNode {...positions.solar} data={solar} variant="solar" />}
          {battery && (
            <EnergyNode
              {...positions.battery}
              data={battery}
              variant="battery"
              subLabel={battery.power < 0 ? 'CHG' : 'DSG'}
            />
          )}
          {home && <EnergyNode {...positions.home} data={home} variant="home" />}
        </svg>
      </div>
    </BaseTile>
  );
};

interface EnergyNodeProps {
  x: number;
  y: number;
  data: NodeData;
  variant: 'grid' | 'solar' | 'battery' | 'home';
  subLabel?: string;
}

const EnergyNode: FC<EnergyNodeProps> = ({ x, y, data, variant, subLabel }) => (
  <g className={`energy-node energy-node--${variant}`} transform={`translate(${x},${y})`}>
    <rect className="energy-node__box" x={-32} y={-12} width={64} height={26} rx={3} />
    <text className="energy-node__label" x={0} y={-2} textAnchor="middle">{data.label}</text>
    <text className="energy-node__value" x={0} y={10} textAnchor="middle">
      {Math.abs(data.power).toFixed(1)} {data.unit}
    </text>
    {subLabel && <text className="energy-node__sublabel" x={0} y={24} textAnchor="middle">{subLabel}</text>}
  </g>
);
