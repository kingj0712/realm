import type { FC, ReactNode } from 'react';
import { TileModal } from './TileModal';
import { PlotTile } from './PlotTile';
import { useEntity } from '../../hass';

interface EntityDetailModalProps {
  entityId: string;
  title: string;
  pill?: string;
  onClose: () => void;
  // Optional custom body. When omitted, renders a generic chart + attribute table.
  children?: ReactNode;
}

// Generic "tap-to-see-detail" modal. Default body shows a 60-point history
// plot for numeric entities plus a table of the entity's attributes. Tiles
// can pass custom `children` for tile-specific detail layouts (e.g. Weather
// extended forecast, Camera full-size image).
export const EntityDetailModal: FC<EntityDetailModalProps> = ({ entityId, title, pill, onClose, children }) => {
  const entity = useEntity(entityId);

  return (
    <TileModal title={title} subtitle={entityId} pill={pill} onClose={onClose} size="lg">
      <div className="entity-detail">
        {children ?? (
          <>
            <div className="entity-detail__chart">
              <PlotTile entityId={entityId} points={60} timeRange="60m" />
            </div>
            {entity && (
              <div className="entity-detail__attrs">
                <div className="entity-detail__attrs-head">ATTRIBUTES</div>
                <div className="entity-detail__attrs-body">
                  <div className="entity-detail__attr">
                    <span className="entity-detail__attr-key">state</span>
                    <span className="entity-detail__attr-val">{entity.state}</span>
                  </div>
                  <div className="entity-detail__attr">
                    <span className="entity-detail__attr-key">last_changed</span>
                    <span className="entity-detail__attr-val">{new Date(entity.last_changed).toLocaleString()}</span>
                  </div>
                  {Object.entries(entity.attributes).map(([k, v]) => (
                    <div key={k} className="entity-detail__attr">
                      <span className="entity-detail__attr-key">{k}</span>
                      <span className="entity-detail__attr-val">{
                        typeof v === 'object' && v !== null
                          ? JSON.stringify(v).slice(0, 80) + (JSON.stringify(v).length > 80 ? '…' : '')
                          : String(v)
                      }</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </TileModal>
  );
};
