/**
 * Progressive enhancement for PHP-rendered Website admin repeaters.
 */

import { bindPagePickers } from './page-field.js';
import { bindLinkFields } from './link-field.js';
import { bindMediaPickers } from './media-field.js';
import { bindIconPickers } from './icon-field.js';

function i18n(key, fallback) {
  const dict =
    (window.blBlocksFieldUi && window.blBlocksFieldUi.i18n) ||
    (window.blBlocksEditor && window.blBlocksEditor.i18n) ||
    (window.blBlocksAdmin && window.blBlocksAdmin.i18n) ||
    {};
  return dict[key] || fallback || key;
}

/**
 * Rebind nested field widgets inside a scope (new / cloned rows).
 * @param {ParentNode} scope
 */
function rebindRowWidgets(scope) {
  bindPagePickers(scope);
  bindLinkFields(scope);
  bindMediaPickers(scope);
  bindIconPickers(scope);
  const api = window.blBlocksFieldUiApi || {};
  if (typeof api.bindHttpsUrlFields === 'function') {
    api.bindHttpsUrlFields(scope);
  }
  if (typeof api.bindFieldTabs === 'function') {
    api.bindFieldTabs(scope);
  }
}

/**
 * @param {string} name
 * @param {string} nameBase e.g. bl_blocks_values[channels]
 * @param {number} index
 */
function rewriteName(name, nameBase, index) {
  if (!name || !nameBase) return name;
  const escaped = nameBase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const re = new RegExp('^' + escaped + '\\[\\d+\\]');
  if (!re.test(name)) return name;
  return name.replace(re, nameBase + '[' + index + ']');
}

/**
 * @param {HTMLElement} row
 * @param {string} nameBase
 * @param {number} index
 */
function reindexRow(row, nameBase, index) {
  row.querySelectorAll('[name]').forEach((el) => {
    const name = el.getAttribute('name');
    if (!name) return;
    el.setAttribute('name', rewriteName(name, nameBase, index));
  });
  row.querySelectorAll('[id]').forEach((el) => {
    const id = el.getAttribute('id') || '';
    if (!id || !id.includes('-')) return;
    // Keep ids unique enough for labels; append row index suffix.
    const cleaned = id.replace(/--row-\d+$/, '');
    el.setAttribute('id', cleaned + '--row-' + index);
  });
  row.querySelectorAll('label[for]').forEach((label) => {
    const forId = label.getAttribute('for') || '';
    if (!forId) return;
    const cleaned = forId.replace(/--row-\d+$/, '');
    label.setAttribute('for', cleaned + '--row-' + index);
  });
  const title = row.querySelector('.bl-blocks-fields__repeater-row-title');
  if (title) {
    const template = i18n('rowLabel', 'Entry %d');
    title.textContent = template.replace('%d', String(index + 1));
  }
}

/**
 * Clear values in a cloned row (keep structure).
 * @param {HTMLElement} row
 */
function clearRowValues(row) {
  row.querySelectorAll('input, textarea, select').forEach((el) => {
    if (!(el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement || el instanceof HTMLSelectElement)) {
      return;
    }
    const type = (el instanceof HTMLInputElement ? el.type : '').toLowerCase();
    if (type === 'checkbox' || type === 'radio') {
      el.checked = false;
      return;
    }
    if (type === 'hidden' && el.closest('[data-bl-blocks-media-picker], [data-bl-blocks-icon-picker], [data-bl-blocks-page-picker], [data-bl-blocks-link]')) {
      el.value = '';
      return;
    }
    if (type === 'button' || type === 'submit') return;
    el.value = '';
  });

  row.querySelectorAll('[data-bl-blocks-icon-picker]').forEach((wrap) => {
    if (!(wrap instanceof HTMLElement)) return;
    delete wrap.dataset.blIconBound;
    const valueRow = wrap.querySelector('.bl-icon-picker__value');
    const valueBody = wrap.querySelector('.bl-icon-picker__value-body');
    if (valueBody) valueBody.replaceChildren();
    if (valueRow) valueRow.hidden = true;
  });

  row.querySelectorAll('[data-bl-blocks-media-picker]').forEach((wrap) => {
    if (!(wrap instanceof HTMLElement)) return;
    delete wrap.dataset.blMediaBound;
    const preview = wrap.querySelector('[data-bl-media-preview]');
    const empty = wrap.querySelector('[data-bl-media-empty]');
    const inputs = wrap.querySelector('[data-bl-media-inputs]');
    if (preview) preview.replaceChildren();
    if (empty) empty.hidden = false;
    if (inputs) {
      inputs.querySelectorAll('input').forEach((input) => {
        input.value = '';
      });
    }
  });

  row.querySelectorAll('[data-bl-blocks-page-picker]').forEach((wrap) => {
    if (wrap instanceof HTMLElement) {
      delete wrap.dataset.blPageBound;
    }
  });

  row.querySelectorAll('[data-bl-blocks-link]').forEach((wrap) => {
    if (wrap instanceof HTMLElement) {
      delete wrap.dataset.blLinkBound;
    }
  });
}

