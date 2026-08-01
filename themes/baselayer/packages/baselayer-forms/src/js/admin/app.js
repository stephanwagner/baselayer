import { createPanels } from './panels.js';
import { bindImportExport } from './import-export.js';
import { bindTemplates } from './templates.js';
import { registerFormsFieldExtras } from './field-extras.js';

const {
  el,
  t,
  writeConfig,
  PALETTE_SECTIONS,
  defaultField,
  uniqueFieldName,
  iconEl,
  createFieldCard,
  serializeRow,
  equalizeColumnRun,
} = window.BlFormBuilder || {};

/** Blocks-only field types — keep out of the Forms palette. */
const EXCLUDED_TYPES = new Set(['page']);

const FORMS_PALETTE = PALETTE_SECTIONS.map((section) => ({
  ...section,
  types: (section.types || []).filter((type) => !EXCLUDED_TYPES.has(type)),
})).filter((section) => (section.types || []).length > 0);

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
 * Mount the tabbed form builder (shared canvas + form-specific panels).
 *
 * @param {HTMLElement} root
 * @param {{ fields?: array, settings?: object }} initial
 */
export function mountApp(root, initial) {
  const Builder = window.BlCanvasBuilder;
  const FormBuilder = window.BlFormBuilder;
  if (!Builder || typeof Builder.mount !== 'function') {
    root.textContent = 'Canvas builder failed to load.';
    return;
  }
  if (!FormBuilder || typeof FormBuilder.createFieldCard !== 'function') {
    root.textContent = 'Form builder failed to load.';
    return;
  }

  registerFormsFieldExtras();

  root.replaceChildren();
  // PHP already stamps .bl-forms-builder on #bl-forms-builder — only add the tabs modifier.
  root.classList.add('bl-forms-builder--tabs');

  let settingsState = { ...(initial.settings || {}) };
  /** @type {{ canvas: object, getFields: Function, setFields: Function, addField: Function } | null} */
  let builderApi = null;

  const syncAll = () => {
    const fields = builderApi ? builderApi.getFields() : [];
    panels.syncFields(fields);
    writeConfig({
      fields,
      settings: panels.getSettings(),
    });
    builderApi?.canvas?.syncEmpty?.();
  };

  const panels = createPanels(settingsState, root, (next) => {
    settingsState = next;
    syncAll();
  });

  const fieldsPanel = el('div', {
    className: 'bl-forms-builder__panel is-active',
    dataset: { blFormsPanel: 'fields' },
  });

  const prepareField = (typeOrData) => {
    const data = typeof typeOrData === 'string' ? defaultField(typeOrData) : { ...typeOrData };
    if (data.name != null && data.name_manual === false) {
      data.name = uniqueFieldName(data.label || data.name || data.type || 'field', data.id || '');
    } else if (data.name) {
      data.name = uniqueFieldName(data.name, data.id || '');
    }
    return data;
  };

  builderApi = Builder.mount(fieldsPanel, {
    replaceRoot: false,
    // Keep a single .bl-forms-builder on the outer shell; ns only prefixes children.
    addRootClass: false,
    ns: 'bl-forms-builder',
    groupName: 'bl-forms-fields',
    items: initial.fields || [],
    sections: FORMS_PALETTE,
    heading: t('canvasHeading', 'Form'),
    emptyText: t('empty', 'Drag a field here, or click a template to add it.'),
    handleSelector: '.bl-forms-builder__handle',
    draggableSelector: '.bl-forms-builder__field, .bl-forms-builder__template',
    templateClass: 'bl-forms-builder__template',
    itemAttr: 'data-bl-forms-field',
    icons: (window.blFormsAdmin && window.blFormsAdmin.icons) || {},
    t,
    typeLabel: (type) => {
      const dict = (window.blFormsAdmin && window.blFormsAdmin.i18n) || {};
      return (dict.types && dict.types[type]) || type;
    },
    normalizeItems: expandLegacyGroups,
    prepareItem: prepareField,
    createItem: (data, open) => createFieldCard(data, open),
    serializeItem: serializeRow,
    onItemMounted: (card, list) => {
      if ((card.dataset.fieldType || '') === 'column') {
        equalizeColumnRun(list, card);
      }
    },
    onChange: () => {
      syncAll();
    },
  });

  // Compatibility aliases used by templates / import-export.
  const canvas = {
    root: builderApi.canvas.root,
    addField: (...args) => builderApi.addField(...args),
    replaceFields: (...args) => builderApi.setFields(...args),
    getFields: () => builderApi.getFields(),
    syncEmpty: () => builderApi.canvas.syncEmpty(),
  };

  const tabBar = el('nav', { className: 'bl-forms-builder__tabs', role: 'tablist' });
  const tabs = [
    { id: 'fields', label: t('tabFields', 'Fields'), panel: fieldsPanel },
    { id: 'notifications', label: t('tabNotifications', 'Notifications'), panel: panels.notifications },
    { id: 'settings', label: t('tabSettings', 'Settings'), panel: panels.settings },
    { id: 'validation', label: t('tabValidation', 'Validation'), panel: panels.validation },
  ];

  const activate = (id) => {
    tabs.forEach((tab) => {
      const active = tab.id === id;
      tab.button.classList.toggle('is-active', active);
      tab.button.setAttribute('aria-selected', active ? 'true' : 'false');
      tab.panel.hidden = !active;
      tab.panel.classList.toggle('is-active', active);
    });
  };

  tabs.forEach((tab, index) => {
    tab.button = el('button', {
      type: 'button',
      className: 'bl-forms-builder__tab' + (index === 0 ? ' is-active' : ''),
      role: 'tab',
      text: tab.label,
      dataset: { blFormsTab: tab.id },
      onClick: () => activate(tab.id),
    });
    tab.button.setAttribute('aria-selected', index === 0 ? 'true' : 'false');
    tabBar.appendChild(tab.button);
  });

  let fullscreen = false;
  const setFullscreen = (next) => {
    fullscreen = !!next;
    root.classList.toggle('is-fullscreen', fullscreen);
    document.body.classList.toggle('bl-forms-builder-fullscreen', fullscreen);
    const label = fullscreen
      ? t('fullscreenExit', 'Exit fullscreen')
      : t('fullscreenEnter', 'Fullscreen');
    fullscreenBtn.title = label;
    fullscreenBtn.setAttribute('aria-label', label);
    fullscreenBtn.setAttribute('aria-pressed', fullscreen ? 'true' : 'false');
    fullscreenBtn.replaceChildren();
    const icon = iconEl(fullscreen ? 'fullscreenExit' : 'fullscreen');
    if (icon.innerHTML) {
      fullscreenBtn.appendChild(icon);
    } else {
      fullscreenBtn.textContent = fullscreen ? '✕' : '⛶';
    }
    if (fullscreen) {
      document.addEventListener('keydown', onFullscreenKey);
    } else {
      document.removeEventListener('keydown', onFullscreenKey);
    }
  };

  const onFullscreenKey = (evt) => {
    if (evt.key === 'Escape' && fullscreen) {
      evt.preventDefault();
      setFullscreen(false);
    }
  };

  const fullscreenBtn = el('button', {
    type: 'button',
    className: 'bl-forms-builder__icon-btn bl-forms-builder__fullscreen-btn',
    title: t('fullscreenEnter', 'Fullscreen'),
    'aria-label': t('fullscreenEnter', 'Fullscreen'),
    'aria-pressed': 'false',
    onClick: () => setFullscreen(!fullscreen),
  });
  const enterIcon = iconEl('fullscreen');
  if (enterIcon.innerHTML) {
    fullscreenBtn.appendChild(enterIcon);
  } else {
    fullscreenBtn.textContent = '⛶';
  }
  tabBar.appendChild(fullscreenBtn);

  const panelsWrap = el('div', { className: 'bl-forms-builder__panels' }, [
    fieldsPanel,
    panels.notifications,
    panels.settings,
    panels.validation,
  ]);

  root.append(
    el('div', { className: 'bl-forms-builder__scroll' }, [
      el('div', { className: 'bl-forms-builder__scroll-inner' }, [tabBar, panelsWrap]),
    ])
  );

  const form = root.closest('form');
  if (form) {
    form.addEventListener('submit', syncAll);
  }
  root.addEventListener('input', syncAll);
  root.addEventListener('change', syncAll);
  document.addEventListener('bl-forms-builder-changed', syncAll);

  bindImportExport(canvas, panels);
  bindTemplates(canvas, panels);
  syncAll();
}
