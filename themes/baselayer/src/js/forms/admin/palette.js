import Sortable from 'sortablejs';
import { TYPE_KEYS, el, t, typeLabel } from './dom.js';

/**
 * Left column: field template chips (clone source for Sortable).
 *
 * @param {(type: string) => void} onAdd
 */
export function createPalette(onAdd) {
  const wrap = el('aside', { className: 'bl-forms-builder__palette' });
  wrap.appendChild(el('h3', { className: 'bl-forms-builder__col-title', text: t('paletteHeading', 'Field templates') }));

  const list = el('div', {
    className: 'bl-forms-builder__palette-list',
    dataset: { blFormsPalette: '1' },
  });

  TYPE_KEYS.forEach((type) => {
    const item = el(
      'button',
      {
        type: 'button',
        className: 'bl-forms-builder__template',
        dataset: { fieldType: type },
        onClick: () => onAdd(type),
      },
      [el('span', { className: 'bl-forms-builder__template-label', text: typeLabel(type) })]
    );
    list.appendChild(item);
  });

  wrap.appendChild(list);

  Sortable.create(list, {
    group: { name: 'bl-forms-fields', pull: 'clone', put: false },
    sort: false,
    animation: 150,
    draggable: '.bl-forms-builder__template',
  });

  return wrap;
}
