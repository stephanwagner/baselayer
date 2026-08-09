/**
 * Blocks definition editor — Fields + Settings (reuses form-builder field cards).
 */
import { createSettingsPanel } from './settings-panel.js';
import { createOptionsPanel } from './options-panel.js';
import {
  createRepeaterCard,
  serializeRepeaterRow,
  defaultRepeater,
} from './repeater-card.js';
import { bindImportExport } from './import-export.js';
import {
  createWysiwygToolbarSettings,
  createWysiwygHeightSettings,
  serializeWysiwygToolbar,
} from './wysiwyg-card.js';

const EXCLUDED_TYPES = new Set(['honeypot', 'captcha', 'terms', 'divider']);

/** Popular fields for block / page / site settings (not form contact fields). */
const BLOCKS_POPULAR_TYPES = ['text', 'textarea', 'wysiwyg', 'select', 'toggle'];

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
    // Blocks-only rich text (not in Forms palette).
    if (section.id === 'popular' || section.id === 'input') {
      if (!types.includes('wysiwyg')) {
        const textareaIdx = types.indexOf('textarea');
        if (textareaIdx >= 0) {
          types = [
            ...types.slice(0, textareaIdx + 1),
            'wysiwyg',
            ...types.slice(textareaIdx + 1).filter((type) => type !== 'wysiwyg'),
          ];
        } else {
          types = [...types, 'wysiwyg'];
        }
      }
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
    equalizeColumnRun,
  } = FormBuilder;

  if (typeof FormBuilder.configure === 'function') {
    FormBuilder.configure({
      mediaLibraryFields: true,
      headingLevels: ['h2', 'h3', 'h4'],
      // Nested column/section/tab lists call createFieldCard/serializeRow directly;
      // route Blocks-only repeater through these hooks (same as root createItem).
      fieldCard: {
        createFieldCard: (data, open) => {
          if ((data?.type || '') === 'repeater') {
            return createRepeaterCard(data, open, 1);
          }
          return null;
        },
        serializeRow: (row) => {
          if ((row?.dataset?.fieldType || '') === 'repeater') {
            return serializeRepeaterRow(row);
          }
          return null;
        },
        onInitField: (field) => {
          if ((field?.type || '') !== 'wysiwyg') return;
          if (!['basic', 'standard', 'full', 'custom'].includes(field.toolbar)) {
            field.toolbar = 'basic';
          }
          if (field.toolbar === 'custom' && field.toolbar_custom == null) {
            field.toolbar_custom = '';
          }
          if (field.allow_code_editing == null) {
            field.allow_code_editing = false;
          }
        },
        onNormalizeType: (field, nextType) => {
          if (nextType === 'wysiwyg') {
            if (!['basic', 'standard', 'full', 'custom'].includes(field.toolbar)) {
              field.toolbar = 'basic';
            }
            if (field.allow_code_editing == null) {
              field.allow_code_editing = false;
            }
            return;
          }
          delete field.toolbar;
          delete field.toolbar_custom;
          delete field.allow_code_editing;
          // Wysiwyg pixel height must not leak onto spacer/other types.
          if (typeof field.height === 'number' || /^\d+$/.test(String(field.height || ''))) {
            delete field.height;
          }
        },
        extraAdvancedSections: (field) => {
          if ((field?.type || '') !== 'wysiwyg') return [];
          return createWysiwygToolbarSettings(field, FormBuilder);
        },
        extraAppearanceSections: (field) => {
          if ((field?.type || '') !== 'wysiwyg') return [];
          return createWysiwygHeightSettings(field, FormBuilder);
        },
        onSerialize: (data, ctx) => {
          serializeWysiwygToolbar(data, ctx);
        },
      },
    });
  }

  root.replaceChildren();
  root.classList.add('bl-forms-builder--tabs');

  let settingsState = { ...(initial.settings || {}) };
  let blockOptionsState = {
    items: Array.isArray(initial.blockOptions?.items) ? initial.blockOptions.items : [],
  };
  /** @type {{ canvas: object, getFields: Function, setFields: Function, addField: Function } | null} */
  let builderApi = null;
  /** @type {{ panel: HTMLElement, getSettings: Function }} */
  let panels;
  /** @type {{ panel: HTMLElement, getBlockOptions: Function, setBlockOptions?: Function } | null} */
  let optionsPanel = null;
  /** @type {Array<{ id: string, label: string, panel: HTMLElement, button?: HTMLElement }>} */
  let tabs = [];

  const onSettingsChange = (next) => {
    settingsState = next;
    syncAll();
  };

  const mountSettingsPanel = (settings) => {
    const next = createSettingsPanel(settings, definitionType, onSettingsChange);
    if (panels?.panel?.parentNode) {
      const wasHidden = panels.panel.hidden;
      const wasActive = panels.panel.classList.contains('is-active');
      panels.panel.replaceWith(next.panel);
      next.panel.hidden = wasHidden;
      next.panel.classList.toggle('is-active', wasActive);
      const settingsTab = tabs.find((tab) => tab.id === 'settings');
      if (settingsTab) {
        settingsTab.panel = next.panel;
      }
    }
    panels = next;
    return next;
  };

  panels = mountSettingsPanel(settingsState);

  optionsPanel =
    definitionType === 'block'
      ? createOptionsPanel(blockOptionsState, (next) => {
          blockOptionsState = next;
          syncAll();
        })
      : null;

  const syncAll = () => {
    // Never replace fields with [] before the canvas API exists — settings toggles
    // (e.g. sidebar_editing) call syncAll early and would wipe the definition.
    let fields;
    if (builderApi) {
      fields = builderApi.getFields();
    } else {
      const current =
        typeof FormBuilder.readConfig === 'function' ? FormBuilder.readConfig() : {};
      fields = Array.isArray(current.fields)
        ? current.fields
        : Array.isArray(initial.fields)
          ? initial.fields
          : [];
    }
    const payload = {
      fields,
      settings: panels.getSettings(),
    };
    if (optionsPanel) {
      payload.blockOptions = optionsPanel.getBlockOptions();
    }
    writeConfig(payload);
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
  tabs = [{ id: 'fields', label: t('tabFields', 'Fields'), panel: fieldsPanel }];
  if (optionsPanel) {
    tabs.push({
      id: 'options',
      label: t('tabOptions', 'Options'),
      panel: optionsPanel.panel,
    });
  }
  tabs.push({ id: 'settings', label: t('tabSettings', 'Settings'), panel: panels.panel });

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
    optionsPanel ? optionsPanel.panel : null,
    panels.panel,
  ].filter(Boolean));

  panels.panel.hidden = true;
  panels.panel.classList.remove('is-active');
  if (optionsPanel) {
    optionsPanel.panel.hidden = true;
    optionsPanel.panel.classList.remove('is-active');
  }

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

  bindImportExport(
    {
      getFields: () => builderApi.getFields(),
      setFields: (fields) => builderApi.setFields(fields || []),
      getSettings: () => panels.getSettings(),
      applySettings: (next) => {
        // Full replace so import overwrites (does not keep stale keys).
        settingsState = { ...(next || {}) };
        mountSettingsPanel(settingsState);
      },
      getBlockOptions: optionsPanel ? () => optionsPanel.getBlockOptions() : null,
      setBlockOptions: optionsPanel
        ? (next) => {
            optionsPanel.setBlockOptions(next || { items: [] });
            blockOptionsState = optionsPanel.getBlockOptions();
          }
        : null,
      sync: syncAll,
    },
    definitionType
  );

  syncAll();
}
