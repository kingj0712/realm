import { useState, type FC } from 'react';
import { useLayout } from './LayoutContext';
import { useEntity } from '../hass';
import { EntityPicker } from './EntityPicker';

interface AlarmChipsProps {
  // entity IDs to monitor; chip appears only when entity is in an alarm-y state.
  entityIds: string[];
}

interface AlarmChipProps {
  entityId: string;
}

// A single chip — subscribes to one entity, renders only when "active".
// "Active" = state === 'on' for binary sensors, or === 'problem' / 'alarm' for sensors.
const AlarmChip: FC<AlarmChipProps> = ({ entityId }) => {
  const entity = useEntity(entityId);
  if (!entity) return null;
  const s = entity.state;
  const isActive = s === 'on' || s === 'problem' || s === 'alarm' || s === 'triggered';
  if (!isActive) return null;
  const name = (entity.attributes.friendly_name as string | undefined) ?? entityId;
  return (
    <div className="alarm-chip" role="alert">
      <span className="alarm-chip__dot" />
      <span className="alarm-chip__label">{name}</span>
    </div>
  );
};

export const AlarmChips: FC<AlarmChipsProps> = ({ entityIds }) => {
  if (!entityIds || entityIds.length === 0) return null;
  return (
    <div className="alarm-chips">
      {entityIds.map((id) => <AlarmChip key={id} entityId={id} />)}
    </div>
  );
};

// Settings drawer to configure the active tab's alarm entity list. Picker is
// inline so users see what entities exist instead of typing IDs blind.
export const AlarmsConfig: FC<{ open: boolean; onClose: () => void }> = ({ open, onClose }) => {
  const { activeTab, setActiveTabAlarmEntities } = useLayout();
  const [adding, setAdding] = useState(false);
  const [draftId, setDraftId] = useState('');
  const entities = activeTab.alarmEntities ?? [];

  if (!open) return null;

  const cancelAdd = () => { setAdding(false); setDraftId(''); };
  const commitAdd = () => {
    const id = draftId.trim();
    if (id && !entities.includes(id)) {
      setActiveTabAlarmEntities([...entities, id]);
    }
    cancelAdd();
  };
  const onRemove = (id: string) => setActiveTabAlarmEntities(entities.filter((x) => x !== id));

  return (
    <div className="tile-modal-backdrop" onClick={onClose}>
      <div className="tile-modal tile-modal--sm" onClick={(e) => e.stopPropagation()}>
        <div className="tile-modal__head">
          <div className="tile-modal__head-titles">
            <div className="tile-modal__title">Alarm Chips</div>
            <div className="tile-modal__subtitle">{activeTab.name}</div>
          </div>
          <button type="button" className="tile-modal__close" onClick={onClose} aria-label="close">✕</button>
        </div>
        <div className="tile-modal__body">
          <p className="alarms-config__hint">
            Chips appear at the top of the page when any of these entities are in an active state
            (binary_sensor &quot;on&quot;, or sensor states &quot;problem&quot; / &quot;alarm&quot; / &quot;triggered&quot;).
          </p>
          <div className="alarms-config__list">
            {entities.length === 0 && !adding && (
              <div className="alarms-config__empty">No alarm entities configured.</div>
            )}
            {entities.map((id) => (
              <div key={id} className="alarms-config__row">
                <span className="alarms-config__id">{id}</span>
                <button
                  type="button"
                  className="alarms-config__remove"
                  onClick={() => onRemove(id)}
                  aria-label="remove"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
          {adding ? (
            <div className="alarms-config__picker">
              <EntityPicker
                value={draftId}
                onChange={setDraftId}
                domains={['binary_sensor', 'sensor', 'alarm_control_panel']}
              />
              <div className="alarms-config__picker-actions">
                <button type="button" className="alarms-config__add" onClick={commitAdd} disabled={!draftId}>
                  ADD
                </button>
                <button type="button" className="alarms-config__cancel" onClick={cancelAdd}>
                  CANCEL
                </button>
              </div>
            </div>
          ) : (
            <button type="button" className="alarms-config__add" onClick={() => setAdding(true)}>
              + ADD ENTITY
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
