import type { FC, ReactNode } from 'react';
import { BaseTile, type TileStatus } from './BaseTile';
import { useEntity } from '../../hass';

interface BeehiveTileProps {
  label?: string;
  icon?: ReactNode;
  weightEntityId: string;
  tempEntityId?: string;
  humidityEntityId?: string;
  brood?: { idealMin?: number; idealMax?: number };
}

export const BeehiveTile: FC<BeehiveTileProps> = ({
  label = 'HIVE',
  icon,
  weightEntityId,
  tempEntityId,
  humidityEntityId,
  brood = { idealMin: 90, idealMax: 96 },
}) => {
  const weight = useEntity(weightEntityId);
  const temp = useEntity(tempEntityId ?? '');
  const humidity = useEntity(humidityEntityId ?? '');

  const tempVal = temp ? parseFloat(temp.state) : NaN;
  let tempStatus: TileStatus = 'ok';
  if (Number.isFinite(tempVal) && brood.idealMin != null && brood.idealMax != null) {
    if (tempVal < brood.idealMin - 5 || tempVal > brood.idealMax + 5) tempStatus = 'alarm';
    else if (tempVal < brood.idealMin || tempVal > brood.idealMax) tempStatus = 'warn';
  }

  return (
    <BaseTile label={label} status={tempStatus} icon={icon} pill={tempStatus === 'ok' ? 'HEALTHY' : tempStatus === 'warn' ? 'CHECK' : 'CRITICAL'}>
      <div className="beehive-tile">
        <div className="beehive-tile__metric">
          <span className="beehive-tile__label">WEIGHT</span>
          <span className="beehive-tile__value">
            {weight ? parseFloat(weight.state).toFixed(1) : 'n/a'}
            <span className="beehive-tile__unit">{(weight?.attributes.unit_of_measurement as string) ?? 'lb'}</span>
          </span>
        </div>
        {temp && (
          <div className="beehive-tile__metric">
            <span className="beehive-tile__label">TEMP</span>
            <span className={`beehive-tile__value beehive-tile__value--${tempStatus}`}>
              {Number.isFinite(tempVal) ? tempVal.toFixed(0) : 'n/a'}
              <span className="beehive-tile__unit">{(temp.attributes.unit_of_measurement as string) ?? '°F'}</span>
            </span>
          </div>
        )}
        {humidity && (
          <div className="beehive-tile__metric">
            <span className="beehive-tile__label">HUMID</span>
            <span className="beehive-tile__value">
              {parseFloat(humidity.state).toFixed(0)}
              <span className="beehive-tile__unit">%</span>
            </span>
          </div>
        )}
      </div>
    </BaseTile>
  );
};
