/**
 * Blocks-only repeater field card for the definition canvas.
 * Nested repeaters allowed up to depth 3 (UI blocks level 4).
 */
const {
  el,
  t,
  uid,
  iconEl,
  defaultField,
  uniqueFieldName,
  cloneFieldData,
  createFieldCard,
  serializeRow,
  openLayoutSettingsModal,
  normalizeConditionalLogic,
} = window.BlFormBuilder || {};

export const REPEATER_MAX_DEPTH = 3;

const LAYOUT_BLOCKED = ['column', 'section', 'group'];

/** @type {WeakMap<HTMLElement, object>} */
const repeaterFieldByEl = new WeakMap();

function createNestedSortable(list, options) {
  const Builder = window.BlCanvasBuilder;
  if (!Builder || typeof Builder.createSortable !== 'function') {
    console.error('BlCanvasBuilder.createSortable is required for repeater field lists');
    return null;
  }
  return Builder.createSortable(list, options);
}

function notifyChanged() {
  document.dispatchEvent(new CustomEvent('bl-forms-builder-changed'));
}

function typeLabel(type) {
  const dict = (window.blFormsAdmin && window.blFormsAdmin.i18n) || {};
  if (dict.types && dict.types[type]) {
    return dict.types[type];
  }
  if (type === 'repeater') {
    return t('repeaterType', 'Repeater');
  }
  return type;
}

function prepareChildField(typeOrData, depth) {
  const data = typeof typeOrData === 'string' ? defaultFieldForBlocks(typeOrData) : { ...typeOrData };
  if (LAYOUT_BLOCKED.includes(data.type)) {
    return null;
  }
  if (data.type === 'repeater' && depth >= REPEATER_MAX_DEPTH) {
    return null;
  }
  if (data.name != null && data.name_manual === false) {
    data.name = uniqueFieldName(data.label || data.name || data.type || 'field', data.id || '');
  } else if (data.name) {
    data.name = uniqueFieldName(data.name, data.id || '');
  }
  return data;
}

/**
 * Blocks-local defaults (Forms defaultField does not know repeater).
 */
export function defaultRepeater(partial = {}) {
  const id = partial.id || uid();
  return {
    id,
    type: 'repeater',
    label: partial.label || typeLabel('repeater'),
    name: partial.name || 'items',
    name_manual: partial.name_manual != null ? !!partial.name_manual : false,
    hide_label: !!partial.hide_label,
    show_title: partial.show_title !== false && partial.show_title !== 0 && partial.show_title !== '0',
    active: partial.active !== false,
    required: !!partial.required,
    description: partial.description || '',
    css_class: partial.css_class || '',
    design: ['standard', 'outline', 'card'].includes(partial.design) ? partial.design : 'standard',
    width: partial.width || '100',
    width_custom: partial.width_custom || '',
    min_rows: Math.max(0, parseInt(partial.min_rows, 10) || 0),
    max_rows: Math.max(0, parseInt(partial.max_rows, 10) || 0),
    button_label: partial.button_label || '',
    conditional_logic: normalizeConditionalLogic(partial.conditional_logic),
    children: Array.isArray(partial.children) ? partial.children : [],
  };
}

function defaultFieldForBlocks(type) {
  if (type === 'repeater') {
    return defaultRepeater();
  }
  return defaultField(type);
}

function serializeChildCard(row) {
  if ((row.dataset.fieldType || '') === 'repeater') {
    return serializeRepeaterRow(row);
  }
  return serializeRow(row);
}

function bindRepeaterChildList(list, depth, onChange) {
  const Builder = window.BlCanvasBuilder;
  const onStart = Builder?.dragStart || (() => {});
  const onEnd = Builder?.dragEnd || (() => {});

  createNestedSortable(list, {
    group: {
      name: 'bl-blocks-fields',
      put(to, from, dragEl) {
        const type = dragEl.dataset.fieldType || '';
        if (LAYOUT_BLOCKED.includes(type)) {
          return false;
        }
        if (type === 'repeater' && depth >= REPEATER_MAX_DEPTH) {
          return false;
        }
        return true;
      },
    },
    handle: '.bl-forms-builder__handle',
    animation: 150,
    draggable: '.bl-forms-builder__field, .bl-forms-builder__template',
    onStart,
    onEnd,
    onAdd(evt) {
      const item = evt.item;
      const type = item.dataset.fieldType || 'text';
      if (item.classList.contains('bl-forms-builder__template')) {
        const prepared = prepareChildField(type, depth);
        if (!prepared) {
          item.remove();
          return;
        }
        const card =
          prepared.type === 'repeater'
            ? createRepeaterCard(prepared, true, depth + 1)
            : createFieldCard(prepared, true);
        item.replaceWith(card);
        onChange();
        return;
      }
      if (LAYOUT_BLOCKED.includes(type)) {
        if (evt.from && evt.from !== list) {
          evt.from.insertBefore(item, evt.from.children[evt.oldIndex] || null);
        } else {
          item.remove();
        }
        return;
      }
      if (type === 'repeater') {
        const itemDepth = parseInt(item.dataset.repeaterDepth || '1', 10);
        if (depth >= REPEATER_MAX_DEPTH || itemDepth > REPEATER_MAX_DEPTH) {
          if (evt.from && evt.from !== list) {
            evt.from.insertBefore(item, evt.from.children[evt.oldIndex] || null);
          } else {
            item.remove();
          }
          return;
        }
        const data = serializeRepeaterRow(item);
        if (depth + 1 > REPEATER_MAX_DEPTH) {
          if (evt.from && evt.from !== list) {
            evt.from.insertBefore(item, evt.from.children[evt.oldIndex] || null);
          } else {
            item.remove();
          }
          return;
        }
        item.replaceWith(createRepeaterCard(data, false, depth + 1));
      }
      onChange();
    },
    onUpdate: onChange,
    onSort: onChange,
  });
}

