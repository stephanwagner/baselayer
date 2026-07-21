import Sortable from 'sortablejs';
import { el, t, defaultField } from './dom.js';
import { createFieldCard, serializeRow } from './field-card.js';

/**
 * Right column: drop canvas + reorderable field cards.
 *
 * @param {object} options
 * @param {list} options.fields
 * @param {() => void} options.onChange
 */
export function createCanvas({ fields = [], onChange }) {
  const wrap = el('section', { className: 'bl-forms-builder__canvas' });
  wrap.appendChild(el('h3', { className: 'bl-forms-builder__col-title', text: t('canvasHeading', 'Form') }));

  const list = el('div', {
    className: 'bl-forms-builder__list',
    dataset: { blFormsCanvas: '1' },
  });
  const empty = el('p', {
    className: 'description bl-forms-builder__empty',
    text: t('empty', 'Drag a field here, or click a template to add it.'),
  });

  const syncEmpty = () => {
    empty.hidden = list.querySelector('[data-bl-forms-field]') != null;
  };

  const addField = (typeOrData, open = true) => {
    const data = typeof typeOrData === 'string' ? defaultField(typeOrData) : typeOrData;
    const card = createFieldCard(data, open);
    list.appendChild(card);
    syncEmpty();
    onChange();
    return card;
  };

  (fields || []).forEach((field) => list.appendChild(createFieldCard(field, false)));
  syncEmpty();

  wrap.append(list, empty);

  Sortable.create(list, {
    group: 'bl-forms-fields',
    handle: '.bl-forms-builder__handle',
    animation: 150,
    draggable: '.bl-forms-builder__field, .bl-forms-builder__template',
    onAdd(evt) {
      const item = evt.item;
      const type = item.dataset.fieldType || 'text';
      // Palette clones are buttons — replace with a real field card.
      if (item.classList.contains('bl-forms-builder__template')) {
        const card = createFieldCard(defaultField(type), true);
        item.replaceWith(card);
      }
      syncEmpty();
      onChange();
    },
    onUpdate() {
      onChange();
    },
    onSort() {
      onChange();
    },
  });

  return {
    root: wrap,
    addField,
    syncEmpty,
    getFields() {
      return Array.from(list.querySelectorAll('[data-bl-forms-field]')).map(serializeRow);
    },
  };
}
