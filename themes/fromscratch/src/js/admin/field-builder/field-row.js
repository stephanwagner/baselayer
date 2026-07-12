import { el, empty, formRow, slugify } from './dom';
import { getType, listTypesForMode } from './registry';
import { defaultTypeId } from './config';
import { renderPresentation, serializePresentation } from './presentation';

/**
 * Build type <select> for the current mode.
 *
 * @param {string} mode
 * @param {string} selected
 */
function buildTypeSelect(mode, selected) {
  const select = el('select', {
    className: 'fs-field-builder__type-select widefat',
    dataset: { fsFb: 'type' },
  });
  listTypesForMode(mode).forEach((type) => {
    select.appendChild(
      el('option', {
        value: type.id,
        text: type.label || type.id,
        selected: type.id === selected ? true : undefined,
      })
    );
  });
  if (!select.value && select.options.length) {
    select.value = select.options[0].value;
  }
  return select;
}

/**
 * Render type-specific options into the host.
 *
 * @param {HTMLElement} fieldRoot
 * @param {string} typeId
 * @param {object|null} data
 */
function renderTypeOptions(fieldRoot, typeId, data = null) {
  const host = fieldRoot.querySelector('[data-fs-fb-options-host]');
  if (!host) {
    return;
  }
  empty(host);
  const type = getType(typeId);
  if (type && typeof type.renderOptions === 'function') {
    type.renderOptions(host, data || {}, { fieldRoot });
  }
  if (type && data && typeof type.hydrate === 'function') {
    type.hydrate(fieldRoot, data);
  }
}

/**
 * Wire tab switching inside a field body.
 *
 * @param {HTMLElement} tabsNav
 * @param {HTMLElement} panelsHost
 */
function initTabs(tabsNav, panelsHost) {
  tabsNav.addEventListener('click', (event) => {
    const tab = event.target.closest('[data-fs-fb-tab]');
    if (!tab || !tabsNav.contains(tab)) {
      return;
    }
    const id = tab.getAttribute('data-fs-fb-tab');
    tabsNav.querySelectorAll('[data-fs-fb-tab]').forEach((btn) => {
      const active = btn === tab;
      btn.classList.toggle('is-active', active);
      btn.setAttribute('aria-selected', active ? 'true' : 'false');
    });
    panelsHost.querySelectorAll('[data-fs-fb-tab-panel]').forEach((panel) => {
      const active = panel.getAttribute('data-fs-fb-tab-panel') === id;
      panel.classList.toggle('is-active', active);
      panel.hidden = !active;
    });
  });
}

/**
 * Create a field row element.
 *
 * @param {object} options
 * @param {string} options.mode
 * @param {object} [options.data]
 * @param {boolean} [options.open]
 */