/**
 * @param {object} initial
 * @param {boolean} open
 * @param {number} depth 1-based depth of this repeater
 */
export function createRepeaterCard(initial = {}, open = false, depth = 1) {
  if (depth > REPEATER_MAX_DEPTH) {
    depth = REPEATER_MAX_DEPTH;
  }

  let field = defaultRepeater(initial);
  field = {
    ...field,
    ...initial,
    id: initial.id || field.id,
    type: 'repeater',
    children: Array.isArray(initial.children) ? initial.children : field.children,
  };
  field = defaultRepeater(field);

  const row = el('div', {
    className: 'bl-forms-builder__field bl-forms-builder__repeater-card',
    dataset: {
      blFormsField: '1',
      fieldId: field.id,
      fieldType: 'repeater',
      repeaterDepth: String(depth),
      fieldWidth: field.width || '100',
      fieldDesign: field.design || 'standard',
      fieldShowTitle: field.show_title ? '1' : '0',
    },
  });
  repeaterFieldByEl.set(row, field);

  const labelPlaceholder = () =>
    field.show_title
      ? t('sectionLabelPlaceholder', 'Title')
      : t('sectionLabelPlaceholderHidden', 'Name');

  const labelInput = el('input', {
    type: 'text',
    className: 'bl-forms-builder__section-label-input',
    value: field.label || '',
    placeholder: labelPlaceholder(),
    'aria-label': t('repeaterLabel', 'Repeater label'),
  });
  labelInput.addEventListener('input', () => {
    field.label = labelInput.value;
    if (!field.name_manual) {
      field.name = uniqueFieldName(field.label || 'items', field.id);
    }
    notifyChanged();
  });

  const typeLabelText = () => typeLabel('repeater') + (depth > 1 ? ` (${depth})` : '');

  const typeChip = el('span', { className: 'bl-forms-builder__field-type' });

  const settingsBtn = el('button', {
    type: 'button',
    className: 'bl-forms-builder__design-btn',
    title: t('layoutSettingsTitle', 'Settings'),
    'aria-label': t('layoutSettingsTitle', 'Settings'),
  });
  settingsBtn.appendChild(iconEl('tune', 'bl-forms-builder__design-btn-icon'));

  const fieldsList = el('div', {
    className: 'bl-forms-builder__repeater-fields',
    dataset: { blRepeaterFields: '1', repeaterDepth: String(depth) },
  });
  const emptyHint = el('p', {
    className: 'description bl-forms-builder__section-empty',
    text:
      depth >= REPEATER_MAX_DEPTH
        ? t('repeaterEmptyMaxDepth', 'Drop fields here (nested repeater not allowed at this depth)')
        : t('repeaterEmpty', 'Drop fields or a nested repeater here'),
  });

  const syncEmpty = () => {
    emptyHint.hidden = fieldsList.querySelector('[data-bl-forms-field]') != null;
  };

  const onListChange = () => {
    syncEmpty();
    notifyChanged();
  };

  (field.children || []).forEach((child) => {
    if ((child?.type || '') === 'repeater') {
      if (depth >= REPEATER_MAX_DEPTH) {
        return;
      }
      fieldsList.appendChild(createRepeaterCard(child, false, depth + 1));
      return;
    }
    fieldsList.appendChild(createFieldCard(child, false));
  });

  bindRepeaterChildList(fieldsList, depth, onListChange);

  const fieldsWrap = el('div', { className: 'bl-forms-builder__repeater-fields-wrap' }, [
    fieldsList,
    emptyHint,
  ]);
  syncEmpty();

  const updatePreview = () => {
    row.dataset.fieldWidth = field.width || '100';
    row.dataset.fieldDesign = field.design || 'standard';
    row.dataset.fieldShowTitle = field.show_title ? '1' : '0';
    labelInput.placeholder = labelPlaceholder();

    const typeChildren = [
      iconEl('repeater', 'bl-forms-builder__field-type-icon'),
      el('span', {
        className: 'bl-forms-builder__field-type-label',
        text: typeLabelText(),
      }),
    ];
    const logic = field.conditional_logic;
    if (logic && logic.enabled && Array.isArray(logic.groups) && logic.groups.length > 0) {
      typeChildren.push(
        el('span', {
          className: 'bl-forms-builder__field-logic-dot',
          title: t('logicEnable', 'Conditional logic'),
          'aria-label': t('logicEnable', 'Conditional logic'),
        })
      );
    }
    typeChip.replaceChildren(...typeChildren);
  };

  settingsBtn.addEventListener('click', () => {
    openLayoutSettingsModal(
      field,
      () => {
        updatePreview();
        notifyChanged();
      },
      {
        tabs: ['settings', 'design', 'logic'],
        withHideTitle: true,
        withWidth: true,
        logicHelp: t(
          'logicHelpRepeater',
          'Show this repeater only when the conditions below are met.'
        ),
      }
    );
  });

  const duplicateBtn = el('button', {
    type: 'button',
    className: 'bl-forms-builder__icon-btn',
    title: t('duplicate', 'Duplicate'),
    'aria-label': t('duplicate', 'Duplicate'),
    onClick: () => {
      const data = serializeRepeaterRow(row);
      const clone = cloneFieldData(data);
      const copy = createRepeaterCard(clone, false, depth);
      row.after(copy);
      notifyChanged();
    },
  });
  const dupIcon = iconEl('duplicate');
  if (dupIcon.innerHTML) duplicateBtn.appendChild(dupIcon);
  else duplicateBtn.textContent = '⧉';

  const deleteBtn = el('button', {
    type: 'button',
    className: 'bl-forms-builder__icon-btn bl-forms-builder__icon-btn--danger',
    title: t('delete', 'Delete'),
    'aria-label': t('delete', 'Delete'),
    onClick: () => {
      row.remove();
      notifyChanged();
    },
  });
  const trashIcon = iconEl('trash');
  if (trashIcon.innerHTML) deleteBtn.appendChild(trashIcon);
  else deleteBtn.textContent = '×';

  const handle = el('span', {
    className: 'bl-forms-builder__handle',
    title: t('dragField', 'Drag to reorder'),
    'aria-hidden': 'true',
  });
  const dragIcon = iconEl('drag');
  if (dragIcon.innerHTML) handle.appendChild(dragIcon);
  else handle.textContent = '⋮⋮';

  const header = el('div', { className: 'bl-forms-builder__field-header' }, [
    labelInput,
    el('div', { className: 'bl-forms-builder__field-meta' }, [settingsBtn, typeChip]),
    el('div', { className: 'bl-forms-builder__field-actions' }, [duplicateBtn, deleteBtn, handle]),
  ]);

  row.append(header, fieldsWrap);
  updatePreview();

  if (open) {
    labelInput.focus();
  }

  return row;
}