/**
 * @param {HTMLElement} wrap
 */
function bindOneAdminRepeater(wrap) {
  if (wrap.dataset.blRepeaterBound === '1') return;
  wrap.dataset.blRepeaterBound = '1';

  const rowsEl = wrap.querySelector(':scope > .bl-blocks-fields__repeater-rows');
  if (!rowsEl) return;

  const nameBase = wrap.dataset.nameBase || '';
  const minRows = Math.max(0, parseInt(wrap.dataset.minRows || '0', 10) || 0);
  const maxRows = Math.max(0, parseInt(wrap.dataset.maxRows || '0', 10) || 0);
  const emptyHelp = wrap.querySelector(':scope > .bl-blocks-fields__repeater-empty');
  const addBtn =
    wrap.querySelector(':scope > .bl-blocks-fields__repeater-add') ||
    wrap.querySelector('.bl-blocks-fields__repeater-add');

  const getRows = () =>
    Array.from(rowsEl.querySelectorAll(':scope > .bl-blocks-fields__repeater-row'));

  const syncChrome = () => {
    const rows = getRows();
    const count = rows.length;
    if (emptyHelp) {
      emptyHelp.hidden = count > 0;
    }
    rowsEl.hidden = count === 0;
    if (addBtn) {
      addBtn.disabled = maxRows > 0 && count >= maxRows;
    }
    rows.forEach((row, i) => {
      reindexRow(row, nameBase, i);
      const removeBtn = row.querySelector('.bl-blocks-fields__repeater-remove');
      if (removeBtn instanceof HTMLButtonElement) {
        removeBtn.disabled = count <= minRows;
      }
    });
  };

  const addRow = () => {
    const rows = getRows();
    if (maxRows > 0 && rows.length >= maxRows) return;

    const template = wrap.querySelector(':scope > template[data-bl-repeater-row-template]');
    let row;
    if (template instanceof HTMLTemplateElement && template.content.firstElementChild) {
      row = template.content.firstElementChild.cloneNode(true);
    } else if (rows[0]) {
      row = rows[0].cloneNode(true);
      clearRowValues(row);
    } else {
      return;
    }
    if (!(row instanceof HTMLElement)) return;
    row.classList.remove('is-collapsed');
    rowsEl.appendChild(row);
    syncChrome();
    rebindRowWidgets(row);
    wrap.dispatchEvent(new Event('change', { bubbles: true }));
  };

  const removeRow = (row) => {
    const rows = getRows();
    if (rows.length <= minRows) return;
    row.remove();
    syncChrome();
    wrap.dispatchEvent(new Event('change', { bubbles: true }));
  };

  rowsEl.addEventListener('click', (evt) => {
    const target = evt.target instanceof Element ? evt.target : null;
    if (!target) return;
    const removeBtn = target.closest('.bl-blocks-fields__repeater-remove');
    if (removeBtn && rowsEl.contains(removeBtn)) {
      evt.preventDefault();
      const row = removeBtn.closest('.bl-blocks-fields__repeater-row');
      if (row) removeRow(row);
      return;
    }
    const collapseBtn = target.closest('.bl-blocks-fields__repeater-collapse');
    if (collapseBtn && rowsEl.contains(collapseBtn)) {
      evt.preventDefault();
      const row = collapseBtn.closest('.bl-blocks-fields__repeater-row');
      if (!row) return;
      const collapsed = row.classList.toggle('is-collapsed');
      collapseBtn.setAttribute('aria-expanded', collapsed ? 'false' : 'true');
      collapseBtn.title = collapsed
        ? i18n('expandEntry', 'Expand')
        : i18n('collapseEntry', 'Collapse');
      collapseBtn.setAttribute('aria-label', collapseBtn.title);
    }
  });

  if (addBtn) {
    addBtn.addEventListener('click', (evt) => {
      evt.preventDefault();
      addRow();
    });
  }

  const Builder = window.BlCanvasBuilder;
  if (Builder && typeof Builder.createSortable === 'function') {
    rowsEl.classList.add('is-sortable');
    Builder.createSortable(rowsEl, {
      group: { name: 'bl-blocks-admin-repeater', pull: false, put: false },
      handle: '.bl-blocks-fields__repeater-handle',
      draggable: '.bl-blocks-fields__repeater-row',
      filter: '.bl-blocks-fields__repeater-collapse, .bl-blocks-fields__repeater-remove',
      animation: 150,
      onUpdate: () => {
        syncChrome();
        wrap.dispatchEvent(new Event('change', { bubbles: true }));
      },
      onSort: () => {
        syncChrome();
      },
    });
  }

  syncChrome();
}

/**
 * @param {ParentNode} [root=document]
 */
export function bindAdminRepeaters(root = document) {
  const scope = root && root.querySelectorAll ? root : document;
  scope.querySelectorAll('[data-bl-blocks-repeater]').forEach((wrap) => {
    if (wrap instanceof HTMLElement) {
      bindOneAdminRepeater(wrap);
    }
  });
}
