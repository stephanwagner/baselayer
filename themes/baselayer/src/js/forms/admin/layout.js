import Sortable from 'sortablejs';
import { el, t, uid, iconEl, defaultField, uniqueFieldName, formsDragStart, formsDragEnd } from './dom.js';
import { createFieldCard, serializeRow, createWidthControl } from './field-card.js';

const COLUMN_CHILD_BLOCKED = ['column', 'hidden', 'honeypot', 'captcha'];

function prepareNestedField(typeOrData) {
  const data = typeof typeOrData === 'string' ? defaultField(typeOrData) : { ...typeOrData };
  if (COLUMN_CHILD_BLOCKED.includes(data.type)) {
    return null;
  }
  if (data.name != null && data.name_manual === false) {
    data.name = uniqueFieldName(data.label || data.name || data.type || 'field', data.id || '');
  } else if (data.name) {
    data.name = uniqueFieldName(data.name, data.id || '');
  }
  return data;
}

function bindFieldListSortable(list, onChange) {
  Sortable.create(list, {
    group: {
      name: 'bl-forms-fields',
      put(to, from, dragEl) {
        const type = dragEl.dataset.fieldType || '';
        return !COLUMN_CHILD_BLOCKED.includes(type);
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
      if (item.classList.contains('bl-forms-builder__template')) {
        const prepared = prepareNestedField(type);
        if (!prepared) {
          item.remove();
          return;
        }
        item.replaceWith(createFieldCard(prepared, true));
      } else if (COLUMN_CHILD_BLOCKED.includes(type)) {
        if (evt.from && evt.from !== list) {
          evt.from.insertBefore(item, evt.from.children[evt.oldIndex] || null);
        } else {
          item.remove();
        }
        return;
      }
      onChange();
    },
    onUpdate: onChange,
    onSort: onChange,
  });
}

function widthBadgeText(width, widthCustom = '') {
  if (width === 'auto') {
    return t('widthAuto', 'Auto');
  }
  if (width === 'custom') {
    return (widthCustom || '').trim();
  }
  return `${width}%`;
}

/** Equal width preset for a consecutive column run. */
export function equalWidthForCount(count) {
  if (count <= 1) {
    return '100';
  }
  if (count === 2) {
    return '50';
  }
  if (count === 3) {
    return '33';
  }
  return '25';
}

function applyColumnWidthToCard(el, width, widthCustom = '') {
  el.dataset.fieldWidth = width;
  if (width === 'custom') {
    el.dataset.fieldWidthCustom = widthCustom || '';
  } else {
    delete el.dataset.fieldWidthCustom;
  }
  const badge = el.querySelector(':scope > .bl-forms-builder__field-header .bl-forms-builder__width-badge');
  if (badge) {
    const text = widthBadgeText(width, widthCustom);
    badge.textContent = text;
    badge.hidden = text === '';
  }
}

/**
 * Equalize widths for the consecutive column run that includes `columnEl`.
 * Only call after adding a column.
 */
export function equalizeColumnRun(list, columnEl) {
  const all = Array.from(list.children).filter((el) => el.matches?.('[data-bl-forms-field]'));
  const pos = all.indexOf(columnEl);
  if (pos < 0) {
    return;
  }

  let start = pos;
  let end = pos;
  while (start > 0 && all[start - 1].dataset.fieldType === 'column') {
    start -= 1;
  }
  while (end < all.length - 1 && all[end + 1].dataset.fieldType === 'column') {
    end += 1;
  }

  const run = all.slice(start, end + 1);
  const width = equalWidthForCount(run.length);

  run.forEach((el) => applyColumnWidthToCard(el, width));
}

/**
 * Modal to edit a column's width.
 */
function openColumnWidthModal(field, onApply) {
  document.querySelectorAll('.bl-forms-builder__modal').forEach((node) => node.remove());

  const draft = {
    width: field.width || '100',
    width_custom: field.width_custom || '',
  };

  const backdrop = el('div', {
    className: 'bl-forms-builder__modal',
    role: 'dialog',
    'aria-modal': 'true',
    'aria-label': t('columnWidthTitle', 'Column width'),
  });

  const close = () => {
    document.removeEventListener('keydown', onKey);
    backdrop.remove();
  };

  const apply = () => {
    field.width = draft.width;
    field.width_custom = draft.width === 'custom' ? draft.width_custom : '';
    onApply(field);
    close();
  };

  const onKey = (evt) => {
    if (evt.key === 'Escape') {
      close();
    }
  };
  document.addEventListener('keydown', onKey);

  backdrop.addEventListener('click', (evt) => {
    if (evt.target === backdrop) {
      close();
    }
  });

  const dialog = el('div', { className: 'bl-forms-builder__modal-dialog' });
  const header = el('div', { className: 'bl-forms-builder__modal-header' }, [
    el('h2', {
      className: 'bl-forms-builder__modal-title',
      text: t('columnWidthTitle', 'Column width'),
    }),
  ]);

  const body = el('div', { className: 'bl-forms-builder__modal-body' });
  body.appendChild(
    createWidthControl(draft, () => {
      // draft is mutated by createWidthControl via field reference
    })
  );

  const footer = el('div', { className: 'bl-forms-builder__modal-footer' }, [
    el('button', {
      type: 'button',
      className: 'button',
      text: t('cancel', 'Cancel'),
      onClick: close,
    }),
    el('button', {
      type: 'button',
      className: 'button button-primary',
      text: t('apply', 'Apply'),
      onClick: apply,
    }),
  ]);

  dialog.append(header, body, footer);
  backdrop.appendChild(dialog);
  document.body.appendChild(backdrop);

  const firstBtn = body.querySelector('button, input');
  if (firstBtn) {
    firstBtn.focus();
  }
}

/**
 * Root-level column card with nested fields; width edited via modal.
 */
export function createColumnCard(initial = {}) {
  let field = {
    width: '100',
    width_custom: '',
    children: [],
    ...initial,
    id: initial.id || uid(),
    type: 'column',
  };

  const row = el('div', {
    className: 'bl-forms-builder__field bl-forms-builder__column-card',
    dataset: {
      blFormsField: '1',
      fieldId: field.id,
      fieldType: 'column',
      fieldWidth: field.width || '100',
      ...(field.width === 'custom' && field.width_custom
        ? { fieldWidthCustom: field.width_custom }
        : {}),
    },
  });

  const preview = el('span', {
    className: 'bl-forms-builder__preview',
    text: (window.blFormsAdmin?.i18n?.types?.column) || t('columnType', 'Column'),
  });
  const widthBadge = el('span', { className: 'bl-forms-builder__width-badge' });
  const typeChip = el('span', { className: 'bl-forms-builder__field-type bl-forms-builder__field-type--column' }, [
    iconEl('column', 'bl-forms-builder__field-type-icon'),
    el('span', {
      className: 'bl-forms-builder__field-type-label',
      text: (window.blFormsAdmin?.i18n?.types?.column) || t('columnType', 'Column'),
    }),
  ]);

  const fieldsList = el('div', {
    className: 'bl-forms-builder__column-fields',
    dataset: { blColumnFields: '1' },
  });
  const emptyHint = el('p', {
    className: 'description bl-forms-builder__column-empty',
    text: t('columnEmpty', 'Drop fields here'),
  });

  const syncEmpty = () => {
    emptyHint.hidden = fieldsList.querySelector('[data-bl-forms-field]') != null;
  };

  const updatePreview = () => {
    const width = field.width || '100';
    const widthCustom = field.width_custom || '';
    row.dataset.fieldWidth = width;
    if (width === 'custom') {
      row.dataset.fieldWidthCustom = widthCustom || '';
    } else {
      delete row.dataset.fieldWidthCustom;
    }
    const text = widthBadgeText(width, widthCustom);
    widthBadge.textContent = text;
    widthBadge.hidden = text === '';
  };

  const notify = () => document.dispatchEvent(new CustomEvent('bl-forms-builder-changed'));

  const openWidthModal = () => {
    openColumnWidthModal(field, () => {
      updatePreview();
      notify();
    });
  };

  const editBtn = el('button', {
    type: 'button',
    className: 'bl-forms-builder__icon-btn bl-forms-builder__field-edit',
    title: t('columnWidthTitle', 'Column width'),
    'aria-label': t('columnWidthTitle', 'Column width'),
    onClick: openWidthModal,
  });
  const editIcon = iconEl('edit');
  if (editIcon.innerHTML) {
    editBtn.appendChild(editIcon);
  } else {
    editBtn.textContent = '✎';
  }

  const deleteBtn = el('button', {
    type: 'button',
    className: 'bl-forms-builder__icon-btn bl-forms-builder__icon-btn--danger',
    title: t('delete', 'Delete'),
    'aria-label': t('delete', 'Delete'),
    onClick: () => {
      row.remove();
      notify();
    },
  });
  const trashIcon = iconEl('trash');
  if (trashIcon.innerHTML) {
    deleteBtn.appendChild(trashIcon);
  } else {
    deleteBtn.textContent = '×';
  }

  const handle = el('span', {
    className: 'bl-forms-builder__handle',
    title: t('dragField', 'Drag to reorder'),
    'aria-hidden': 'true',
  });
  const dragIcon = iconEl('drag');
  if (dragIcon.innerHTML) {
    handle.appendChild(dragIcon);
  } else {
    handle.textContent = '⋮⋮';
  }

  (field.children || []).forEach((child) => {
    fieldsList.appendChild(createFieldCard(child, false));
  });
  bindFieldListSortable(fieldsList, () => {
    syncEmpty();
    notify();
  });

  const fieldsWrap = el('div', { className: 'bl-forms-builder__column-fields-wrap' }, [
    fieldsList,
    emptyHint,
  ]);
  syncEmpty();

  // Clicking the width badge also opens the modal.
  widthBadge.style.cursor = 'pointer';
  widthBadge.title = t('columnWidthTitle', 'Column width');
  widthBadge.addEventListener('click', openWidthModal);

  const header = el('div', { className: 'bl-forms-builder__field-header' }, [
    preview,
    el('div', { className: 'bl-forms-builder__field-meta' }, [widthBadge, typeChip]),
    editBtn,
    deleteBtn,
    handle,
  ]);

  row.append(header, fieldsWrap);
  updatePreview();

  return row;
}

export function serializeLayoutRow(row) {
  const type = row.dataset.fieldType || '';
  const id = row.dataset.fieldId || uid();

  if (type !== 'column') {
    return null;
  }

  const fields = row.querySelector('[data-bl-column-fields]');
  const width = row.dataset.fieldWidth || '100';
  const widthCustom = row.dataset.fieldWidthCustom || '';

  return {
    id,
    type: 'column',
    width,
    width_custom: width === 'custom' ? widthCustom : '',
    children: Array.from(fields?.children || [])
      .filter((el) => el.matches('[data-bl-forms-field]') && el.dataset.fieldType !== 'column')
      .map((child) => serializeRow(child)),
  };
}
