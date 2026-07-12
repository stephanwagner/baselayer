import Sortable from 'sortablejs';
import { el, empty } from './dom';
import { createFieldRow, serializeFieldRow } from './field-row';

/**
 * Build the field list shell and wire interactions.
 *
 * @param {HTMLElement} root
 * @param {object} options
 */
export function createShell(root, options = {}) {
  const mode = options.mode || 'fields';
  const i18n = options.i18n || {};

  empty(root);
  root.classList.add('fs-field-builder');

  const list = el('div', {
    className: 'fs-field-builder__list',
    dataset: { fsFbList: '1' },
  });
  const emptyState = el('p', {
    className: 'fs-field-builder__empty description',
    text: i18n.empty || 'No fields yet. Add a field to get started.',
  });
  const addBtn = el('button', {
    type: 'button',
    className: 'button button-secondary fs-field-builder__add',
    text: i18n.addField || 'Add field',
  });

  root.appendChild(list);
  root.appendChild(emptyState);
  root.appendChild(addBtn);

  const syncEmpty = () => {
    const hasFields = list.querySelector('[data-fs-fb-field]') != null;
    emptyState.hidden = hasFields;
    root.classList.toggle('has-fields', hasFields);
  };

  const addField = (data = {}, open = true) => {
    const row = createFieldRow({ mode, data, open });
    list.appendChild(row);
    syncEmpty();
    return row;
  };

  addBtn.addEventListener('click', () => {
    addField({}, true);
  });

  list.addEventListener('fs-fb-delete', (event) => {
    const row = event.target.closest('[data-fs-fb-field]');
    if (row) {
      row.remove();
      syncEmpty();
    }
  });

  const sortable = Sortable.create(list, {
    handle: '.fs-field-builder__field-handle',
    animation: 150,
    draggable: '[data-fs-fb-field]',
  });

  (options.initialFields || []).forEach((field) => {
    addField(field, false);
  });
  syncEmpty();

  return {
    getSchema() {
      return Array.from(list.querySelectorAll('[data-fs-fb-field]')).map((row) =>
        serializeFieldRow(row)
      );
    },
    setSchema(fields) {
      empty(list);
      (Array.isArray(fields) ? fields : []).forEach((field) => addField(field, false));
      syncEmpty();
    },
    destroy() {
      sortable.destroy();
      empty(root);
      root.classList.remove('fs-field-builder', 'has-fields');
    },
  };
}
