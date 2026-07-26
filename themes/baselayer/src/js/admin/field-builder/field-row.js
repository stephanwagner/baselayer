import { el, empty, formRow, slugify } from './dom';
import { getType, listTypesForMode } from './registry';
import { defaultTypeId } from './config';
import { renderPresentation, serializePresentation } from './presentation';
import { createSwitch } from './controls';
import { createListRow } from './list-row';

/**
 * Build type <select> for the current mode.
 *
 * @param {string} mode
 * @param {string} selected
 */
function buildTypeSelect(mode, selected) {
  const select = el('select', {
    className: 'bl-field-builder__type-select widefat',
    dataset: { blFb: 'type' },
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
  const host = fieldRoot.querySelector('[data-bl-fb-options-host]');
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
    const tab = event.target.closest('[data-bl-fb-tab]');
    if (!tab || !tabsNav.contains(tab)) {
      return;
    }
    const id = tab.getAttribute('data-bl-fb-tab');
    tabsNav.querySelectorAll('[data-bl-fb-tab]').forEach((btn) => {
      const active = btn === tab;
      btn.classList.toggle('is-active', active);
      btn.setAttribute('aria-selected', active ? 'true' : 'false');
    });
    panelsHost.querySelectorAll('[data-bl-fb-tab-panel]').forEach((panel) => {
      const active = panel.getAttribute('data-bl-fb-tab-panel') === id;
      panel.classList.toggle('is-active', active);
      panel.hidden = !active;
    });
  });
}

const TAB_DEFS = {
  general: 'General',
  presentation: 'Presentation',
  logic: 'Logic',
};

/**
 * Create a field row element (list-row chrome + field editors).
 *
 * @param {object} options
 * @param {string} options.mode
 * @param {object} [options.data]
 * @param {boolean} [options.open]
 * @param {string[]} [options.tabs] Subset of general|presentation|logic
 * @param {{title?: string, slug?: string}} [options.labels]
 * @param {boolean} [options.showRequired]
 * @param {boolean} [options.showHelp]
 */
