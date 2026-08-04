import { el, t, uid, iconEl, defaultField, uniqueFieldName } from './dom.js';
import { createFieldCard, serializeRow, openFieldWidthModal, openLayoutSettingsModal, duplicateFieldCard } from './field-card.js';
import { normalizeConditionalLogic } from './conditional-logic.js';

/** Types that cannot be nested inside columns, sections, or tabs. */
const NESTED_BLOCKED = ['column', 'section', 'tab', 'hidden', 'honeypot', 'captcha'];

/** Live column field objects keyed by card element (keeps equalize + modal in sync). */
const columnFieldByEl = new WeakMap();

/** Live section field objects keyed by card element. */
const sectionFieldByEl = new WeakMap();

/** Live tab field objects keyed by card element. */
const tabFieldByEl = new WeakMap();

/**
 * Use the canvas-builder Sortable instance so nested lists share the same group
 * registry as the root canvas (separate Sortable bundles cannot cross-drag).
 */
function createNestedSortable(list, options) {
  const Builder = window.BlCanvasBuilder;
  if (!Builder || typeof Builder.createSortable !== 'function') {
    console.error('BlCanvasBuilder.createSortable is required for nested field lists');
    return null;
  }
  return Builder.createSortable(list, options);
}

function prepareNestedField(typeOrData) {
  const data = typeof typeOrData === 'string' ? defaultField(typeOrData) : { ...typeOrData };
  if (NESTED_BLOCKED.includes(data.type)) {
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
  const Builder = window.BlCanvasBuilder;
  const onStart = Builder?.dragStart || (() => {});
  const onEnd = Builder?.dragEnd || (() => {});

  createNestedSortable(list, {
    group: {
      name: 'bl-forms-fields',
      put(to, from, dragEl) {
        const type = dragEl.dataset.fieldType || '';
        return !NESTED_BLOCKED.includes(type);
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
        const prepared = prepareNestedField(type);
        if (!prepared) {
          item.remove();
          return;
        }
        item.replaceWith(createFieldCard(prepared, true));
      } else if (NESTED_BLOCKED.includes(type)) {
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
  const field = columnFieldByEl.get(el);
  if (field) {
    field.width = width;
    field.width_custom = width === 'custom' ? widthCustom || '' : '';
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

function createDragHandle() {
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
  return handle;
}

function isCollapsedFlag(value) {
  return value === true || value === 1 || value === '1' || value === 'true';
}

/**
 * Collapse/expand nested fields for column, section, tab, and repeater cards.
 * Persists on `field.collapsed` (default: expanded).
 */
function createContainerCollapseBtn(row, field, onChange) {
  field.collapsed = isCollapsedFlag(field.collapsed);

  const btn = el('button', {
    type: 'button',
    className: 'bl-forms-builder__icon-btn bl-forms-builder__container-collapse',
  });

  const sync = () => {
    const collapsed = !!field.collapsed;
    row.classList.toggle('is-collapsed', collapsed);
    btn.setAttribute('aria-expanded', collapsed ? 'false' : 'true');
    const label = collapsed
      ? t('expandGroup', 'Expand')
      : t('collapseGroup', 'Collapse');
    btn.title = label;
    btn.setAttribute('aria-label', label);
    // Expanded → collapse-content; collapsed → expand-content.
    const icon = iconEl(
      collapsed ? 'expandContent' : 'collapseContent',
      'bl-forms-builder__container-collapse-icon'
    );
    btn.replaceChildren();
    if (icon.innerHTML) {
      btn.appendChild(icon);
    } else {
      btn.textContent = collapsed ? '›' : '▾';
    }
  };

  btn.addEventListener('click', (evt) => {
    evt.preventDefault();
    evt.stopPropagation();
    field.collapsed = !field.collapsed;
    sync();
    if (typeof onChange === 'function') {
      onChange();
    }
  });

  sync();
  return btn;
}

function createContainerActions(onDelete, onDuplicate, collapseBtn = null) {
  const duplicateBtn = el('button', {
    type: 'button',
    className: 'bl-forms-builder__icon-btn',
    title: t('duplicate', 'Duplicate'),
    'aria-label': t('duplicate', 'Duplicate'),
    onClick: onDuplicate,
  });
  const duplicateIcon = iconEl('duplicate');
  if (duplicateIcon.innerHTML) {
    duplicateBtn.appendChild(duplicateIcon);
  } else {
    duplicateBtn.textContent = '⧉';
  }

  const deleteBtn = el('button', {
    type: 'button',
    className: 'bl-forms-builder__icon-btn bl-forms-builder__icon-btn--danger',
    title: t('delete', 'Delete'),
    'aria-label': t('delete', 'Delete'),
    onClick: onDelete,
  });
  const trashIcon = iconEl('trash');
  if (trashIcon.innerHTML) {
    deleteBtn.appendChild(trashIcon);
  } else {
    deleteBtn.textContent = '×';
  }

  const items = [];
  if (collapseBtn) {
    items.push(collapseBtn);
  }
  items.push(duplicateBtn, deleteBtn);
  return el('div', { className: 'bl-forms-builder__field-actions' }, items);
}

/**
 * Root-level column card with nested fields; width edited via modal.
 */
export function createColumnCard(initial = {}) {
  let field = {
    width: '100',
    width_custom: '',
    children: [],
    design: 'standard',
    css_class: '',
    collapsed: false,
    conditional_logic: { enabled: false, groups: [] },
    ...initial,
    id: initial.id || uid(),
    type: 'column',
  };
  if (!['standard', 'outline', 'card'].includes(field.design)) {
    field.design = 'standard';
  }
  if (typeof field.css_class !== 'string') {
    field.css_class = '';
  }
  field.collapsed = isCollapsedFlag(field.collapsed);
  field.conditional_logic = normalizeConditionalLogic(field.conditional_logic);

  const row = el('div', {
    className: 'bl-forms-builder__field bl-forms-builder__column-card',
    dataset: {
      blFormsField: '1',
      fieldId: field.id,
      fieldType: 'column',
      fieldWidth: field.width || '100',
      fieldDesign: field.design || 'standard',
      ...(field.width === 'custom' && field.width_custom
        ? { fieldWidthCustom: field.width_custom }
        : {}),
    },
  });
  columnFieldByEl.set(row, field);

  const preview = el('span', {
    className: 'bl-forms-builder__preview',
    text: (window.blFormsAdmin?.i18n?.types?.column) || t('columnType', 'Columns'),
  });
  const widthBadge = el('span', { className: 'bl-forms-builder__width-badge' });
  const designBtn = el('button', {
    type: 'button',
    className: 'bl-forms-builder__design-btn',
    title: t('layoutSettingsTitle', 'Settings'),
    'aria-label': t('layoutSettingsTitle', 'Settings'),
  });
  designBtn.appendChild(iconEl('tune', 'bl-forms-builder__design-btn-icon'));

  const typeChip = el('span', { className: 'bl-forms-builder__field-type bl-forms-builder__field-type--column' });

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
    const design = field.design || 'standard';
    row.dataset.fieldWidth = width;
    row.dataset.fieldDesign = design;
    if (width === 'custom') {
      row.dataset.fieldWidthCustom = widthCustom || '';
    } else {
      delete row.dataset.fieldWidthCustom;
    }
    const text = widthBadgeText(width, widthCustom);
    widthBadge.textContent = text;
    widthBadge.hidden = text === '';

    const typeChildren = [
      iconEl('column', 'bl-forms-builder__field-type-icon'),
      el('span', {
        className: 'bl-forms-builder__field-type-label',
        text: (window.blFormsAdmin?.i18n?.types?.column) || t('columnType', 'Columns'),
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

  const notify = () => document.dispatchEvent(new CustomEvent('bl-forms-builder-changed'));

  const openWidthModal = () => {
    openFieldWidthModal(field, () => {
      updatePreview();
      notify();
    });
  };

  const openDesignModal = () => {
    openLayoutSettingsModal(
      field,
      () => {
        updatePreview();
        notify();
      },
      {
        tabs: ['design', 'logic'],
        logicHelp: t(
          'logicHelpColumn',
          'Show this column only when the conditions below are met.'
        ),
      }
    );
  };

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

  widthBadge.classList.add('is-interactive');
  widthBadge.title = t('columnWidthTitle', 'Column width');
  widthBadge.addEventListener('click', openWidthModal);
  designBtn.addEventListener('click', openDesignModal);

  const header = el('div', { className: 'bl-forms-builder__field-header' }, [
    createDragHandle(),
    preview,
    el('div', { className: 'bl-forms-builder__field-meta' }, [widthBadge, designBtn, typeChip]),
    createContainerActions(
      () => {
        row.remove();
        notify();
      },
      () => duplicateFieldCard(row),
      createContainerCollapseBtn(row, field, notify)
    ),
  ]);

  row.append(header, fieldsWrap);
  updatePreview();

  return row;
}

/**
 * Root-level section card with a label and nested fields (one level).
 */
export function createSectionCard(initial = {}) {
  let field = {
    label: '',
    children: [],
    width: '100',
    width_custom: '',
    design: 'standard',
    show_title: true,
    css_class: '',
    collapsed: false,
    conditional_logic: { enabled: false, groups: [] },
    ...initial,
    id: initial.id || uid(),
    type: 'section',
  };
  if (!['standard', 'outline', 'card'].includes(field.design)) {
    field.design = 'standard';
  }
  if (field.show_title === false || field.show_title === 0 || field.show_title === '0') {
    field.show_title = false;
  } else {
    field.show_title = true;
  }
  if (typeof field.css_class !== 'string') {
    field.css_class = '';
  }
  field.collapsed = isCollapsedFlag(field.collapsed);
  field.conditional_logic = normalizeConditionalLogic(field.conditional_logic);

  const row = el('div', {
    className: 'bl-forms-builder__field bl-forms-builder__section-card',
    dataset: {
      blFormsField: '1',
      fieldId: field.id,
      fieldType: 'section',
      fieldWidth: field.width || '100',
      fieldDesign: field.design || 'standard',
      fieldShowTitle: field.show_title ? '1' : '0',
      ...(field.width === 'custom' && field.width_custom
        ? { fieldWidthCustom: field.width_custom }
        : {}),
    },
  });
  sectionFieldByEl.set(row, field);

  const preview = el('span', { className: 'bl-forms-builder__preview' });

  const widthBadge = el('span', { className: 'bl-forms-builder__width-badge' });
  const designBtn = el('button', {
    type: 'button',
    className: 'bl-forms-builder__design-btn',
    title: t('layoutSettingsTitle', 'Settings'),
    'aria-label': t('layoutSettingsTitle', 'Settings'),
  });
  designBtn.appendChild(iconEl('tune', 'bl-forms-builder__design-btn-icon'));

  const typeChip = el('span', {
    className: 'bl-forms-builder__field-type bl-forms-builder__field-type--section',
  });

  const fieldsList = el('div', {
    className: 'bl-forms-builder__section-fields',
    dataset: { blSectionFields: '1' },
  });
  const emptyHint = el('p', {
    className: 'description bl-forms-builder__section-empty',
    text: t('sectionEmpty', 'Drop fields here'),
  });

  const syncEmpty = () => {
    emptyHint.hidden = fieldsList.querySelector('[data-bl-forms-field]') != null;
  };

  const updatePreview = () => {
    const width = field.width || '100';
    const widthCustom = field.width_custom || '';
    const design = field.design || 'standard';
    row.dataset.fieldWidth = width;
    row.dataset.fieldDesign = design;
    row.dataset.fieldShowTitle = field.show_title ? '1' : '0';
    if (width === 'custom') {
      row.dataset.fieldWidthCustom = widthCustom || '';
    } else {
      delete row.dataset.fieldWidthCustom;
    }
    const title = (field.label || '').trim();
    preview.textContent = title;
    preview.hidden = title === '';
    const text = widthBadgeText(width, widthCustom);
    widthBadge.textContent = text;
    widthBadge.hidden = text === '';

    const typeChildren = [
      iconEl('section', 'bl-forms-builder__field-type-icon'),
      el('span', {
        className: 'bl-forms-builder__field-type-label',
        text: (window.blFormsAdmin?.i18n?.types?.section) || t('sectionType', 'Section'),
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

  const notify = () => document.dispatchEvent(new CustomEvent('bl-forms-builder-changed'));

  const openWidthModal = () => {
    openFieldWidthModal(field, () => {
      updatePreview();
      notify();
    });
  };

  const openDesignModal = () => {
    openLayoutSettingsModal(
      field,
      () => {
        updatePreview();
        notify();
      },
      {
        tabs: ['settings', 'design', 'logic'],
        withLabel: true,
        withHideTitle: true,
        onLiveUpdate: () => {
          updatePreview();
          notify();
        },
        logicHelp: t(
          'logicHelpSection',
          'Show this section only when the conditions below are met.'
        ),
      }
    );
  };

  (field.children || []).forEach((child) => {
    fieldsList.appendChild(createFieldCard(child, false));
  });
  bindFieldListSortable(fieldsList, () => {
    syncEmpty();
    notify();
  });

  const fieldsWrap = el('div', { className: 'bl-forms-builder__section-fields-wrap' }, [
    fieldsList,
    emptyHint,
  ]);
  syncEmpty();

  widthBadge.classList.add('is-interactive');
  widthBadge.title = t('sectionWidthTitle', 'Section width');
  widthBadge.addEventListener('click', openWidthModal);
  designBtn.addEventListener('click', openDesignModal);

  const header = el('div', { className: 'bl-forms-builder__field-header' }, [
    createDragHandle(),
    preview,
    el('div', { className: 'bl-forms-builder__field-meta' }, [widthBadge, designBtn, typeChip]),
    createContainerActions(
      () => {
        row.remove();
        notify();
      },
      () => duplicateFieldCard(row),
      createContainerCollapseBtn(row, field, notify)
    ),
  ]);

  row.append(header, fieldsWrap);
  updatePreview();
  return row;
}

/**
 * Root-level tab card with a label and nested fields (one level).
 * Consecutive sibling tabs render as one tab bar at runtime.
 */
export function createTabCard(initial = {}) {
  let field = {
    label: '',
    children: [],
    width: '100',
    width_custom: '',
    design: 'standard',
    css_class: '',
    collapsed: false,
    conditional_logic: { enabled: false, groups: [] },
    ...initial,
    id: initial.id || uid(),
    type: 'tab',
  };
  if (!['standard', 'outline', 'card'].includes(field.design)) {
    field.design = 'standard';
  }
  if (typeof field.css_class !== 'string') {
    field.css_class = '';
  }
  field.collapsed = isCollapsedFlag(field.collapsed);
  field.conditional_logic = normalizeConditionalLogic(field.conditional_logic);

  const row = el('div', {
    className: 'bl-forms-builder__field bl-forms-builder__tab-card',
    dataset: {
      blFormsField: '1',
      fieldId: field.id,
      fieldType: 'tab',
      fieldWidth: field.width || '100',
      fieldDesign: field.design || 'standard',
      ...(field.width === 'custom' && field.width_custom
        ? { fieldWidthCustom: field.width_custom }
        : {}),
    },
  });
  tabFieldByEl.set(row, field);

  const preview = el('span', { className: 'bl-forms-builder__preview' });

  const widthBadge = el('span', { className: 'bl-forms-builder__width-badge' });
  const designBtn = el('button', {
    type: 'button',
    className: 'bl-forms-builder__design-btn',
    title: t('layoutSettingsTitle', 'Settings'),
    'aria-label': t('layoutSettingsTitle', 'Settings'),
  });
  designBtn.appendChild(iconEl('tune', 'bl-forms-builder__design-btn-icon'));

  const typeChip = el('span', {
    className: 'bl-forms-builder__field-type bl-forms-builder__field-type--tab',
  });

  const fieldsList = el('div', {
    className: 'bl-forms-builder__tab-fields',
    dataset: { blTabFields: '1' },
  });
  const emptyHint = el('p', {
    className: 'description bl-forms-builder__tab-empty',
    text: t('tabEmpty', 'Drop fields here'),
  });

  const syncEmpty = () => {
    emptyHint.hidden = fieldsList.querySelector('[data-bl-forms-field]') != null;
  };

  const updatePreview = () => {
    const width = field.width || '100';
    const widthCustom = field.width_custom || '';
    const design = field.design || 'standard';
    row.dataset.fieldWidth = width;
    row.dataset.fieldDesign = design;
    if (width === 'custom') {
      row.dataset.fieldWidthCustom = widthCustom || '';
    } else {
      delete row.dataset.fieldWidthCustom;
    }
    const title = (field.label || '').trim();
    preview.textContent = title;
    preview.hidden = title === '';
    const text = widthBadgeText(width, widthCustom);
    widthBadge.textContent = text;
    widthBadge.hidden = text === '';

    const typeChildren = [
      iconEl('tab', 'bl-forms-builder__field-type-icon'),
      el('span', {
        className: 'bl-forms-builder__field-type-label',
        text: (window.blFormsAdmin?.i18n?.types?.tab) || t('tabType', 'Tab'),
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

  const notify = () => document.dispatchEvent(new CustomEvent('bl-forms-builder-changed'));

  const openWidthModal = () => {
    openFieldWidthModal(field, () => {
      updatePreview();
      notify();
    });
  };

  const openDesignModal = () => {
    openLayoutSettingsModal(
      field,
      () => {
        updatePreview();
        notify();
      },
      {
        tabs: ['settings', 'logic'],
        withLabel: true,
        withHideTitle: false,
        onLiveUpdate: () => {
          updatePreview();
          notify();
        },
        logicHelp: t('logicHelpTab', 'Show this tab only when the conditions below are met.'),
      }
    );
  };

  (field.children || []).forEach((child) => {
    fieldsList.appendChild(createFieldCard(child, false));
  });
  bindFieldListSortable(fieldsList, () => {
    syncEmpty();
    notify();
  });

  const fieldsWrap = el('div', { className: 'bl-forms-builder__tab-fields-wrap' }, [
    fieldsList,
    emptyHint,
  ]);
  syncEmpty();

  widthBadge.classList.add('is-interactive');
  widthBadge.title = t('tabWidthTitle', 'Tab width');
  widthBadge.addEventListener('click', openWidthModal);
  designBtn.addEventListener('click', openDesignModal);

  const header = el('div', { className: 'bl-forms-builder__field-header' }, [
    createDragHandle(),
    preview,
    el('div', { className: 'bl-forms-builder__field-meta' }, [widthBadge, designBtn, typeChip]),
    createContainerActions(
      () => {
        row.remove();
        notify();
      },
      () => duplicateFieldCard(row),
      createContainerCollapseBtn(row, field, notify)
    ),
  ]);

  row.append(header, fieldsWrap);
  updatePreview();
  return row;
}

export function serializeLayoutRow(row) {
  const type = row.dataset.fieldType || '';
  const id = row.dataset.fieldId || uid();

  if (type === 'column') {
    const fields = row.querySelector('[data-bl-column-fields]');
    const live = columnFieldByEl.get(row);
    const width = row.dataset.fieldWidth || live?.width || '100';
    const widthCustom = row.dataset.fieldWidthCustom || live?.width_custom || '';
    const design = row.dataset.fieldDesign || live?.design || 'standard';
    const cssClass = typeof live?.css_class === 'string' ? live.css_class : '';

    return {
      id,
      type: 'column',
      width,
      width_custom: width === 'custom' ? widthCustom : '',
      design,
      css_class: cssClass,
      collapsed: !!live?.collapsed,
      conditional_logic: normalizeConditionalLogic(live?.conditional_logic),
      children: Array.from(fields?.children || [])
        .filter((el) => el.matches('[data-bl-forms-field]') && !NESTED_BLOCKED.includes(el.dataset.fieldType))
        .map((child) => serializeRow(child)),
    };
  }

  if (type === 'section') {
    const fields = row.querySelector('[data-bl-section-fields]');
    const live = sectionFieldByEl.get(row);
    const label = live?.label ?? '';
    const width = row.dataset.fieldWidth || live?.width || '100';
    const widthCustom = row.dataset.fieldWidthCustom || live?.width_custom || '';
    const design = row.dataset.fieldDesign || live?.design || 'standard';
    const showTitle =
      row.dataset.fieldShowTitle !== undefined
        ? row.dataset.fieldShowTitle !== '0'
        : live?.show_title !== false;
    const cssClass = typeof live?.css_class === 'string' ? live.css_class : '';

    return {
      id,
      type: 'section',
      label,
      width,
      width_custom: width === 'custom' ? widthCustom : '',
      design,
      show_title: showTitle,
      css_class: cssClass,
      collapsed: !!live?.collapsed,
      conditional_logic: normalizeConditionalLogic(live?.conditional_logic),
      children: Array.from(fields?.children || [])
        .filter((el) => el.matches('[data-bl-forms-field]') && !NESTED_BLOCKED.includes(el.dataset.fieldType))
        .map((child) => serializeRow(child)),
    };
  }

  if (type === 'tab') {
    const fields = row.querySelector('[data-bl-tab-fields]');
    const live = tabFieldByEl.get(row);
    const label = live?.label ?? '';
    const width = row.dataset.fieldWidth || live?.width || '100';
    const widthCustom = row.dataset.fieldWidthCustom || live?.width_custom || '';
    const design = row.dataset.fieldDesign || live?.design || 'standard';
    const cssClass = typeof live?.css_class === 'string' ? live.css_class : '';

    return {
      id,
      type: 'tab',
      label,
      width,
      width_custom: width === 'custom' ? widthCustom : '',
      design,
      css_class: cssClass,
      collapsed: !!live?.collapsed,
      conditional_logic: normalizeConditionalLogic(live?.conditional_logic),
      children: Array.from(fields?.children || [])
        .filter((el) => el.matches('[data-bl-forms-field]') && !NESTED_BLOCKED.includes(el.dataset.fieldType))
        .map((child) => serializeRow(child)),
    };
  }

  return null;
}
