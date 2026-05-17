import type { FC, ReactNode, MouseEvent } from 'react';
import { BaseTile } from './BaseTile';
import { useEntity, useHass } from '../../hass';

interface TodoItem {
  uid: string;
  summary: string;
  status: 'needs_action' | 'completed';
}

interface TodoListTileProps {
  entityId: string;
  label?: string;
  icon?: ReactNode;
  showCompleted?: boolean;
}

export const TodoListTile: FC<TodoListTileProps> = ({ entityId, label, icon, showCompleted = true }) => {
  const entity = useEntity(entityId);
  const store = useHass();
  const friendly = label ?? (entity?.attributes.friendly_name as string | undefined) ?? entityId;
  if (!entity) return <BaseTile label={friendly} status="stale" icon={icon} pill="unavail"><div>n/a</div></BaseTile>;

  const items = (entity.attributes.items as TodoItem[] | undefined) ?? [];
  const visible = showCompleted ? items : items.filter((i) => i.status !== 'completed');
  const remaining = items.filter((i) => i.status !== 'completed').length;

  const toggle = (it: TodoItem) => (e: MouseEvent) => {
    e.stopPropagation();
    const next = it.status === 'completed' ? 'needs_action' : 'completed';
    store.callService('todo', 'update_item', { item: it.uid, status: next }, { entity_id: entityId });
  };

  return (
    <BaseTile label={friendly} icon={icon} pill={`${remaining} LEFT`}>
      <div className="todo-tile">
        {visible.map((it) => (
          <button
            key={it.uid}
            type="button"
            className={`todo-tile__row${it.status === 'completed' ? ' todo-tile__row--done' : ''}`}
            onClick={toggle(it)}
          >
            <span className="todo-tile__check">{it.status === 'completed' ? '☑' : '☐'}</span>
            <span className="todo-tile__summary">{it.summary}</span>
          </button>
        ))}
      </div>
    </BaseTile>
  );
};