export function createFieldRow({ mode = 'fields', data = {}, open = false } = {}) {
  const typeId = data.type && getType(data.type) ? data.type : defaultTypeId;
  const title = data.title != null ? String(data.title) : '';
  const slug = data.slug != null ? String(data.slug) : '';

  const root = el('div', {
    className: 'fs-field-builder__field' + (open ? ' is-open' : ''),
    dataset: { fsFbField: '1' },
  });

  const header = el('div', { className: 'fs-field-builder__field-header' });
  const toggler = el('button', {
    type: 'button',
    className: 'fs-field-builder__field-toggle',
    'aria-expanded': open ? 'true' : 'false',
    text: open ? '▾' : '▸',
  });
  const titlePreview = el('span', {
    className: 'fs-field-builder__field-title-preview',
    text: title || '(untitled)',
  });
  const typePreview = el('span', {
    className: 'fs-field-builder__field-type-preview',
    text: (getType(typeId) && getType(typeId).label) || typeId,
  });
  const handle = el('span', {
    className: 'fs-field-builder__field-handle',
    title: 'Drag to reorder',
    text: '⋮⋮',
  });
  const deleteBtn = el('button', {
    type: 'button',
    className: 'button-link-delete fs-field-builder__field-delete',
    text: 'Delete',
  });

  header.appendChild(toggler);
  header.appendChild(titlePreview);
  header.appendChild(typePreview);
  header.appendChild(handle);
  header.appendChild(deleteBtn);

  const body = el('div', {
    className: 'fs-field-builder__field-body',
    hidden: open ? undefined : true,
  });

  const tabsNav = el('div', {
    className: 'fs-field-builder__tabs',
    role: 'tablist',
  });
  [
    ['general', 'General'],
    ['presentation', 'Presentation'],
    ['logic', 'Logic'],
  ].forEach(([id, label], index) => {
    tabsNav.appendChild(
      el('button', {
        type: 'button',
        className: 'fs-field-builder__tab' + (index === 0 ? ' is-active' : ''),
        role: 'tab',
        dataset: { fsFbTab: id },
        'aria-selected': index === 0 ? 'true' : 'false',
        text: label,
      })
    );
  });

  const panelsHost = el('div', { className: 'fs-field-builder__tab-panels' });

  const panelGeneral = el('div', {
    className: 'fs-field-builder__tab-panel is-active',
    dataset: { fsFbTabPanel: 'general' },
    role: 'tabpanel',
  });
  const typeSelect = buildTypeSelect(mode, typeId);
  const titleInput = el('input', {
    type: 'text',
    className: 'widefat',
    dataset: { fsFb: 'title' },
    value: title,
  });
  const slugInput = el('input', {
    type: 'text',
    className: 'widefat',
    dataset: { fsFb: 'slug' },
    value: slug,
  });
  panelGeneral.appendChild(formRow('Type', typeSelect));
  panelGeneral.appendChild(formRow('Title', titleInput));
  panelGeneral.appendChild(formRow('Slug', slugInput));
  const optionsHost = el('div', {
    className: 'fs-field-builder__type-options',
    dataset: { fsFbOptionsHost: '1' },
  });
  panelGeneral.appendChild(optionsHost);

  const panelPresentation = el('div', {
    className: 'fs-field-builder__tab-panel',
    dataset: { fsFbTabPanel: 'presentation' },
    role: 'tabpanel',
    hidden: true,
  });
  renderPresentation(panelPresentation, data);

  const panelLogic = el('div', {
    className: 'fs-field-builder__tab-panel',
    dataset: { fsFbTabPanel: 'logic' },
    role: 'tabpanel',
    hidden: true,
  });
  panelLogic.appendChild(
    el('p', {
      className: 'description',
      text: 'Conditional logic — coming soon.',
    })
  );

  panelsHost.appendChild(panelGeneral);
  panelsHost.appendChild(panelPresentation);
  panelsHost.appendChild(panelLogic);

  body.appendChild(tabsNav);
  body.appendChild(panelsHost);
  root.appendChild(header);
  root.appendChild(body);

  initTabs(tabsNav, panelsHost);

  const syncPreviews = () => {
    titlePreview.textContent = titleInput.value.trim() || '(untitled)';
    const currentType = getType(typeSelect.value);
    typePreview.textContent = (currentType && currentType.label) || typeSelect.value;
  };

  toggler.addEventListener('click', () => {
    const isOpen = root.classList.toggle('is-open');
    body.hidden = !isOpen;
    toggler.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    toggler.textContent = isOpen ? '▾' : '▸';
  });

  deleteBtn.addEventListener('click', () => {
    root.dispatchEvent(new CustomEvent('fs-fb-delete', { bubbles: true }));
  });

  titleInput.addEventListener('input', () => {
    syncPreviews();
    if (!slugInput.dataset.fsFbSlugTouched) {
      slugInput.value = slugify(titleInput.value);
    }
  });

  slugInput.addEventListener('input', () => {
    slugInput.dataset.fsFbSlugTouched = '1';
  });

  typeSelect.addEventListener('change', () => {
    syncPreviews();
    renderTypeOptions(root, typeSelect.value, null);
  });

  renderTypeOptions(root, typeId, data);
  syncPreviews();

  return root;
}

/**
 * Serialize one field row to a schema object.
 *
 * @param {HTMLElement} fieldRoot
 */
export function serializeFieldRow(fieldRoot) {
  const typeInput = fieldRoot.querySelector('[data-fs-fb="type"]');
  const titleInput = fieldRoot.querySelector('[data-fs-fb="title"]');
  const slugInput = fieldRoot.querySelector('[data-fs-fb="slug"]');
  const typeId = typeInput ? typeInput.value : defaultTypeId;
  const field = {
    type: typeId || defaultTypeId,
    title: titleInput ? titleInput.value.trim() : '',
    slug: slugInput ? slugInput.value.trim() : '',
  };
  const type = getType(field.type);
  if (type && typeof type.serialize === 'function') {
    Object.assign(field, type.serialize(fieldRoot) || {});
  }
  const presentation = serializePresentation(fieldRoot);
  if (presentation) {
    field.presentation = presentation;
  }
  return field;
}