export function createFieldRow({
  mode = 'fields',
  data = {},
  open = false,
  tabs = null,
  labels = {},
  showRequired = false,
  showHelp = false,
} = {}) {
  const allowed = listTypesForMode(mode);
  const fallbackType = (allowed[0] && allowed[0].id) || defaultTypeId;
  const requested = data.type && getType(data.type) ? data.type : '';
  const typeId =
    requested && allowed.some((type) => type.id === requested) ? requested : fallbackType;
  const title = data.title != null ? String(data.title) : data.label != null ? String(data.label) : '';
  const slug = data.slug != null ? String(data.slug) : data.id != null ? String(data.id) : '';
  const tabIds =
    Array.isArray(tabs) && tabs.length
      ? tabs.filter((id) => TAB_DEFS[id])
      : ['general', 'presentation', 'logic'];
  const titleLabel = labels.title || 'Title';
  const slugLabel = labels.slug || 'Slug';

  const typeChip = el('span', {
    className: 'bl-field-builder__type-chip',
    text: (getType(typeId) && getType(typeId).label) || typeId,
  });

  const row = createListRow({
    title,
    open,
    meta: typeChip,
    className: 'bl-field-builder__field',
    dataset: { blFbField: '1' },
  });
  const { root, body, setTitle, setMeta } = row;

  const showTabNav = tabIds.length > 1;
  let tabsNav = null;
  if (showTabNav) {
    tabsNav = el('div', {
      className: 'bl-field-builder__tabs',
      role: 'tablist',
    });
    tabIds.forEach((id, index) => {
      tabsNav.appendChild(
        el('button', {
          type: 'button',
          className: 'bl-field-builder__tab' + (index === 0 ? ' is-active' : ''),
          role: 'tab',
          dataset: { blFbTab: id },
          'aria-selected': index === 0 ? 'true' : 'false',
          text: TAB_DEFS[id],
        })
      );
    });
  }

  const panelsHost = el('div', { className: 'bl-field-builder__tab-panels' });

  const panelGeneral = el('div', {
    className: 'bl-field-builder__tab-panel is-active',
    dataset: { blFbTabPanel: 'general' },
    role: 'tabpanel',
  });
  const typeSelect = buildTypeSelect(mode, typeId);
  const titleInput = el('input', {
    type: 'text',
    className: 'widefat',
    dataset: { blFb: 'title' },
    value: title,
  });
  const slugInput = el('input', {
    type: 'text',
    className: 'widefat',
    dataset: { blFb: 'slug' },
    value: slug,
  });
  panelGeneral.appendChild(formRow('Type', typeSelect));
  panelGeneral.appendChild(formRow(titleLabel, titleInput));
  panelGeneral.appendChild(formRow(slugLabel, slugInput));

  if (showHelp || data.help != null) {
    const helpInput = el('input', {
      type: 'text',
      className: 'widefat',
      dataset: { blFb: 'help' },
      value: data.help != null ? String(data.help) : '',
    });
    panelGeneral.appendChild(formRow('Help text', helpInput));
  }

  if (showRequired) {
    panelGeneral.appendChild(
      createSwitch({
        label: 'Required',
        checked: !!data.required,
        datasetKey: 'required',
      })
    );
  }

  const optionsHost = el('div', {
    className: 'bl-field-builder__type-options',
    dataset: { blFbOptionsHost: '1' },
  });
  panelGeneral.appendChild(optionsHost);
  panelsHost.appendChild(panelGeneral);

  if (tabIds.includes('presentation')) {
    const panelPresentation = el('div', {
      className: 'bl-field-builder__tab-panel',
      dataset: { blFbTabPanel: 'presentation' },
      role: 'tabpanel',
      hidden: true,
    });
    renderPresentation(panelPresentation, data);
    panelsHost.appendChild(panelPresentation);
  }

  if (tabIds.includes('logic')) {
    const panelLogic = el('div', {
      className: 'bl-field-builder__tab-panel',
      dataset: { blFbTabPanel: 'logic' },
      role: 'tabpanel',
      hidden: true,
    });
    panelLogic.appendChild(
      el('p', {
        className: 'description',
        text: 'Conditional logic — coming soon.',
      })
    );
    panelsHost.appendChild(panelLogic);
  }

  if (tabsNav) {
    body.appendChild(tabsNav);
  }
  body.appendChild(panelsHost);

  if (tabsNav) {
    initTabs(tabsNav, panelsHost);
  }

  const syncPreviews = () => {
    setTitle(titleInput.value);
    const currentType = getType(typeSelect.value);
    const label = (currentType && currentType.label) || typeSelect.value;
    typeChip.textContent = label;
    setMeta(typeChip);
  };

  titleInput.addEventListener('input', () => {
    syncPreviews();
    if (!slugInput.dataset.blFbSlugTouched) {
      slugInput.value = slugify(titleInput.value);
    }
  });

  slugInput.addEventListener('input', () => {
    slugInput.dataset.blFbSlugTouched = '1';
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
  const typeInput = fieldRoot.querySelector('[data-bl-fb="type"]');
  const titleInput = fieldRoot.querySelector('[data-bl-fb="title"]');
  const slugInput = fieldRoot.querySelector('[data-bl-fb="slug"]');
  const helpInput = fieldRoot.querySelector('[data-bl-fb="help"]');
  const requiredInput = fieldRoot.querySelector('[data-bl-fb="required"]');
  const typeId = typeInput ? typeInput.value : defaultTypeId;
  const field = {
    type: typeId || defaultTypeId,
    title: titleInput ? titleInput.value.trim() : '',
    slug: slugInput ? slugInput.value.trim() : '',
  };
  if (helpInput && helpInput.value.trim() !== '') {
    field.help = helpInput.value.trim();
  }
  if (requiredInput) {
    field.required = !!requiredInput.checked;
  }
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