export function serializeRepeaterRow(row) {
  const live = repeaterFieldByEl.get(row);
  const id = row.dataset.fieldId || live?.id || uid();
  const labelInput = row.querySelector(
    ':scope > .bl-forms-builder__field-header .bl-forms-builder__section-label-input'
  );
  const fields = row.querySelector(
    ':scope > .bl-forms-builder__repeater-fields-wrap [data-bl-repeater-fields]'
  );

  const children = Array.from(fields?.children || [])
    .filter((node) => node.matches('[data-bl-forms-field]'))
    .filter((node) => !LAYOUT_BLOCKED.includes(node.dataset.fieldType || ''))
    .map((child) => serializeChildCard(child));

  const design = row.dataset.fieldDesign || live?.design || 'standard';
  const showTitle =
    row.dataset.fieldShowTitle !== undefined
      ? row.dataset.fieldShowTitle !== '0'
      : live?.show_title !== false;

  return {
    id,
    type: 'repeater',
    label: labelInput?.value ?? live?.label ?? '',
    name: (live?.name || 'items').trim() || 'items',
    name_manual: live?.name_manual !== false,
    hide_label: !!live?.hide_label,
    show_title: showTitle,
    active: live?.active !== false,
    required: !!live?.required,
    description: live?.description || '',
    css_class: live?.css_class || '',
    design: ['standard', 'outline', 'card'].includes(design) ? design : 'standard',
    width: row.dataset.fieldWidth || live?.width || '100',
    width_custom: live?.width === 'custom' || row.dataset.fieldWidth === 'custom' ? live?.width_custom || '' : '',
    min_rows: Math.max(0, parseInt(live?.min_rows ?? 0, 10) || 0),
    max_rows: Math.max(0, parseInt(live?.max_rows ?? 0, 10) || 0),
    button_label: live?.button_label ?? '',
    conditional_logic: normalizeConditionalLogic(live?.conditional_logic),
    children,
  };
}
