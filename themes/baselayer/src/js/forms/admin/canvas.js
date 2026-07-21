import Sortable from 'sortablejs';
import { el, t, defaultField, uniqueFieldName } from './dom.js';
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

  const prepareField = (typeOrData) => {
    const data = typeof typeOrData === 'string' ? defaultField(typeOrData) : { ...typeOrData };
    if (data.name != null && data.name_manual === false) {
      data.name = uniqueFieldName(data.label || data.name || data.type || 'field', data.id || '');
    } else if (data.name) {
      data.name = uniqueFieldName(data.name, data.id || '');
    }
    return data;
  };

  const addField = (typeOrData, open = true) => {
    const card = createFieldCard(prepareField(typeOrData), open);
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
    onStart() {
      document.body.classList.add('is-dragging');
    },
    onEnd() {
      document.body.classList.remove('is-dragging');
    },
    onAdd(evt) {
      const item = evt.item;
      const type = item.dataset.fieldType || 'text';
      // Palette clones are buttons — replace with a real field card.
      if (item.classList.contains('bl-forms-builder__template')) {
        const card = createFieldCard(prepareField(type), true);
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
