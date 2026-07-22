import Sortable from 'sortablejs';
import { el, t, defaultField, uniqueFieldName, formsDragStart, formsDragEnd } from './dom.js';
import { createFieldCard, serializeRow } from './field-card.js';
import { equalizeColumnRun } from './layout.js';

/**
 * Flatten legacy group fields into consecutive columns for the canvas.
 *
 * @param {list} fields
 */
function expandLegacyGroups(fields) {
  const out = [];
  (fields || []).forEach((field) => {
    if ((field?.type || '') === 'group') {
      (field.children || []).forEach((child) => {
        if ((child?.type || '') === 'column') {
          out.push(child);
        }
      });
      return;
    }
    out.push(field);
  });
  return out;
}

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
    empty.hidden = list.querySelector(':scope > [data-bl-forms-field]') != null;
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
    if ((card.dataset.fieldType || '') === 'column') {
      equalizeColumnRun(list, card);
    }
    syncEmpty();
    onChange();
    return card;
  };

  expandLegacyGroups(fields || []).forEach((field) => {
    list.appendChild(createFieldCard(field, false));
  });
  syncEmpty();

  wrap.append(list, empty);

  Sortable.create(list, {
    group: {
      name: 'bl-forms-fields',
      put(to, from, dragEl) {
        // Nested-only types shouldn't land here from column interiors as invalid;
        // columns and normal fields are fine at root.
        return true;
      },
    },
    handle: '.bl-forms-builder__handle',
    animation: 150,
    draggable: '.bl-forms-builder__field, .bl-forms-builder__template',
    onStart: formsDragStart,
    onEnd: formsDragEnd,
    onAdd(evt) {
      const item = evt.item;
      const type = item.dataset.fieldType || 'text';
      let card = item;
      if (item.classList.contains('bl-forms-builder__template')) {
        card = createFieldCard(prepareField(type), true);
        item.replaceWith(card);
      }
      if ((card.dataset.fieldType || '') === 'column') {
        equalizeColumnRun(list, card);
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
      return Array.from(list.children)
        .filter((el) => el.matches?.('[data-bl-forms-field]'))
        .map(serializeRow);
    },
  };
}
