/**
 * Blocks definition editor — Fields + Settings (reuses form-builder field cards).
 */
import { createSettingsPanel } from './settings-panel.js';
import {
  createRepeaterCard,
  serializeRepeaterRow,
  defaultRepeater,
} from './repeater-card.js';

const EXCLUDED_TYPES = new Set(['honeypot', 'captcha', 'terms']);

/** Popular fields for block / page / site settings (not form contact fields). */
const BLOCKS_POPULAR_TYPES = ['text', 'textarea', 'select', 'toggle'];

/**
 * Palette sections for the definition canvas.
 * Built at mount time so field-UI-only loads of this bundle (no BlFormBuilder) do not throw.
 */
function blocksPalette() {
  const { PALETTE_SECTIONS = [] } = window.BlFormBuilder || {};
  return PALETTE_SECTIONS.map((section) => {
    // Media library fields replace Forms Uploads, in the same palette slot (after Date & time).
    if (section.id === 'files') {
      return {
        id: 'media',
        headingKey: 'paletteSectionMedia',
        headingFallback: 'Media',
        types: ['image', 'file', 'icon'],
      };
    }
    let types =
      section.id === 'popular'
        ? BLOCKS_POPULAR_TYPES
        : (section.types || []).filter((type) => !EXCLUDED_TYPES.has(type));
    if (section.id === 'advanced') {
      types = [...types.filter((type) => type !== 'repeater'), 'repeater'];
    }
    return { ...section, types };
  }).filter((section) => (section.types || []).length > 0);
}

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

function createBlocksItem(data, open) {
  if ((data?.type || '') === 'repeater') {
    return createRepeaterCard(data, open, 1);
  }
  return window.BlFormBuilder.createFieldCard(data, open);
}

function serializeBlocksItem(row) {
  if ((row?.dataset?.fieldType || '') === 'repeater') {
    return serializeRepeaterRow(row);
  }
  return window.BlFormBuilder.serializeRow(row);
}

/**
 * @param {HTMLElement} root
 * @param {{ fields?: array, settings?: object }} initial
 * @param {string} definitionType
 */
export function mountApp(root, initial, definitionType = 'block') {
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

  const {
    el,
    t,
    writeConfig,
    defaultField,
    uniqueFieldName,
    iconEl,
    createFieldCard,
    serializeRow,
    equalizeColumnRun,
  } = FormBuilder;

  if (typeof FormBuilder.configure === 'function') {
    FormBuilder.configure({ mediaLibraryFields: true });
  }

  root.replaceChildren();
  root.classList.add('bl-forms-builder--tabs');

  let settingsState = { ...(initial.settings || {}) };
  /** @type {{ canvas: object, getFields: Function, setFields: Function, addField: Function } | null} */
  let builderApi = null;

  const panels = createSettingsPanel(settingsState, definitionType, (next) => {
    settingsState = next;
    syncAll();
  });

  const syncAll = () => {
    const fields = builderApi ? builderApi.getFields() : [];
    writeConfig({
      fields,
      settings: panels.getSettings(),
    });
    builderApi?.canvas?.syncEmpty?.();
  };

  const fieldsPanel = el('div', {
    className: 'bl-forms-builder__panel is-active',
    dataset: { blFormsPanel: 'fields' },
  });

  const prepareField = (typeOrData) => {
    if (typeOrData === 'repeater' || (typeOrData && typeOrData.type === 'repeater')) {
      const data = typeof typeOrData === 'string' ? defaultRepeater() : defaultRepeater(typeOrData);
      if (data.name != null && data.name_manual === false) {
        data.name = uniqueFieldName(data.label || data.name || 'items', data.id || '');
      } else if (data.name) {
        data.name = uniqueFieldName(data.name, data.id || '');
      }
      return data;
    }
    const data = typeof typeOrData === 'string' ? defaultField(typeOrData) : { ...typeOrData };
    if (data.name != null && data.name_manual === false) {
      data.name = uniqueFieldName(data.label || data.name || data.type || 'field', data.id || '');
    } else if (data.name) {
      data.name = uniqueFieldName(data.name, data.id || '');
    }
    if (data.type === 'file' || data.type === 'image') {
      delete data.upload_style;
      delete data.preview;
      delete data.extensions;
      delete data.max_size_mb;
      delete data.button_text;
    }
    return data;
  };

  builderApi = Builder.mount(fieldsPanel, {
    replaceRoot: false,
    addRootClass: false,
    ns: 'bl-forms-builder',
    groupName: 'bl-blocks-fields',
    items: initial.fields || [],
    sections: blocksPalette(),
    heading: t('canvasHeading', 'Fields'),
    emptyText: t('empty', 'Drag a field here.'),
    handleSelector: '.bl-forms-builder__handle',
    draggableSelector: '.bl-forms-builder__field, .bl-forms-builder__template',
    templateClass: 'bl-forms-builder__template',
    itemAttr: 'data-bl-forms-field',
    icons: (window.blFormsAdmin && window.blFormsAdmin.icons) || {},
    t,
    typeLabel: (type) => {
      const dict = (window.blFormsAdmin && window.blFormsAdmin.i18n) || {};
      if (type === 'repeater') {
        return (dict.types && dict.types.repeater) || t('repeaterType', 'Repeater');
      }
      return (dict.types && dict.types[type]) || type;
    },
    normalizeItems: expandLegacyGroups,
    prepareItem: prepareField,
    createItem: createBlocksItem,
    serializeItem: serializeBlocksItem,
    onItemMounted: (card, list) => {
      if ((card.dataset.fieldType || '') === 'column') {
        equalizeColumnRun(list, card);
      }
    },
    onChange: () => {
      syncAll();
    },
  });

  const tabBar = el('nav', { className: 'bl-forms-builder__tabs', role: 'tablist' });
  const tabs = [
    { id: 'fields', label: t('tabFields', 'Fields'), panel: fieldsPanel },
    { id: 'settings', label: t('tabSettings', 'Settings'), panel: panels.panel },
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
    panels.panel,
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

  syncAll();
}
