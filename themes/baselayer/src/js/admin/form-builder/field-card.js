import { el, t, typeLabel, uid, iconEl, uniqueFieldName, slugifyOption, readConfig, flattenFields, fieldIsActive, cloneFieldData, pickerPostTypeCatalog } from './dom.js';
import {
  createColumnCard,
  createSectionCard,
  createTabCard,
  serializeLayoutRow,
  equalizeColumnRun,
} from './layout.js';
import { createConditionalLogicEditor, readConditionalLogicFromDom, normalizeConditionalLogic } from './conditional-logic.js';
import { getFieldCardHooks, useMediaLibraryFields, getHeadingLevels } from './config.js';

const WIDTH_PRESETS = [
  { value: '100', label: '100%' },
  { value: '75', label: '75%' },
  { value: '66', label: '66%' },
  { value: '50', label: '50%' },
  { value: '33', label: '33%' },
  { value: '25', label: '25%' },
  { value: 'auto', labelKey: 'widthAuto' },
  { value: 'custom', labelKey: 'widthCustom', icon: 'edit' },
];

const SPACER_HEIGHT_PRESETS = [
  { value: 'xs', label: 'XS' },
  { value: 's', label: 'S' },
  { value: 'm', label: 'M' },
  { value: 'l', label: 'L' },
  { value: 'xl', label: 'XL' },
  { value: 'custom', labelKey: 'widthCustom', icon: 'edit' },
];

const SPACER_HEIGHT_VALUES = SPACER_HEIGHT_PRESETS.map((preset) => preset.value);
const DIVIDER_MARGIN_PRESETS = [
  { value: 'xs', label: 'XS' },
  { value: 's', label: 'S' },
  { value: 'm', label: 'M' },
  { value: 'l', label: 'L' },
  { value: 'xl', label: 'XL' },
  { value: 'custom', labelKey: 'widthCustom', icon: 'edit' },
];
const DIVIDER_MARGIN_VALUES = DIVIDER_MARGIN_PRESETS.map((preset) => preset.value);
const CSS_LENGTH_RE = /^(-?\d+(?:\.\d+)?)(px|rem|em|%|vh|vw|vmin|vmax|ch|ex)$/i;

/** Migrate legacy free-form spacer heights to preset / custom. */
function normalizeSpacerHeight(field) {
  const raw = String(field.height ?? 'm').trim();
  const key = raw.toLowerCase();
  if (SPACER_HEIGHT_VALUES.includes(key)) {
    field.height = key;
    if (key !== 'custom') {
      field.height_custom = '';
    } else if (field.height_custom == null) {
      field.height_custom = '';
    }
    return;
  }
  if (CSS_LENGTH_RE.test(raw)) {
    field.height_custom = raw;
    field.height = 'custom';
    return;
  }
  field.height = 'm';
  field.height_custom = '';
}

/** Migrate divider margin to preset / custom. */
function normalizeDividerMargin(field) {
  const raw = String(field.margin ?? 'm').trim();
  const key = raw.toLowerCase();
  if (DIVIDER_MARGIN_VALUES.includes(key)) {
    field.margin = key;
    if (key !== 'custom') {
      field.margin_custom = '';
    } else if (field.margin_custom == null) {
      field.margin_custom = '';
    }
    return;
  }
  if (CSS_LENGTH_RE.test(raw)) {
    field.margin_custom = raw;
    field.margin = 'custom';
    return;
  }
  field.margin = 'm';
  field.margin_custom = '';
}

const OPTION_TYPES = ['radio', 'checkboxes', 'select', 'button_group'];
const MULTIPLE_TYPES = ['select', 'button_group', 'file', 'image', 'page'];

const CAPTCHA_PROVIDERS = [
  {
    id: 'turnstile',
    labelKey: 'captchaTurnstile',
    labelFallback: 'Cloudflare Turnstile',
    helpKey: 'captchaTurnstileHelp',
    helpFallback: 'Mostly invisible. Excellent privacy and very easy to set up.',
    secretKey: 'captchaSecretKey',
    secretFallback: 'Secret key',
  },
  {
    id: 'hcaptcha',
    labelKey: 'captchaHcaptcha',
    labelFallback: 'hCaptcha',
    helpKey: 'captchaHcaptchaHelp',
    helpFallback: 'Good privacy and UX. Very easy to set up.',
    secretKey: 'captchaSecretKey',
    secretFallback: 'Secret key',
  },
  {
    id: 'friendly',
    labelKey: 'captchaFriendly',
    labelFallback: 'Friendly Captcha',
    helpKey: 'captchaFriendlyHelp',
    helpFallback: 'Excellent privacy and accessibility. Easy to set up.',
    secretKey: 'captchaApiKey',
    secretFallback: 'API key',
  },
  {
    id: 'recaptcha_v2',
    labelKey: 'captchaRecaptcha',
    labelFallback: 'Google reCAPTCHA v2',
    helpKey: 'captchaRecaptchaHelp',
    helpFallback: 'Familiar checkbox challenge. Weaker privacy. Very easy to set up.',
    secretKey: 'captchaSecretKey',
    secretFallback: 'Secret key',
  },
];

function captchaProviderMeta(id) {
  return CAPTCHA_PROVIDERS.find((p) => p.id === id) || CAPTCHA_PROVIDERS[0];
}

function captchaProviderLabel(id) {
  const meta = captchaProviderMeta(id);
  return t(meta.labelKey, meta.labelFallback);
}

/**
 * Notice that CAPTCHA keys live in global Forms → Settings.
 *
 * @param {object} field
 * @param {() => void} onChange
 */
function createCaptchaSettings(field, onChange) {
  unsetCaptchaFieldKeys(field);

  const configured = !!(window.blFormsAdmin && window.blFormsAdmin.captchaConfigured);
  const settingsUrl = (window.blFormsAdmin && window.blFormsAdmin.captchaSettingsUrl)
    || (window.blFormsAdmin && window.blFormsAdmin.settingsUrl)
    || '';
  const root = el('div', { className: 'bl-forms-builder__captcha' });
  const settingsLink = settingsUrl
    ? el('a', {
        href: settingsUrl,
        className: 'bl-forms-builder__notice-link',
        text: t('captchaOpenSettings', 'Open settings'),
      })
    : null;

  root.append(
    el('p', {
      className: 'description',
      text: t('captchaHelp', 'Uses the CAPTCHA keys from Forms → Settings.'),
    })
  );

  if (!configured) {
    root.append(
      el(
        'div',
        {
          className: 'bl-forms-builder__notice bl-forms-builder__notice--warning',
          role: 'status',
        },
        [
          el('span', {
            text: t(
              'captchaNotConfigured',
              'CAPTCHA keys are not configured yet. Add them under Forms → Settings.'
            ),
          }),
          settingsLink,
        ]
      )
    );
  } else if (settingsLink) {
    root.append(settingsLink);
  }

  // Keep callback signature for call sites; keys are stripped above.
  void onChange;
  return root;
}

function unsetCaptchaFieldKeys(field) {
  delete field.captcha_provider;
  delete field.captcha_site_key;
  delete field.captcha_secret_key;
}

/** Types that can convert into each other without wiping shared settings. */
const TYPE_CONVERT_GROUPS = [
  ['text', 'textarea', 'email', 'phone', 'url', 'number'],
  ['date', 'time', 'datetime'],
  ['radio', 'checkboxes', 'select', 'button_group'],
  ['toggle', 'terms'],
  ['file', 'image'],
  ['heading', 'text_block', 'html'],
];

function convertibleTypes(type) {
  const group = TYPE_CONVERT_GROUPS.find((list) => list.includes(type));
  return group ? [...group] : [];
}

function canConvertType(from, to) {
  if (!from || !to || from === to) {
    return from === to;
  }
  const group = TYPE_CONVERT_GROUPS.find((list) => list.includes(from));
  return Boolean(group && group.includes(to));
}

/**
 * Copy live editor DOM values onto the in-memory field before type convert/rebuild.
 */
function hydrateFieldFromCard(row, field) {
  const data = serializeRow(row);
  if (!data || data.type === 'column' || data.type === 'section' || data.type === 'tab') {
    return;
  }
  const keepId = field.id;
  const keepType = field.type;
  Object.keys(field).forEach((key) => {
    if (key === 'id' || key === 'type') {
      return;
    }
    if (!(key in data)) {
      delete field[key];
    }
  });
  Object.assign(field, data, { id: keepId, type: keepType });
}

/**
 * Switch field type within a conversion group, keeping shared values.
 */
function convertFieldType(field, nextType) {
  if (!canConvertType(field.type, nextType) || field.type === nextType) {
    return;
  }

  field.type = nextType;

  if (OPTION_TYPES.includes(nextType)) {
    if (!Array.isArray(field.options) || field.options.length === 0) {
      field.options = [
        { label: t('optionOne', 'Option 1'), value: 'option-1' },
        { label: t('optionTwo', 'Option 2'), value: 'option-2' },
      ];
    }
  } else {
    delete field.options;
  }

  if (nextType === 'radio' || nextType === 'checkboxes') {
    if (field.layout !== 'horizontal') {
      field.layout = 'vertical';
    }
  } else if (nextType === 'button_group') {
    if (field.layout !== 'vertical') {
      field.layout = 'horizontal';
    }
  } else {
    delete field.layout;
  }

  if (nextType === 'toggle' || nextType === 'terms' || nextType === 'checkboxes') {
    if (nextType === 'toggle') {
      field.show_as_checkbox = false;
      if (field.content == null) {
        field.content = '';
      }
    } else {
      field.show_as_checkbox = true;
    }
  } else {
    delete field.show_as_checkbox;
  }

  if (nextType === 'checkboxes') {
    if (field.min_selections != null && field.min_selections !== '') {
      const min = parseInt(field.min_selections, 10);
      field.min_selections = Number.isFinite(min) && min >= 1 ? Math.min(50, min) : '';
    }
    if (field.max_selections != null && field.max_selections !== '') {
      const max = parseInt(field.max_selections, 10);
      field.max_selections = Number.isFinite(max) && max >= 1 ? Math.min(50, max) : '';
    }
  } else {
    delete field.min_selections;
    delete field.max_selections;
  }

  if (MULTIPLE_TYPES.includes(nextType)) {
    field.multiple = Boolean(field.multiple);
  } else {
    delete field.multiple;
  }

  if (nextType === 'select') {
    if (field.allow_null === undefined) {
      field.allow_null = true;
    }
    if (field.multiple) {
      delete field.allow_null;
    }
  } else {
    delete field.allow_null;
  }

  if (nextType === 'file' || nextType === 'image') {
    if (useMediaLibraryFields()) {
      delete field.upload_style;
      delete field.preview;
      delete field.extensions;
      delete field.max_size_mb;
      delete field.button_text;
      if (field.multiple && (field.max_files == null || field.max_files === '')) {
        field.max_files = 10;
      }
    } else {
      if (field.preview === undefined) {
        field.preview = true;
      }
      if (field.upload_style === undefined) {
        field.upload_style = 'modern';
      }
      if (nextType === 'image' && !String(field.extensions || '').trim()) {
        field.extensions = 'jpg, jpeg, png, webp, gif, heic, avif';
      }
      if (field.extensions === undefined) {
        field.extensions = '';
      }
    }
  } else {
    delete field.extensions;
    delete field.preview;
    delete field.max_files;
    delete field.max_size_mb;
    delete field.upload_style;
    delete field.button_text;
  }

  if (nextType === 'link') {
    const allowed = ['page', 'url', 'email', 'phone', 'file'];
    const raw = Array.isArray(field.link_types) ? field.link_types : [];
    field.link_types = raw.filter((t) => allowed.includes(t));
    if (field.link_types.length === 0) {
      field.link_types = [...allowed];
    }
    field.allow_target = field.allow_target !== false;
  } else {
    delete field.link_types;
    delete field.allow_target;
  }

  if (nextType === 'page') {
    const catalog = pickerPostTypeCatalog();
    const allowedKeys = catalog.map((row) => row.value);
    const raw = Array.isArray(field.post_types) ? field.post_types : [];
    field.post_types = raw.filter((t) => allowedKeys.includes(t));
    if (field.post_types.length === 0) {
      field.post_types = [...allowedKeys];
    }
  } else {
    delete field.post_types;
  }

  if (nextType === 'terms') {
    if (field.content == null || String(field.content).trim() === '') {
      field.content = t('termsDefaultLabel', 'I agree to the [Privacy Policy](page:privacy).');
    }
    if (!String(field.label || '').trim()) {
      field.label = t('termsDefaultFieldLabel', 'Privacy Policy');
    }
    field.hide_label = true;
    field.required = true;
  }

  if (['heading', 'text_block', 'html'].includes(nextType) && field.content == null) {
    field.content = '';
  }

  if (nextType === 'heading') {
    normalizeHeadingLevel(field);
  } else {
    delete field.level;
  }

  if (NO_DEFAULT.includes(nextType)) {
    delete field.default_value;
  }

  if (NO_PLACEHOLDER.includes(nextType)) {
    field.placeholder = '';
  }

  if (!AUTOCOMPLETE_TYPES.includes(nextType)) {
    delete field.autocomplete;
  }

  if (!AFFIX_TYPES.includes(nextType)) {
    delete field.prefix;
    delete field.suffix;
  }

  if (!['text', 'textarea'].includes(nextType)) {
    delete field.min_length;
    delete field.max_length;
    delete field.show_char_count;
    delete field.char_count_text;
  }

  if (nextType === 'textarea') {
    const rows = parseInt(field.rows, 10);
    field.rows = Number.isFinite(rows) && rows >= 2 ? Math.min(50, rows) : 4;
  } else {
    delete field.rows;
  }

  if (nextType === 'number') {
    delete field.min_mode;
    delete field.max_mode;
    delete field.min_offset;
    delete field.max_offset;
    delete field.default_mode;
    delete field.default_offset;
  } else if (!['date', 'time', 'datetime'].includes(nextType)) {
    delete field.min;
    delete field.max;
    delete field.min_mode;
    delete field.max_mode;
    delete field.min_offset;
    delete field.max_offset;
    delete field.default_mode;
    delete field.default_offset;
    delete field.relation;
    delete field.relation_field;
  } else {
    // Migrating into a temporal type: legacy plain default → fixed mode.
    if (
      !field.default_mode &&
      field.default_value != null &&
      String(field.default_value).trim() !== ''
    ) {
      field.default_mode = 'fixed';
    }
    // Relations are type-specific (date↔date only).
    delete field.relation;
    delete field.relation_field;
  }

  const hooks = getFieldCardHooks();
  if (typeof hooks.onNormalizeType === 'function') {
    hooks.onNormalizeType(field, nextType);
  }
}

function createTypeSelect(field, row, onConvert) {
  const types = convertibleTypes(field.type);
  if (types.length < 2) {
    return null;
  }

  const select = el('select', {
    className: 'widefat',
    dataset: { blType: '1' },
  });
  types.forEach((type) => {
    const opt = el('option', {
      value: type,
      text: typeLabel(type),
    });
    if (type === field.type) {
      opt.selected = true;
    }
    select.appendChild(opt);
  });
  select.addEventListener('change', () => {
    const next = select.value;
    if (!canConvertType(field.type, next)) {
      select.value = field.type;
      return;
    }
    hydrateFieldFromCard(row, field);
    convertFieldType(field, next);
    onConvert(next);
  });

  return el('p', { className: 'bl-forms-builder__type-select' }, [
    el('label', { text: t('type', 'Type') }),
    select,
  ]);
}

const DESCRIPTION_TYPES = [
  'text',
  'email',
  'url',
  'number',
  'phone',
  'textarea',
  'wysiwyg',
  'date',
  'time',
  'datetime',
  'file',
  'image',
  'toggle',
  'select',
  'radio',
  'checkboxes',
  'button_group',
  'terms',
  'page',
  'link',
  'icon',
];
const NO_PLACEHOLDER = [
  'terms',
  'radio',
  'checkboxes',
  'button_group',
  'toggle',
  'file',
  'image',
  'hidden',
  'honeypot',
  'captcha',
  'divider',
  'spacer',
  'row_break',
  'heading',
  'text_block',
  'html',
  'wysiwyg',
  'column',
  'section',
  'tab',
  'date',
  'time',
  'datetime',
  'page',
  'link',
];
const NO_REQUIRED = [
  'hidden',
  'honeypot',
  'captcha',
  'divider',
  'spacer',
  'row_break',
  'heading',
  'text_block',
  'html',
  'column',
  'section',
  'tab',
];
const NO_READONLY = [
  ...NO_REQUIRED,
  'radio',
  'checkboxes',
  'button_group',
  'toggle',
  'terms',
  'file',
  'image',
  'page',
  'link',
];
const NO_DISABLED = [...NO_REQUIRED];
const AUTOCOMPLETE_TYPES = [
  'text',
  'email',
  'url',
  'number',
  'phone',
  'textarea',
  'select',
];
/** Single-line (and date) inputs that support ACF-style prefix / suffix. */
const AFFIX_TYPES = [
  'text',
  'email',
  'phone',
  'url',
  'number',
  'date',
  'time',
  'datetime',
];
const NO_DEFAULT = [
  'file',
  'image',
  'honeypot',
  'captcha',
  'divider',
  'spacer',
  'row_break',
  'heading',
  'text_block',
  'html',
  'page',
  'link',
];
const CHECKED_DEFAULT_TYPES = ['terms', 'toggle'];
const NAMED_TYPES = [
  'text',
  'textarea',
  'wysiwyg',
  'email',
  'phone',
  'url',
  'number',
  'checkboxes',
  'radio',
  'select',
  'toggle',
  'button_group',
  'date',
  'time',
  'datetime',
  'file',
  'image',
  'icon',
  'terms',
  'hidden',
  'honeypot',
  'page',
  'link',
];
const HIDE_LABEL_TYPES = NAMED_TYPES.filter((type) => type !== 'hidden' && type !== 'honeypot');

function createOptionsEditor(options) {
  const wrap = el('div', { className: 'bl-forms-builder__options' });
  const list = el('div', { className: 'bl-forms-builder__options-list' });

  list.appendChild(
    el('div', { className: 'bl-forms-builder__option bl-forms-builder__option--head' }, [
      el('span', {
        className: 'bl-forms-builder__option-heading-spacer bl-forms-builder__option-heading-spacer--handle',
        'aria-hidden': 'true',
      }),
      el('span', {
        className: 'bl-forms-builder__option-heading',
        text: t('optionLabel', 'Label'),
      }),
      el('span', {
        className: 'bl-forms-builder__option-heading',
        text: t('optionSlug', 'Slug'),
      }),
      el('span', {
        className: 'bl-forms-builder__option-heading-spacer',
        'aria-hidden': 'true',
      }),
    ])
  );

  const createOptionHandle = () => {
    const handle = el('span', {
      className: 'bl-forms-builder__option-handle bl-forms-builder__handle',
      title: t('dragOption', 'Drag to reorder'),
      'aria-hidden': 'true',
    });
    const dragIcon = iconEl('drag');
    if (dragIcon.innerHTML) {
      handle.appendChild(dragIcon);
    } else {
      handle.textContent = '⋮⋮';
    }
    return handle;
  };

  const addOption = (opt = { label: '', value: '' }) => {
    const labelText = opt.label || '';
    const valueText = opt.value || '';
    const autoSlug = labelText ? slugifyOption(labelText) : '';
    let slugManual = valueText !== '' && valueText !== autoSlug;

    const labelInput = el('input', {
      type: 'text',
      className: 'widefat',
      dataset: { blOptLabel: '1' },
      value: labelText,
      placeholder: t('optionLabel', 'Label'),
      'aria-label': t('optionLabel', 'Label'),
    });
    const slugInput = el('input', {
      type: 'text',
      className: 'widefat',
      dataset: { blOptValue: '1' },
      value: valueText || autoSlug,
      placeholder: t('optionSlug', 'Slug'),
      'aria-label': t('optionSlug', 'Slug'),
    });

    const syncSlugFromLabel = () => {
      if (slugManual) {
        return;
      }
      slugInput.value = slugifyOption(labelInput.value);
    };

    labelInput.addEventListener('input', () => {
      syncSlugFromLabel();
      document.dispatchEvent(new CustomEvent('bl-forms-builder-changed'));
    });
    slugInput.addEventListener('input', () => {
      slugManual = true;
      document.dispatchEvent(new CustomEvent('bl-forms-builder-changed'));
    });
    slugInput.addEventListener('blur', () => {
      const next = slugifyOption(slugInput.value || labelInput.value);
      slugInput.value = next;
      document.dispatchEvent(new CustomEvent('bl-forms-builder-changed'));
    });

    const deleteBtn = el('button', {
      type: 'button',
      className: 'bl-forms-builder__icon-btn bl-forms-builder__icon-btn--danger',
      title: t('delete', 'Delete'),
      'aria-label': t('delete', 'Delete'),
      onClick: () => {
        row.remove();
        document.dispatchEvent(new CustomEvent('bl-forms-builder-changed'));
      },
    });
    const trashIcon = iconEl('trash');
    if (trashIcon.innerHTML) {
      deleteBtn.appendChild(trashIcon);
    } else {
      deleteBtn.textContent = '×';
    }

    const row = el('div', { className: 'bl-forms-builder__option', dataset: { blOption: '1' } }, [
      createOptionHandle(),
      labelInput,
      slugInput,
      deleteBtn,
    ]);
    list.appendChild(row);
  };

  (options || []).forEach((opt) => addOption(opt));
  wrap.appendChild(list);
  wrap.appendChild(
    el('button', {
      type: 'button',
      className: 'button bl-button',
      text: t('addOption', 'Add option'),
      onClick: () => addOption(),
    })
  );

  const Builder = window.BlCanvasBuilder;
  if (Builder && typeof Builder.createSortable === 'function') {
    const notify = () => {
      document.dispatchEvent(new CustomEvent('bl-forms-builder-changed'));
    };
    Builder.createSortable(list, {
      group: { name: 'bl-forms-options', pull: false, put: false },
      handle: '.bl-forms-builder__option-handle',
      draggable: '[data-bl-option]',
      animation: 150,
      onUpdate: notify,
      onSort: notify,
    });
  }

  return wrap;
}

function createSegmentedControl(options, active, datasetKey, onSelect) {
  const group = el('div', {
    className: 'bl-forms-builder__segmented',
    role: 'group',
  });
  if (datasetKey) {
    group.dataset[datasetKey] = '1';
  }

  const sync = (value) => {
    group.querySelectorAll('button').forEach((btn) => {
      const on = btn.dataset.value === value;
      btn.classList.toggle('is-active', on);
      btn.setAttribute('aria-pressed', on ? 'true' : 'false');
    });
  };

  options.forEach((opt) => {
    const label = opt.label || '';
    const btn = el('button', {
      type: 'button',
      className:
        'bl-forms-builder__segmented-btn' + (opt.icon ? ' bl-forms-builder__segmented-btn--icon' : ''),
      dataset: { value: opt.value, ...(opt.dataset || {}) },
      title: opt.title || label,
      'aria-label': label,
      onClick: () => {
        sync(opt.value);
        onSelect(opt.value);
      },
    });
    if (opt.icon) {
      const icon = iconEl(opt.icon);
      if (icon.innerHTML) {
        btn.appendChild(icon);
      } else {
        btn.textContent = '✎';
      }
    } else {
      btn.textContent = label;
    }
    group.appendChild(btn);
  });

  sync(active);
  return group;
}

export function createWidthControl(field, onChange = () => {}, { showLabel = true } = {}) {
  const wrap = el('div', { className: 'bl-forms-builder__width bl-admin-form' });
  const customInput = el('input', {
    type: 'text',
    className: 'widefat bl-forms-builder__width-custom',
    dataset: { blWidthCustom: '1' },
    placeholder: t('widthCustomPlaceholder', 'e.g. 40% or 280px'),
    value: field.width_custom || '',
  });
  customInput.hidden = (field.width || '100') !== 'custom';

  const group = createSegmentedControl(
    WIDTH_PRESETS.map((preset) => ({
      value: preset.value,
      label: preset.label || t(preset.labelKey, 'Custom'),
      icon: preset.icon || '',
      dataset: { blWidth: preset.value },
    })),
    field.width || '100',
    'blWidthGroup',
    (value) => {
      field.width = value;
      customInput.hidden = value !== 'custom';
      onChange();
      document.dispatchEvent(new CustomEvent('bl-forms-builder-changed'));
    }
  );

  // Keep data-bl-width for serialize compatibility.
  group.querySelectorAll('button').forEach((btn) => {
    if (btn.dataset.value) {
      btn.dataset.blWidth = btn.dataset.value;
    }
  });

  customInput.addEventListener('input', () => {
    field.width_custom = customInput.value;
    field.width = 'custom';
    group.querySelectorAll('button').forEach((btn) => {
      const on = btn.dataset.blWidth === 'custom';
      btn.classList.toggle('is-active', on);
      btn.setAttribute('aria-pressed', on ? 'true' : 'false');
    });
    customInput.hidden = false;
    onChange();
  });

  if (showLabel) {
    wrap.appendChild(el('label', { text: t('width', 'Width') }));
  }
  wrap.append(group, customInput);
  return wrap;
}

/** Responsive spacer height: XS–XL presets + custom length (edit icon). */
export function createHeightControl(field, onChange = () => {}, { showLabel = true } = {}) {
  normalizeSpacerHeight(field);

  const wrap = el('div', { className: 'bl-forms-builder__height' });
  const customInput = el('input', {
    type: 'text',
    className: 'widefat bl-forms-builder__height-custom',
    dataset: { blHeightCustom: '1' },
    placeholder: t('spacerHeightCustomPlaceholder', 'e.g. 24px or 2rem'),
    value: field.height_custom || '',
  });
  customInput.hidden = (field.height || 'm') !== 'custom';

  const group = createSegmentedControl(
    SPACER_HEIGHT_PRESETS.map((preset) => ({
      value: preset.value,
      label: preset.label || t(preset.labelKey, 'Custom'),
      icon: preset.icon || '',
      dataset: { blHeight: preset.value },
    })),
    field.height || 'm',
    'blHeightGroup',
    (value) => {
      field.height = value;
      if (value !== 'custom') {
        field.height_custom = '';
      }
      customInput.hidden = value !== 'custom';
      onChange();
      document.dispatchEvent(new CustomEvent('bl-forms-builder-changed'));
    }
  );

  group.querySelectorAll('button').forEach((btn) => {
    if (btn.dataset.value) {
      btn.dataset.blHeight = btn.dataset.value;
    }
  });

  customInput.addEventListener('input', () => {
    field.height_custom = customInput.value;
    field.height = 'custom';
    group.querySelectorAll('button').forEach((btn) => {
      const on = btn.dataset.blHeight === 'custom';
      btn.classList.toggle('is-active', on);
      btn.setAttribute('aria-pressed', on ? 'true' : 'false');
    });
    customInput.hidden = false;
    onChange();
    document.dispatchEvent(new CustomEvent('bl-forms-builder-changed'));
  });

  if (showLabel) {
    wrap.appendChild(el('label', { text: t('spacerHeight', 'Height') }));
  }
  wrap.append(group, customInput);
  return wrap;
}

/** Divider vertical margin: XS–XL presets + custom length (edit icon). */
export function createMarginControl(field, onChange = () => {}, { showLabel = true } = {}) {
  normalizeDividerMargin(field);

  const wrap = el('div', { className: 'bl-forms-builder__margin' });
  const customInput = el('input', {
    type: 'text',
    className: 'widefat bl-forms-builder__margin-custom',
    dataset: { blMarginCustom: '1' },
    placeholder: t('dividerMarginCustomPlaceholder', 'e.g. 24px or 2rem'),
    value: field.margin_custom || '',
  });
  customInput.hidden = (field.margin || 'm') !== 'custom';

  const group = createSegmentedControl(
    DIVIDER_MARGIN_PRESETS.map((preset) => ({
      value: preset.value,
      label: preset.label || t(preset.labelKey, 'Custom'),
      icon: preset.icon || '',
      dataset: { blMargin: preset.value },
    })),
    field.margin || 'm',
    'blMarginGroup',
    (value) => {
      field.margin = value;
      if (value !== 'custom') {
        field.margin_custom = '';
      }
      customInput.hidden = value !== 'custom';
      onChange();
      document.dispatchEvent(new CustomEvent('bl-forms-builder-changed'));
    }
  );

  group.querySelectorAll('button').forEach((btn) => {
    if (btn.dataset.value) {
      btn.dataset.blMargin = btn.dataset.value;
    }
  });

  customInput.addEventListener('input', () => {
    field.margin_custom = customInput.value;
    field.margin = 'custom';
    group.querySelectorAll('button').forEach((btn) => {
      const on = btn.dataset.blMargin === 'custom';
      btn.classList.toggle('is-active', on);
      btn.setAttribute('aria-pressed', on ? 'true' : 'false');
    });
    customInput.hidden = false;
    onChange();
    document.dispatchEvent(new CustomEvent('bl-forms-builder-changed'));
  });

  if (showLabel) {
    wrap.appendChild(el('label', { text: t('dividerMargin', 'Margin') }));
  }
  wrap.append(group, customInput);
  return wrap;
}

/**
 * Modal to edit a field's width (columns and non-full-width fields).
 */
export function openFieldWidthModal(field, onApply) {
  document.querySelectorAll('.bl-forms-builder__modal').forEach((node) => node.remove());

  const draft = {
    width: field.width || '100',
    width_custom: field.width_custom || '',
  };

  const title =
    field.type === 'column'
      ? t('columnWidthTitle', 'Column width')
      : field.type === 'section'
        ? t('sectionWidthTitle', 'Section width')
        : field.type === 'tab'
          ? t('tabWidthTitle', 'Tab width')
          : t('width', 'Width');

  const backdrop = el('div', {
    className: 'bl-forms-builder__modal',
    role: 'dialog',
    'aria-modal': 'true',
    'aria-label': title,
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
      text: title,
    }),
  ]);

  const body = el('div', { className: 'bl-forms-builder__modal-body' });
  body.appendChild(createWidthControl(draft, () => {}, { showLabel: false }));

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
}

/**
 * Tabbed settings modal for layout containers (section / column / repeater).
 *
 * @param {object} field
 * @param {(field: object) => void} onApply
 * @param {object} [options]
 * @param {Array<'settings'|'advanced'|'design'|'logic'>} [options.tabs=['design','logic']]
 * @param {boolean} [options.withLabel=false]
 * @param {boolean} [options.withHideTitle=false]
 * @param {boolean} [options.withWidth=false]
 * @param {string} [options.logicHelp]
 * @param {(field: object) => void} [options.onLiveUpdate]
 */
export function openLayoutSettingsModal(field, onApply, options = {}) {
  document.querySelectorAll('.bl-forms-builder__modal').forEach((node) => node.remove());

  const tabIds = Array.isArray(options.tabs) && options.tabs.length
    ? options.tabs.filter((id) => ['settings', 'advanced', 'design', 'logic'].includes(id))
    : ['design', 'logic'];
  const withLabel = !!options.withLabel;
  const withHideTitle = !!options.withHideTitle;
  const withWidth = !!options.withWidth;
  const isRepeater = field.type === 'repeater';
  const logicHelp =
    options.logicHelp ||
    t('logicHelpContainer', 'Show this block only when the conditions below are met.');
  const liveUpdate =
    typeof options.onLiveUpdate === 'function' ? options.onLiveUpdate : null;

  const designs = [
    { value: 'standard', label: t('sectionDesignStandard', 'Standard') },
    { value: 'outline', label: t('sectionDesignOutline', 'Outline') },
    { value: 'card', label: t('sectionDesignCard', 'Card') },
  ];
  const allowedDesigns = designs.map((item) => item.value);

  const showTitleOn =
    !withHideTitle ||
    (field.show_title !== false && field.show_title !== 0 && field.show_title !== '0');

  const originalLabel = typeof field.label === 'string' ? field.label : '';
  const originalName = typeof field.name === 'string' ? field.name : '';
  const originalNameManual = field.name_manual !== false;
  /** @type {HTMLInputElement|null} */
  let nameInputEl = null;

  const draft = {
    id: field.id,
    type: field.type,
    label: originalLabel,
    design: allowedDesigns.includes(field.design) ? field.design : 'standard',
    css_class: typeof field.css_class === 'string' ? field.css_class : '',
    show_title: showTitleOn,
    width: field.width || '100',
    width_custom: field.width_custom || '',
    name: field.name || '',
    name_manual: field.name_manual !== false,
    min_rows: Math.max(0, parseInt(field.min_rows, 10) || 0),
    max_rows: Math.max(0, parseInt(field.max_rows, 10) || 0),
    button_label: field.button_label || '',
    conditional_logic: normalizeConditionalLogic(
      field.conditional_logic && typeof field.conditional_logic === 'object'
        ? JSON.parse(JSON.stringify(field.conditional_logic))
        : { enabled: false, groups: [] }
    ),
  };
  let draftHideTitle = withHideTitle ? !draft.show_title : false;
  let committed = false;

  const tabLabels = {
    settings: t('fieldTabSettings', 'Settings'),
    advanced: t('fieldTabAdvanced', 'Advanced'),
    design: t('fieldTabAppearance', 'Appearance'),
    logic: t('fieldTabLogic', 'Logic'),
  };

  const backdrop = el('div', {
    className: 'bl-forms-builder__modal',
    role: 'dialog',
    'aria-modal': 'true',
    'aria-label': t('layoutSettingsTitle', 'Settings'),
  });

  const syncLabelLive = () => {
    if (!withLabel) {
      return;
    }
    field.label = draft.label;
    if (isRepeater && !draft.name_manual) {
      field.name = uniqueFieldName(draft.label || 'items', field.id);
      draft.name = field.name;
      if (nameInputEl) {
        nameInputEl.value = field.name;
      }
    }
    if (liveUpdate) {
      liveUpdate(field);
    }
  };

  const close = () => {
    document.removeEventListener('keydown', onKey);
    if (!committed && withLabel) {
      field.label = originalLabel;
      if (isRepeater) {
        field.name = originalName;
        field.name_manual = originalNameManual;
      }
      if (liveUpdate) {
        liveUpdate(field);
      }
    }
    backdrop.remove();
  };

  const apply = () => {
    field.design = draft.design;
    field.css_class = String(draft.css_class || '').trim();
    if (withHideTitle) {
      field.show_title = !draftHideTitle;
    }
    if (withWidth) {
      field.width = draft.width || '100';
      field.width_custom = field.width === 'custom' ? draft.width_custom || '' : '';
    }
    if (tabIds.includes('settings')) {
      if (withLabel) {
        field.label = String(draft.label || '');
      }
      if (isRepeater) {
        field.name = String(draft.name || '').trim() || field.name || 'items';
        field.name_manual = draft.name_manual !== false;
        field.button_label = String(draft.button_label || '');
      }
    }
    if (tabIds.includes('advanced') && isRepeater) {
      field.min_rows = Math.max(0, parseInt(draft.min_rows, 10) || 0);
      field.max_rows = Math.max(0, parseInt(draft.max_rows, 10) || 0);
    }
    if (tabIds.includes('logic')) {
      field.conditional_logic = normalizeConditionalLogic(draft.conditional_logic);
    }
    committed = true;
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

  const dialog = el('div', {
    className: 'bl-forms-builder__modal-dialog bl-forms-builder__modal-dialog--settings',
  });

  const tabBar = el('nav', {
    className: 'bl-forms-builder__modal-tabs',
    role: 'tablist',
  });
  const panelsWrap = el('div', {
    className: 'bl-forms-builder__modal-body bl-forms-builder__modal-body--settings',
  });

  const panels = {};
  const tabButtons = {};
  let activeTab = tabIds[0];

  const activate = (id) => {
    activeTab = id;
    tabIds.forEach((tabId) => {
      const on = tabId === id;
      tabButtons[tabId].classList.toggle('is-active', on);
      tabButtons[tabId].setAttribute('aria-selected', on ? 'true' : 'false');
      panels[tabId].hidden = !on;
      panels[tabId].classList.toggle('is-active', on);
    });
  };

  tabIds.forEach((tabId) => {
    const panel = el('div', {
      className:
        'bl-forms-builder__modal-panel' +
        (tabId === 'design' ? ' bl-forms-builder__modal-body--design' : ''),
      role: 'tabpanel',
      dataset: { blModalPanel: tabId },
    });
    panels[tabId] = panel;
    panelsWrap.appendChild(panel);

    const btn = el('button', {
      type: 'button',
      className: 'bl-forms-builder__modal-tab',
      role: 'tab',
      text: tabLabels[tabId] || tabId,
      dataset: { blModalTab: tabId },
      onClick: () => activate(tabId),
    });
    tabButtons[tabId] = btn;
    tabBar.appendChild(btn);
  });

  if (tabIds.includes('settings')) {
    const settingsPanel = panels.settings;
    if (withLabel) {
      const labelInput = el('input', {
        type: 'text',
        className: 'widefat',
        value: draft.label || '',
        placeholder: t('sectionLabelPlaceholder', 'Title'),
      });
      labelInput.addEventListener('input', () => {
        draft.label = labelInput.value;
        syncLabelLive();
      });
      const labelControls = el('div', { className: 'bl-forms-builder__label-controls' }, [labelInput]);
      if (withHideTitle) {
        labelControls.appendChild(
          el('div', { className: 'bl-forms-builder__hide-label' }, [
            createSwitchSetting('blHideTitle', t('hideLabel', 'Hide'), draftHideTitle, (checked) => {
              draftHideTitle = checked;
            }),
          ])
        );
      }
      settingsPanel.append(
        el('div', { className: 'bl-forms-builder__label-row' }, [
          el('label', { text: t('label', 'Label') }),
          labelControls,
        ])
      );
    }
    if (isRepeater) {
      const nameInput = el('input', {
        type: 'text',
        className: 'widefat',
        value: draft.name || '',
        placeholder: 'items',
        dataset: { blLayoutName: '1' },
      });
      nameInputEl = nameInput;
      nameInput.addEventListener('input', () => {
        draft.name_manual = true;
        draft.name = nameInput.value;
      });
      const buttonInput = el('input', {
        type: 'text',
        className: 'widefat',
        value: draft.button_label || '',
        placeholder: t('addRow', 'Add entry'),
      });
      buttonInput.addEventListener('input', () => {
        draft.button_label = buttonInput.value;
      });

      settingsPanel.append(
        el('p', {}, [el('label', { text: t('name', 'Field name') }), nameInput]),
        el('p', {
          className: 'description',
          text: t(
            'nameHelp',
            'Internal field key used in submissions, emails, and entry data.'
          ),
        }),
        el('p', {}, [el('label', { text: t('repeaterButtonLabel', 'Add button label') }), buttonInput])
      );
    }
  }

  if (tabIds.includes('advanced') && isRepeater) {
    const advancedPanel = panels.advanced;
    const minInput = el('input', {
      type: 'number',
      className: 'widefat',
      min: '0',
      value: String(draft.min_rows || 0),
    });
    minInput.addEventListener('input', () => {
      draft.min_rows = Math.max(0, parseInt(minInput.value, 10) || 0);
    });
    const maxInput = el('input', {
      type: 'number',
      className: 'widefat',
      min: '0',
      value: String(draft.max_rows || 0),
    });
    maxInput.addEventListener('input', () => {
      draft.max_rows = Math.max(0, parseInt(maxInput.value, 10) || 0);
    });
    advancedPanel.append(
      el('p', {}, [el('label', { text: t('repeaterMinRows', 'Min rows') }), minInput]),
      el('p', {}, [el('label', { text: t('repeaterMaxRows', 'Max rows') }), maxInput]),
      el('p', {
        className: 'description',
        text: t('repeaterMaxRowsHelp', '0 = unlimited'),
      })
    );
  }

  if (tabIds.includes('design')) {
    const designPanel = panels.design;
    const designWrap = el('div', { className: 'bl-forms-builder__design-style' });
    designWrap.append(
      settingHeading(t('layoutDesignTitle', 'Design')),
      createSegmentedControl(designs, draft.design, 'blDesignGroup', (value) => {
        draft.design = value;
      })
    );
    designPanel.appendChild(designWrap);

    if (withWidth) {
      designPanel.appendChild(createWidthControl(draft, () => {}, { showLabel: true }));
    }

    const cssInput = el('input', {
      type: 'text',
      className: 'widefat',
      dataset: { blCssClass: '1' },
      value: draft.css_class,
      placeholder: t('cssClassPlaceholder', 'e.g. my-field'),
    });
    cssInput.addEventListener('input', () => {
      draft.css_class = cssInput.value;
    });
    const cssWrap = el('div', { className: 'bl-forms-builder__css-class' });
    cssWrap.appendChild(el('p', {}, [el('label', { text: t('cssClass', 'CSS class') }), cssInput]));
    cssWrap.appendChild(
      el('p', {
        className: 'description',
        text: t('cssClassHelp', 'Optional class names added to this field’s wrapper.'),
      })
    );
    designPanel.appendChild(cssWrap);
  }

  if (tabIds.includes('logic')) {
    const logicPanel = panels.logic;
    const editor = createConditionalLogicEditor(draft, undefined, null);
    const help = editor.querySelector('.bl-forms-builder__logic-help');
    if (help) {
      help.textContent = logicHelp;
    }
    logicPanel.appendChild(editor);
  }

  activate(activeTab);

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

  const header = el('div', { className: 'bl-forms-builder__modal-header bl-forms-builder__modal-header--tabs' }, [
    tabBar,
  ]);
  dialog.append(header, panelsWrap, footer);
  backdrop.appendChild(dialog);
  document.body.appendChild(backdrop);
}

/** @deprecated Use openLayoutSettingsModal */
export function openLayoutDesignModal(field, onApply, options = {}) {
  openLayoutSettingsModal(field, onApply, {
    tabs: ['design'],
    withHideTitle: !!options.withShowTitle,
    ...options,
  });
}

/** @deprecated Use openLayoutSettingsModal */
export function openSectionDesignModal(field, onApply, options = {}) {
  openLayoutSettingsModal(field, onApply, {
    tabs: ['settings', 'design', 'logic'],
    withLabel: true,
    withHideTitle: true,
    ...options,
  });
}

function syncWidthControlUi(scope, field) {
  const group = scope?.querySelector('[data-bl-width-group]');
  if (!group) {
    return;
  }
  const width = field.width || '100';
  group.querySelectorAll('[data-bl-width]').forEach((btn) => {
    const on = btn.dataset.blWidth === width;
    btn.classList.toggle('is-active', on);
    btn.setAttribute('aria-pressed', on ? 'true' : 'false');
  });
  const custom = scope.querySelector('[data-bl-width-custom]');
  if (custom) {
    custom.hidden = width !== 'custom';
    if (width === 'custom') {
      custom.value = field.width_custom || '';
    }
  }
}

function createLayoutControl(field) {
  const wrap = el('div', { className: 'bl-forms-builder__layout' });
  const isButtonGroup = field.type === 'button_group';
  const active = isButtonGroup
    ? field.layout === 'vertical'
      ? 'vertical'
      : 'horizontal'
    : field.layout === 'horizontal'
      ? 'horizontal'
      : 'vertical';
  if (!field.layout) {
    field.layout = active;
  }
  const options = isButtonGroup
    ? [
        { value: 'horizontal', label: t('layoutHorizontal', 'Horizontal') },
        { value: 'vertical', label: t('layoutVertical', 'Vertical') },
      ]
    : [
        { value: 'vertical', label: t('layoutVertical', 'Vertical') },
        { value: 'horizontal', label: t('layoutHorizontal', 'Horizontal') },
      ];
  const group = createSegmentedControl(
    options,
    active,
    'blLayoutGroup',
    (value) => {
      field.layout = value;
      document.dispatchEvent(new CustomEvent('bl-forms-builder-changed'));
    }
  );
  group.querySelectorAll('button').forEach((btn) => {
    btn.dataset.blLayout = btn.dataset.value;
  });
  wrap.append(el('label', { text: t('layout', 'Layout') }), group);
  return wrap;
}

function defaultShowAsCheckbox(type) {
  return type !== 'toggle';
}

function createShowAsCheckboxControl(field) {
  if (field.show_as_checkbox === undefined) {
    field.show_as_checkbox = defaultShowAsCheckbox(field.type);
  }
  const wrap = el('div', { className: 'bl-forms-builder__design-style' });
  wrap.append(
    settingHeading(t('layoutDesignTitle', 'Design')),
    createSwitchSetting(
      'blShowAsCheckbox',
      t('showAsCheckbox', 'Show as checkbox'),
      !!field.show_as_checkbox,
      (checked) => {
        field.show_as_checkbox = checked;
        document.dispatchEvent(new CustomEvent('bl-forms-builder-changed'));
      }
    )
  );
  return wrap;
}

function headingLevelFallback(levels) {
  if (levels.includes('h4')) {
    return 'h4';
  }
  return levels[0] || 'h2';
}

function normalizeHeadingLevel(field) {
  const levels = getHeadingLevels();
  const level = String(field.level || '').toLowerCase();
  field.level = levels.includes(level) ? level : headingLevelFallback(levels);
}

/** Heading tag level control (Forms: H1–H6, Blocks: H2–H4). */
function createHeadingLevelControl(field, onChange = () => {}) {
  normalizeHeadingLevel(field);
  const levels = getHeadingLevels();
  const wrap = el('div', { className: 'bl-forms-builder__heading-level' });
  const group = createSegmentedControl(
    levels.map((level) => ({
      value: level,
      label: level.toUpperCase(),
      dataset: { blHeadingLevel: level },
    })),
    field.level || headingLevelFallback(levels),
    'blHeadingLevelGroup',
    (value) => {
      field.level = value;
      onChange();
      document.dispatchEvent(new CustomEvent('bl-forms-builder-changed'));
    }
  );
  group.querySelectorAll('button').forEach((btn) => {
    if (btn.dataset.value) {
      btn.dataset.blHeadingLevel = btn.dataset.value;
    }
  });
  wrap.append(el('label', { text: t('headingLevel', 'Level') }), group);
  return wrap;
}

function createAutocompleteControl(field) {
  const select = el('select', {
    className: 'widefat',
    dataset: { blAutocomplete: '1' },
  });
  const active = field.autocomplete === 'off' ? 'off' : 'auto';
  [
    { value: 'auto', label: t('autocompleteAutomatic', 'Automatic') },
    { value: 'off', label: t('autocompleteOff', 'Off') },
  ].forEach((opt) => {
    const option = el('option', { value: opt.value, text: opt.label });
    if (opt.value === active) {
      option.selected = true;
    }
    select.appendChild(option);
  });
  select.addEventListener('change', () => {
    field.autocomplete = select.value === 'off' ? 'off' : 'auto';
    document.dispatchEvent(new CustomEvent('bl-forms-builder-changed'));
  });
  return el('p', { className: 'bl-forms-builder__autocomplete bl-forms-builder__type-select' }, [
    el('label', { text: t('autocomplete', 'Autocomplete') }),
    select,
  ]);
}

function createNumberBoundsControl(field) {
  const minInput = el('input', {
    type: 'number',
    className: 'widefat',
    dataset: { blMin: '1' },
    value: field.min != null && field.min !== '' ? String(field.min) : '',
    step: 'any',
  });
  const maxInput = el('input', {
    type: 'number',
    className: 'widefat',
    dataset: { blMax: '1' },
    value: field.max != null && field.max !== '' ? String(field.max) : '',
    step: 'any',
  });

  const sync = () => {
    field.min = minInput.value.trim();
    field.max = maxInput.value.trim();
    document.dispatchEvent(new CustomEvent('bl-forms-builder-changed'));
  };
  minInput.addEventListener('change', sync);
  maxInput.addEventListener('change', sync);
  minInput.addEventListener('blur', sync);
  maxInput.addEventListener('blur', sync);

  return el('div', { className: 'bl-forms-builder__number-bounds' }, [
    el('p', {}, [el('label', { text: t('minValue', 'Minimum') }), minInput]),
    el('p', {}, [el('label', { text: t('maxValue', 'Maximum') }), maxInput]),
  ]);
}

function createSelectionBoundsControl(field) {
  const parseLimit = (raw) => {
    const next = parseInt(raw, 10);
    return Number.isFinite(next) && next >= 1 ? Math.min(50, next) : '';
  };

  const minInput = el('input', {
    type: 'number',
    className: 'widefat',
    min: '1',
    max: '50',
    step: '1',
    dataset: { blMinSelections: '1' },
    value:
      field.min_selections != null && field.min_selections !== ''
        ? String(parseLimit(field.min_selections) || '')
        : '',
  });
  const maxInput = el('input', {
    type: 'number',
    className: 'widefat',
    min: '1',
    max: '50',
    step: '1',
    dataset: { blMaxSelections: '1' },
    value:
      field.max_selections != null && field.max_selections !== ''
        ? String(parseLimit(field.max_selections) || '')
        : '',
  });

  const sync = () => {
    let min = parseLimit(minInput.value);
    let max = parseLimit(maxInput.value);
    if (min !== '' && max !== '' && min > max) {
      [min, max] = [max, min];
    }
    field.min_selections = min === '' ? '' : min;
    field.max_selections = max === '' ? '' : max;
    minInput.value = min === '' ? '' : String(min);
    maxInput.value = max === '' ? '' : String(max);
    document.dispatchEvent(new CustomEvent('bl-forms-builder-changed'));
  };
  minInput.addEventListener('change', sync);
  maxInput.addEventListener('change', sync);
  minInput.addEventListener('blur', sync);
  maxInput.addEventListener('blur', sync);

  return el('div', { className: 'bl-forms-builder__selection-bounds' }, [
    el('div', { className: 'bl-forms-builder__number-bounds' }, [
      el('p', {}, [el('label', { text: t('minSelections', 'Minimum selections') }), minInput]),
      el('p', {}, [el('label', { text: t('maxSelections', 'Maximum selections') }), maxInput]),
    ]),
    el('p', {
      className: 'description',
      text: t(
        'selectionBoundsHelp',
        'Leave empty for no limit. When the maximum is reached, further options cannot be selected.'
      ),
    }),
  ]);
}

function createPrefixSuffixControl(field) {
  const prefixInput = el('input', {
    type: 'text',
    className: 'widefat',
    dataset: { blPrefix: '1' },
    value: field.prefix != null ? String(field.prefix) : '',
  });
  const suffixInput = el('input', {
    type: 'text',
    className: 'widefat',
    dataset: { blSuffix: '1' },
    value: field.suffix != null ? String(field.suffix) : '',
  });

  const sync = () => {
    field.prefix = prefixInput.value;
    field.suffix = suffixInput.value;
    document.dispatchEvent(new CustomEvent('bl-forms-builder-changed'));
  };
  prefixInput.addEventListener('input', sync);
  suffixInput.addEventListener('input', sync);
  prefixInput.addEventListener('change', sync);
  suffixInput.addEventListener('change', sync);

  return el('div', { className: 'bl-forms-builder__affix-bounds' }, [
    el('p', {}, [el('label', { text: t('prefix', 'Prefix') }), prefixInput]),
    el('p', {}, [el('label', { text: t('suffix', 'Suffix') }), suffixInput]),
  ]);
}

function createLengthLimitsControl(field) {
  const minInput = el('input', {
    type: 'number',
    className: 'widefat',
    min: '1',
    step: '1',
    dataset: { blMinLength: '1' },
    value: field.min_length != null && field.min_length !== '' ? String(field.min_length) : '',
  });
  const maxInput = el('input', {
    type: 'number',
    className: 'widefat',
    min: '1',
    step: '1',
    dataset: { blMaxLength: '1' },
    value: field.max_length != null && field.max_length !== '' ? String(field.max_length) : '',
  });

  const syncShow = (checked) => {
    field.show_char_count = !!checked;
    document.dispatchEvent(new CustomEvent('bl-forms-builder-changed'));
  };

  const showSwitch = createSwitchSetting(
    'blShowCharCount',
    t('showCharCount', 'Show character count'),
    !!field.show_char_count,
    syncShow
  );
  const showWrap = el('div', { className: 'bl-forms-builder__char-count-toggle' }, [showSwitch]);
  const showInput = showSwitch.querySelector('input[type="checkbox"]');

  const syncVisibility = () => {
    const max = parseInt(maxInput.value, 10);
    const hasMax = Number.isFinite(max) && max > 0;
    showWrap.hidden = !hasMax;
    if (!hasMax) {
      field.show_char_count = false;
      if (showInput) {
        showInput.checked = false;
      }
    }
  };

  const syncMin = () => {
    field.min_length = minInput.value.trim();
    document.dispatchEvent(new CustomEvent('bl-forms-builder-changed'));
  };
  const syncMax = () => {
    field.max_length = maxInput.value.trim();
    syncVisibility();
    document.dispatchEvent(new CustomEvent('bl-forms-builder-changed'));
  };
  minInput.addEventListener('change', syncMin);
  minInput.addEventListener('blur', syncMin);
  minInput.addEventListener('input', syncMin);
  maxInput.addEventListener('change', syncMax);
  maxInput.addEventListener('blur', syncMax);
  maxInput.addEventListener('input', syncMax);
  syncVisibility();

  return el('div', { className: 'bl-forms-builder__length-limits' }, [
    el('p', {}, [el('label', { text: t('minLength', 'Minimum length') }), minInput]),
    el('div', { className: 'bl-forms-builder__length-max' }, [
      el('p', {}, [el('label', { text: t('maxLength', 'Maximum length') }), maxInput]),
      showWrap,
    ]),
  ]);
}

function createTextareaRowsControl(field) {
  const rows = parseInt(field.rows, 10);
  const value = Number.isFinite(rows) && rows >= 2 ? String(Math.min(50, rows)) : '4';
  const input = el('input', {
    type: 'number',
    className: 'widefat',
    min: '2',
    max: '50',
    step: '1',
    dataset: { blRows: '1' },
    value,
  });

  const sync = () => {
    const next = parseInt(input.value, 10);
    field.rows = Number.isFinite(next) && next >= 2 ? Math.min(50, next) : 4;
    input.value = String(field.rows);
    document.dispatchEvent(new CustomEvent('bl-forms-builder-changed'));
  };
  input.addEventListener('change', sync);
  input.addEventListener('blur', sync);

  return el('p', {}, [el('label', { text: t('textareaRows', 'Rows') }), input]);
}

function createExtensionsControl(field) {
  const placeholder =
    field.type === 'image'
      ? 'jpg, jpeg, png, webp, gif, heic, avif'
      : 'pdf, docx, xlsx, zip';
  const input = el('input', {
    type: 'text',
    className: 'widefat',
    dataset: { blExtensions: '1' },
    value:
      field.extensions != null
        ? String(field.extensions)
        : field.type === 'image'
          ? 'jpg, jpeg, png, webp, gif, heic, avif'
          : '',
    placeholder,
  });

  const sync = () => {
    field.extensions = input.value.trim();
    document.dispatchEvent(new CustomEvent('bl-forms-builder-changed'));
  };
  input.addEventListener('input', sync);
  input.addEventListener('change', sync);
  input.addEventListener('blur', sync);

  return el('div', { className: 'bl-forms-builder__extensions' }, [
    el('p', {}, [el('label', { text: t('allowedExtensions', 'Allowed extensions') }), input]),
    el('p', {
      className: 'description',
      text: t(
        'allowedExtensionsHelp',
        'Comma-separated list without dots, e.g. pdf, docx, xlsx. Leave empty to allow all WordPress-permitted types.'
      ),
    }),
  ]);
}

function createMaxFilesControl(field) {
  const raw = parseInt(field.max_files, 10);
  const value = Number.isFinite(raw) && raw >= 1 ? String(Math.min(50, raw)) : '10';
  const input = el('input', {
    type: 'number',
    className: 'widefat',
    min: '1',
    max: '50',
    step: '1',
    dataset: { blMaxFiles: '1' },
    value,
  });

  const sync = () => {
    const next = parseInt(input.value, 10);
    field.max_files = Number.isFinite(next) && next >= 1 ? Math.min(50, next) : 10;
    input.value = String(field.max_files);
    document.dispatchEvent(new CustomEvent('bl-forms-builder-changed'));
  };
  input.addEventListener('change', sync);
  input.addEventListener('blur', sync);

  return el('div', { className: 'bl-forms-builder__max-files' }, [
    el('p', {}, [
      el('label', {
        text: useMediaLibraryFields()
          ? t('maxMediaItems', 'Maximum items')
          : t('maxFiles', 'Maximum files'),
      }),
      input,
    ]),
    el('p', {
      className: 'description',
      text: useMediaLibraryFields()
        ? t('maxMediaHelp', 'Maximum number of items that can be selected from the media library.')
        : t('maxFilesHelp', 'Maximum number of files visitors can upload.'),
    }),
  ]);
}

function createMaxSizeControl(field) {
  const globalMb = (window.blFormsAdmin && window.blFormsAdmin.uploadMaxSizeMb) || '';
  const wpMaxLabel = (window.blFormsAdmin && window.blFormsAdmin.wpMaxUploadSize) || '';
  const placeholder = globalMb !== '' ? String(globalMb) : '';
  const help =
    globalMb !== '' || wpMaxLabel !== ''
      ? t('fieldMaxSizeHelp', 'Leave empty to use the global default (%s).').replace(
          '%s',
          globalMb !== '' ? `${globalMb} ${t('uploadMaxSizeUnit', 'MB')}` : wpMaxLabel
        )
      : t('fieldMaxSizeHelpEmpty', 'Leave empty to use the global default.');

  const input = el('input', {
    type: 'number',
    className: 'small-text',
    min: '0.1',
    step: '0.1',
    dataset: { blMaxSizeMb: '1' },
    value: field.max_size_mb != null && field.max_size_mb !== '' ? String(field.max_size_mb) : '',
    placeholder,
  });

  const sync = () => {
    field.max_size_mb = input.value.trim();
    document.dispatchEvent(new CustomEvent('bl-forms-builder-changed'));
  };
  input.addEventListener('input', sync);
  input.addEventListener('change', sync);

  return el('div', { className: 'bl-forms-builder__max-size' }, [
    el('p', {}, [
      el('label', { text: t('fieldMaxSize', 'Maximum file size') }),
      el('span', { className: 'bl-forms-builder__security-inline' }, [
        input,
        el('span', { text: t('uploadMaxSizeUnit', 'MB') }),
      ]),
    ]),
    el('p', { className: 'description', text: help }),
  ]);
}

function createUploadButtonControl(field) {
  const fallbacks = (window.blFormsAdmin && window.blFormsAdmin.messageFallbacks) || {};
  const placeholder = fallbacks.upload_button || t('uploadButtonDefault', 'Choose file');
  const input = el('input', {
    type: 'text',
    className: 'widefat',
    value: field.button_text || '',
    placeholder,
    dataset: { blUploadButton: '1' },
  });
  input.addEventListener('input', () => {
    field.button_text = input.value;
    document.dispatchEvent(new CustomEvent('bl-forms-builder-changed'));
  });
  return el('p', {}, [
    el('label', { text: t('uploadButtonText', 'Button label') }),
    input,
  ]);
}

function createUploadAppearanceControls(field) {
  if (field.upload_style !== 'classic' && field.upload_style !== 'modern') {
    field.upload_style = 'modern';
  }
  if (field.preview === undefined) {
    field.preview = true;
  }

  const styleSelect = el('select', {
    className: 'widefat',
    dataset: { blUploadStyle: '1' },
    'aria-label': t('uploadStyle', 'Style'),
  });
  [
    { id: 'modern', label: t('uploadStyleModern', 'Modern') },
    { id: 'classic', label: t('uploadStyleClassic', 'Classic') },
  ].forEach((opt) => {
    const option = el('option', { value: opt.id, text: opt.label });
    if (field.upload_style === opt.id) {
      option.selected = true;
    }
    styleSelect.appendChild(option);
  });

  const previewWrap = el('div', { className: 'bl-forms-builder__upload-preview-setting' });
  const syncPreviewVisibility = () => {
    previewWrap.hidden = field.upload_style !== 'modern';
  };

  const previewSwitch = createSwitchSetting(
    'blPreview',
    t('showUploadPreview', 'Show file preview'),
    field.preview !== false,
    (checked) => {
      field.preview = checked;
      document.dispatchEvent(new CustomEvent('bl-forms-builder-changed'));
    }
  );
  previewWrap.appendChild(previewSwitch);

  styleSelect.addEventListener('change', () => {
    field.upload_style = styleSelect.value === 'classic' ? 'classic' : 'modern';
    if (field.upload_style === 'modern' && field.preview === undefined) {
      field.preview = true;
    }
    syncPreviewVisibility();
    document.dispatchEvent(new CustomEvent('bl-forms-builder-changed'));
  });
  syncPreviewVisibility();

  return el('div', { className: 'bl-forms-builder__upload-appearance' }, [
    el('p', { className: 'bl-forms-builder__type-select' }, [
      el('label', { text: t('uploadStyle', 'Style') }),
      styleSelect,
    ]),
    previewWrap,
  ]);
}

function temporalInputType(type) {
  if (type === 'time') {
    return 'time';
  }
  if (type === 'datetime') {
    return 'datetime-local';
  }
  return 'date';
}

function temporalBoundModes(type, { emptyLabel } = {}) {
  const none = {
    id: '',
    label: emptyLabel || t('boundNone', 'No limit'),
  };
  if (type === 'time') {
    return [
      none,
      { id: 'fixed', label: t('boundFixedTime', 'Fixed time') },
      { id: 'today', label: t('boundNow', 'Now') },
      { id: 'hour', label: t('boundCurrentHour', 'Current hour') },
      { id: 'offset', label: t('boundNowOffset', 'Minutes relative to now') },
    ];
  }
  if (type === 'datetime') {
    return [
      none,
      { id: 'fixed', label: t('boundFixedDatetime', 'Fixed date & time') },
      { id: 'today', label: t('boundNow', 'Now') },
      { id: 'offset', label: t('boundTodayOffset', 'Days relative to today') },
    ];
  }
  return [
    none,
    { id: 'fixed', label: t('boundFixedDate', 'Fixed date') },
    { id: 'today', label: t('boundToday', 'Today') },
    { id: 'offset', label: t('boundTodayOffset', 'Days relative to today') },
  ];
}

/**
 * One temporal mode control (min / max / default): select + fixed/offset extras.
 *
 * @param {object} field
 * @param {'min'|'max'|'default'} which
 * @param {{ label?: string, emptyLabel?: string, onChange?: () => void }} options
 */
function createTemporalModeControl(field, which, options = {}) {
  const type = field.type;
  const modeKey = `${which}_mode`;
  const offsetKey = `${which}_offset`;
  const valueKey = which === 'default' ? 'default_value' : which;
  const datasetMode =
    which === 'min' ? 'blMinMode' : which === 'max' ? 'blMaxMode' : 'blDefaultMode';
  const datasetValue =
    which === 'min' ? 'blMin' : which === 'max' ? 'blMax' : 'blDefault';
  const datasetOffset =
    which === 'min' ? 'blMinOffset' : which === 'max' ? 'blMaxOffset' : 'blDefaultOffset';

  // Legacy plain default_value without mode → fixed.
  if (
    which === 'default' &&
    !field[modeKey] &&
    field[valueKey] != null &&
    String(field[valueKey]).trim() !== ''
  ) {
    field[modeKey] = 'fixed';
  }

  if (field[modeKey] == null) {
    field[modeKey] = '';
  }
  if (field[offsetKey] == null || field[offsetKey] === '') {
    field[offsetKey] = 0;
  }

  const modeSelect = el('select', {
    className: 'widefat',
    dataset: { [datasetMode]: '1' },
  });
  temporalBoundModes(type, { emptyLabel: options.emptyLabel }).forEach((mode) => {
    const option = el('option', { value: mode.id, text: mode.label });
    if ((field[modeKey] || '') === mode.id) {
      option.selected = true;
    }
    modeSelect.appendChild(option);
  });

  const fixedInput = el('input', {
    type: temporalInputType(type),
    className: 'widefat bl-forms-builder__temporal-fixed',
    dataset: { [datasetValue]: '1' },
    value: field[valueKey] != null && field[valueKey] !== '' ? String(field[valueKey]) : '',
  });

  const offsetInput = el('input', {
    type: 'number',
    className: 'small-text bl-forms-builder__temporal-offset',
    dataset: { [datasetOffset]: '1' },
    step: '1',
    value: String(field[offsetKey] ?? 0),
  });

  const extras = el('div', { className: 'bl-forms-builder__temporal-extras' });

  const emit = () => {
    if (typeof options.onChange === 'function') {
      options.onChange();
    }
    document.dispatchEvent(new CustomEvent('bl-forms-builder-changed'));
  };

  const syncExtras = () => {
    const mode = field[modeKey] || '';
    extras.replaceChildren();
    if (mode === 'fixed') {
      extras.appendChild(fixedInput);
    } else if (mode === 'offset') {
      const unit = type === 'time' ? t('boundMinutes', 'minutes') : t('boundDays', 'days');
      const prefix =
        type === 'time' ? t('boundNowPlus', 'Now ±') : t('boundTodayPlus', 'Today ±');
      extras.appendChild(
        el('div', { className: 'bl-forms-builder__temporal-offset-row' }, [
          el('span', { text: prefix }),
          offsetInput,
          el('span', { text: unit }),
        ])
      );
    }
  };

  modeSelect.addEventListener('change', () => {
    field[modeKey] = modeSelect.value || '';
    if (!field[modeKey]) {
      field[valueKey] = '';
    }
    syncExtras();
    emit();
  });
  fixedInput.addEventListener('change', () => {
    field[valueKey] = fixedInput.value;
    emit();
  });
  fixedInput.addEventListener('input', () => {
    field[valueKey] = fixedInput.value;
  });
  offsetInput.addEventListener('input', () => {
    const n = parseInt(offsetInput.value, 10);
    field[offsetKey] = Number.isFinite(n) ? n : 0;
    emit();
  });

  syncExtras();

  const nodes = [modeSelect, extras];
  if (options.label) {
    nodes.unshift(el('label', { text: options.label }));
  }
  return el('p', { className: 'bl-forms-builder__temporal-side' }, nodes);
}

/**
 * Min/max bound picker for date, time, and datetime fields (select + extras, like number bounds).
 */
function createTemporalBoundsControl(field) {
  return el('div', { className: 'bl-forms-builder__temporal-bounds' }, [
    createTemporalModeControl(field, 'min', { label: t('minValue', 'Minimum') }),
    createTemporalModeControl(field, 'max', { label: t('maxValue', 'Maximum') }),
  ]);
}

/**
 * Other temporal fields of the same type (for before/after relations).
 */
function siblingTemporalFields(field) {
  const config = readConfig();
  return flattenFields(config.fields || []).filter(
    (item) =>
      item &&
      item.type === field.type &&
      item.id !== field.id &&
      String(item.name || '').trim() !== ''
  );
}

/**
 * Relation validator: this date/time must be before or after another field.
 */
function createTemporalRelationControl(field) {
  const siblings = siblingTemporalFields(field);
  if (siblings.length === 0) {
    return null;
  }

  let relation = String(field.relation || 'none');
  if (!['none', 'before', 'after'].includes(relation)) {
    relation = 'none';
  }
  field.relation = relation;

  const wrap = el('div', { className: 'bl-forms-builder__date-relation' });

  const modeSelect = el('select', {
    className: 'widefat',
    dataset: { blRelation: '1' },
    'aria-label': t('dateRelation', 'Relation'),
  });
  [
    { value: 'none', label: t('dateRelationNone', 'No relation') },
    { value: 'before', label: t('dateRelationBefore', 'Must be before') },
    { value: 'after', label: t('dateRelationAfter', 'Must be after') },
  ].forEach((item) => {
    const option = el('option', { value: item.value, text: item.label });
    if (item.value === relation) {
      option.selected = true;
    }
    modeSelect.appendChild(option);
  });

  const fieldSelect = el('select', {
    className: 'widefat',
    dataset: { blRelationField: '1' },
    'aria-label': t('dateRelationSelect', 'Select field'),
  });
  fieldSelect.appendChild(
    el('option', { value: '', text: t('dateRelationSelect', 'Select field') })
  );
  const currentRelated = String(field.relation_field || '');
  siblings.forEach((item) => {
    const value = String(item.name || '');
    const label = String(item.label || item.name || value).trim() || value;
    const option = el('option', { value, text: label });
    if (value === currentRelated) {
      option.selected = true;
    }
    fieldSelect.appendChild(option);
  });
  if (currentRelated && !siblings.some((item) => String(item.name || '') === currentRelated)) {
    field.relation_field = '';
    fieldSelect.value = '';
  }

  const fieldWrap = el('div', { className: 'bl-forms-builder__date-relation-field' }, [fieldSelect]);

  const syncUi = () => {
    fieldWrap.hidden = (field.relation || 'none') === 'none';
  };

  const notify = () => document.dispatchEvent(new CustomEvent('bl-forms-builder-changed'));

  modeSelect.addEventListener('change', () => {
    field.relation = modeSelect.value || 'none';
    if (field.relation === 'none') {
      field.relation_field = '';
      fieldSelect.value = '';
    }
    syncUi();
    notify();
  });

  fieldSelect.addEventListener('change', () => {
    field.relation_field = fieldSelect.value || '';
    notify();
  });

  wrap.append(
    el('p', {}, [el('label', { text: t('dateRelation', 'Relation') }), modeSelect]),
    fieldWrap
  );
  syncUi();
  return wrap;
}

export function createCssClassControl(field) {
  const input = el('input', {
    type: 'text',
    className: 'widefat',
    dataset: { blCssClass: '1' },
    value: field.css_class || '',
    placeholder: t('cssClassPlaceholder', 'e.g. my-field'),
  });
  input.addEventListener('input', () => {
    field.css_class = input.value;
  });
  const wrap = el('div', { className: 'bl-forms-builder__css-class' });
  wrap.appendChild(el('p', {}, [el('label', { text: t('cssClass', 'CSS class') }), input]));
  wrap.appendChild(
    el('p', {
      className: 'description',
      text: t('cssClassHelp', 'Optional class names added to this field’s wrapper.'),
    })
  );
  return wrap;
}

function widthBadgeLabel(field) {
  const width = field.width || '100';
  if (width === '100') {
    return '';
  }
  if (width === 'auto') {
    return t('widthAuto', 'Auto');
  }
  if (width === 'custom') {
    return (field.width_custom || '').trim();
  }
  return `${width}%`;
}

function settingHeading(text) {
  return el('div', { className: 'bl-forms-builder__setting-heading', text });
}

function createSwitchSetting(key, label, checked, onChange) {
  const input = el('input', {
    type: 'checkbox',
    dataset: { [key]: '1' },
    checked: !!checked,
  });
  input.addEventListener('change', () => onChange(input.checked));
  return el('div', { className: 'bl-forms-builder__switch-setting' }, [
    el('label', { className: 'bl-forms-builder__switch' }, [
      input,
      el('span', { className: 'bl-forms-builder__switch-ui', 'aria-hidden': 'true' }),
      el('span', { className: 'bl-forms-builder__switch-label', text: label }),
    ]),
  ]);
}

function isDefaultChecked(value) {
  return value === true || value === 1 || value === '1' || value === 'true' || value === 'yes';
}

function readDefaultValueFromRow(row) {
  const defEl = row.querySelector('[data-bl-default]');
  if (!defEl) {
    return undefined;
  }
  if (defEl.type === 'checkbox') {
    return defEl.checked ? '1' : '';
  }
  return defEl.value || '';
}

function defaultInputType(type) {
  switch (type) {
    case 'number':
      return 'number';
    case 'email':
      return 'email';
    case 'url':
      return 'text';
    case 'phone':
      return 'tel';
    case 'date':
      return 'date';
    case 'time':
      return 'time';
    case 'datetime':
      return 'datetime-local';
    default:
      return 'text';
  }
}

function isValidDefaultValue(type, value) {
  const v = String(value || '').trim();
  if (v === '') {
    return true;
  }
  if (type === 'number') {
    return v !== '' && !Number.isNaN(Number(v)) && /^-?\d+(\.\d+)?$/.test(v);
  }
  if (type === 'email') {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
  }
  if (type === 'url') {
    return /^https:\/\/\S+$/i.test(v);
  }
  if (type === 'phone') {
    if (!/^\+?[\d\s.\-()]{6,}$/.test(v)) {
      return false;
    }
    const digits = v.replace(/\D+/g, '');
    return digits.length >= 6 && digits.length <= 20;
  }
  if (type === 'date') {
    return /^\d{4}-\d{2}-\d{2}$/.test(v) && !Number.isNaN(Date.parse(v));
  }
  if (type === 'time') {
    return /^\d{2}:\d{2}(:\d{2})?$/.test(v);
  }
  if (type === 'datetime') {
    return /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(v);
  }
  return true;
}

/**
 * Strip any scheme and force https://. Loose check — any host-like value is fine.
 */
function normalizeHttpsUrl(raw) {
  let v = String(raw || '').replace(
    /^[\s\u00A0\u2000-\u200B\uFEFF]+|[\s\u00A0\u2000-\u200B\uFEFF]+$/g,
    ''
  );
  if (!v) return '';
  v = v.replace(/^[a-z][a-z0-9+.\-]*:/i, '').replace(/^\/\//, '');
  v = v.replace(/^[\s\u00A0\u2000-\u200B\uFEFF]+|[\s\u00A0\u2000-\u200B\uFEFF]+$/g, '');
  if (!v || v.startsWith('/') || v.startsWith('#') || v.startsWith('?')) {
    return '';
  }
  if (/\s/.test(v)) {
    return '';
  }
  const host = v.split(/[/?#]/)[0].split(':')[0];
  if (!host || !/[a-z0-9]/i.test(host)) {
    return '';
  }
  return 'https://' + v;
}

function normalizeDefaultValue(type, value) {
  const v = String(value || '').trim();
  if (v === '') {
    return '';
  }
  if (type === 'url') {
    const next = normalizeHttpsUrl(v);
    return next !== '' && isValidDefaultValue('url', next) ? next : '';
  }
  if (isValidDefaultValue(type, v)) {
    return v;
  }
  return '';
}

function createDefaultValueControl(field, updatePreview) {
  if (NO_DEFAULT.includes(field.type) || field.type === 'hidden') {
    return null;
  }

  if (CHECKED_DEFAULT_TYPES.includes(field.type)) {
    return [
      createSwitchSetting(
        'blDefault',
        t('defaultChecked', 'Checked by default'),
        isDefaultChecked(field.default_value),
        (checked) => {
          field.default_value = checked ? '1' : '';
          updatePreview();
          document.dispatchEvent(new CustomEvent('bl-forms-builder-changed'));
        }
      ),
    ];
  }

  if (['date', 'time', 'datetime'].includes(field.type)) {
    return [
      createTemporalModeControl(field, 'default', {
        label: t('defaultValue', 'Default value'),
        emptyLabel: t('defaultNone', 'None'),
        onChange: updatePreview,
      }),
    ];
  }

  field.default_value = normalizeDefaultValue(field.type, field.default_value || '');

  const def =
    field.type === 'textarea' || field.type === 'wysiwyg'
      ? el('textarea', {
          className: 'widefat',
          rows: '2',
          dataset: { blDefault: '1' },
        })
      : el('input', {
          type: defaultInputType(field.type),
          className: 'widefat',
          dataset: { blDefault: '1' },
          value: field.default_value || '',
        });
  if (field.type === 'textarea' || field.type === 'wysiwyg') {
    def.value = field.default_value || '';
  }
  if (field.type === 'number') {
    def.setAttribute('step', 'any');
    def.setAttribute('inputmode', 'decimal');
  }

  const commit = () => {
    const next = normalizeDefaultValue(field.type, def.value);
    if (next !== def.value) {
      def.value = next;
    }
    field.default_value = next;
    updatePreview();
    document.dispatchEvent(new CustomEvent('bl-forms-builder-changed'));
  };

  def.addEventListener('input', () => {
    if (
      ['text', 'textarea', 'wysiwyg', 'phone'].includes(field.type) ||
      OPTION_TYPES.includes(field.type)
    ) {
      field.default_value = def.value;
      updatePreview();
      return;
    }
    field.default_value = def.value;
    updatePreview();
  });
  def.addEventListener('change', commit);
  def.addEventListener('blur', commit);

  const nodes = [el('p', {}, [el('label', { text: t('defaultValue', 'Default value') }), def])];

  if (OPTION_TYPES.includes(field.type)) {
    nodes.push(
      el('p', {
        className: 'description',
        text: t(
          'defaultValueOptionsHelp',
          'Use option slugs from the list above. For multiple values, separate with commas (e.g. option-1, option-2).'
        ),
      })
    );
  }

  return nodes;
}

function appearancePayload(scope, width, widthCustom) {
  return {
    width,
    width_custom: width === 'custom' ? widthCustom : '',
    css_class: scope.querySelector('[data-bl-css-class]')?.value || '',
  };
}

/**
 * Attach conditional_logic from the live field object or Logic tab hidden input.
 *
 * @param {HTMLElement} body
 * @param {object} data
 * @returns {object}
 */
function withConditionalLogic(body, data) {
  const row = body?.closest?.('[data-bl-forms-field]') || body;
  const live = row && row._blFieldRef ? row._blFieldRef.conditional_logic : null;
  if (live && typeof live === 'object') {
    const normalized = normalizeConditionalLogic(live);
    if (normalized.enabled || normalized.groups.length) {
      data.conditional_logic = normalized;
      return data;
    }
  }
  const logic = readConditionalLogicFromDom(body);
  if (logic) {
    const normalized = normalizeConditionalLogic(logic);
    if (normalized.enabled || normalized.groups.length) {
      data.conditional_logic = normalized;
    }
  }
  return data;
}

function createFieldEditorTabs(activeId = 'general') {
  const tabBar = el('nav', {
    className: 'bl-forms-builder__field-tabs',
    role: 'tablist',
  });
  const panelsWrap = el('div', { className: 'bl-forms-builder__field-panels' });
  const tabDefs = [
    { id: 'general', label: t('fieldTabGeneral', 'General') },
    { id: 'advanced', label: t('fieldTabAdvanced', 'Advanced') },
    { id: 'appearance', label: t('fieldTabAppearance', 'Appearance') },
    { id: 'logic', label: t('fieldTabLogic', 'Logic') },
  ];
  const initialId = tabDefs.some((tab) => tab.id === activeId) ? activeId : 'general';

  const tabs = tabDefs.map((tab) => {
    const active = tab.id === initialId;
    const panel = el('div', {
      className: 'bl-forms-builder__field-panel' + (active ? ' is-active' : ''),
      dataset: { blFieldPanel: tab.id },
      role: 'tabpanel',
    });
    if (!active) {
      panel.hidden = true;
    }
    panelsWrap.appendChild(panel);

    const button = el('button', {
      type: 'button',
      className: 'bl-forms-builder__field-tab' + (active ? ' is-active' : ''),
      role: 'tab',
      text: tab.label,
      dataset: { blFieldTab: tab.id },
      onClick: () => activate(tab.id),
    });
    button.setAttribute('aria-selected', active ? 'true' : 'false');
    tabBar.appendChild(button);

    return { ...tab, button, panel };
  });

  const activate = (id) => {
    tabs.forEach((tab) => {
      if (tab.button.hidden) {
        tab.panel.hidden = true;
        tab.panel.classList.remove('is-active');
        tab.button.classList.remove('is-active');
        tab.button.setAttribute('aria-selected', 'false');
        return;
      }
      const active = tab.id === id;
      tab.button.classList.toggle('is-active', active);
      tab.button.setAttribute('aria-selected', active ? 'true' : 'false');
      tab.panel.hidden = !active;
      tab.panel.classList.toggle('is-active', active);
    });
    if (id === 'logic') {
      tabs[3].panel.querySelectorAll('.bl-forms-builder__logic').forEach((node) => {
        if (typeof node.refreshLogicSources === 'function') {
          node.refreshLogicSources();
        }
      });
    }
  };

  const wrap = el('div', { className: 'bl-forms-builder__field-editor' }, [tabBar, panelsWrap]);
  return {
    wrap,
    general: tabs[0].panel,
    advanced: tabs[1].panel,
    appearance: tabs[2].panel,
    logic: tabs[3].panel,
    /**
     * Hide tabs whose panels have no sections, and activate a visible tab if needed.
     */
    syncVisibility(preferredId = initialId) {
      tabs.forEach((tab) => {
        const empty = tab.panel.childElementCount === 0;
        tab.button.hidden = empty;
        if (empty) {
          tab.panel.hidden = true;
          tab.panel.classList.remove('is-active');
          tab.button.classList.remove('is-active');
          tab.button.setAttribute('aria-selected', 'false');
        }
      });

      const visible = tabs.filter((tab) => !tab.button.hidden);
      tabBar.hidden = visible.length <= 1;

      if (visible.length === 0) {
        return;
      }

      const preferred = visible.find((tab) => tab.id === preferredId) || visible[0];
      activate(preferred.id);
    },
  };
}

/**
 * Append logical sections to a field tab panel, separated by gray hrs.
 *
 * @param {HTMLElement} panel
 */
function createSectionAppender(panel) {
  let count = 0;
  return {
    get count() {
      return count;
    },
    add(...nodes) {
      const list = nodes.flat().filter(Boolean);
      if (!list.length) {
        return;
      }
      panel.appendChild(el('div', { className: 'bl-forms-builder__field-section' }, list));
      count += 1;
    },
  };
}

export function serializeRow(row) {
  const fieldCardHooks = getFieldCardHooks();
  if (typeof fieldCardHooks.serializeRow === 'function') {
    const custom = fieldCardHooks.serializeRow(row);
    if (custom != null) {
      return custom;
    }
  }

  const layoutData = serializeLayoutRow(row);
  if (layoutData) {
    return layoutData;
  }

  const type = row.dataset.fieldType || 'text';
  const id = row.dataset.fieldId || uid();
  const body = row.querySelector(':scope > .bl-forms-builder__field-body') || row;
  const q = (sel) => body.querySelector(sel);
  const widthBtn = q('[data-bl-width].is-active');
  const width = widthBtn?.dataset.blWidth || row.dataset.fieldWidth || '100';
  const widthCustom = q('[data-bl-width-custom]')?.value || '';
  const nameManual = row.dataset.nameManual === '1';
  const hideLabel = Boolean(q('[data-bl-hide-label]')?.checked);
  const activeInput = q('[data-bl-active]');
  const active = activeInput ? Boolean(activeInput.checked) : true;

  if (type === 'divider') {
    const marginBtn = q('[data-bl-margin].is-active');
    const margin = marginBtn?.dataset.blMargin || row.dataset.fieldMargin || 'm';
    const marginCustom = q('[data-bl-margin-custom]')?.value || '';
    return withConditionalLogic(body, {
      id,
      type,
      active,
      margin,
      margin_custom: margin === 'custom' ? marginCustom : '',
      css_class: q('[data-bl-css-class]')?.value || '',
    });
  }

  if (type === 'captcha') {
    return withConditionalLogic(body, {
      id,
      type,
      active,
      ...appearancePayload(body, width, widthCustom),
    });
  }

  if (type === 'spacer') {
    const heightBtn = q('[data-bl-height].is-active');
    const height = heightBtn?.dataset.blHeight || row.dataset.fieldHeight || 'm';
    const heightCustom = q('[data-bl-height-custom]')?.value || '';
    return withConditionalLogic(body, {
      id,
      type,
      active,
      height,
      height_custom: height === 'custom' ? heightCustom : '',
      css_class: q('[data-bl-css-class]')?.value || '',
    });
  }

  if (type === 'row_break') {
    return withConditionalLogic(body, {
      id,
      type,
      active,
      css_class: q('[data-bl-css-class]')?.value || '',
    });
  }

  if (type === 'heading') {
    const levels = getHeadingLevels();
    const fallback = headingLevelFallback(levels);
    const levelBtn = q('[data-bl-heading-level].is-active');
    const level = levelBtn?.dataset.blHeadingLevel || fallback;
    return withConditionalLogic(body, {
      id,
      type,
      active,
      content: q('[data-bl-content]')?.value || '',
      level: levels.includes(level) ? level : fallback,
      ...appearancePayload(body, width, widthCustom),
    });
  }

  if (type === 'text_block' || type === 'html') {
    return withConditionalLogic(body, {
      id,
      type,
      active,
      content: q('[data-bl-content]')?.value || '',
      ...appearancePayload(body, width, widthCustom),
    });
  }

  if (type === 'honeypot') {
    return withConditionalLogic(body, {
      id,
      type,
      active,
      label: q('[data-bl-label]')?.value || '',
      name: q('[data-bl-name]')?.value || id,
      name_manual: nameManual,
      hide_label: hideLabel,
      ...appearancePayload(body, width, widthCustom),
    });
  }

  if (type === 'hidden') {
    return withConditionalLogic(body, {
      id,
      type,
      active,
      label: q('[data-bl-label]')?.value || '',
      name: q('[data-bl-name]')?.value || id,
      name_manual: nameManual,
      hide_label: hideLabel,
      default_value: q('[data-bl-default]')?.value || '',
      ...appearancePayload(body, '100', ''),
    });
  }

  const data = {
    id,
    type,
    active,
    label: q('[data-bl-label]')?.value || '',
    name: q('[data-bl-name]')?.value || id,
    name_manual: nameManual,
    hide_label: hideLabel,
    required: Boolean(q('[data-bl-required]')?.checked),
    readonly: Boolean(q('[data-bl-readonly]')?.checked),
    disabled: Boolean(q('[data-bl-disabled]')?.checked),
    placeholder: q('[data-bl-placeholder]')?.value || '',
    ...appearancePayload(body, width, widthCustom),
  };

  if (DESCRIPTION_TYPES.includes(type)) {
    data.description = q('[data-bl-description]')?.value || '';
  }
  if (type === 'terms' || type === 'toggle') {
    data.content = q('[data-bl-content]')?.value || '';
  }
  if (type === 'toggle' || type === 'terms' || type === 'checkboxes') {
    const showEl = q('[data-bl-show-as-checkbox]');
    data.show_as_checkbox = showEl
      ? showEl.checked
      : type === 'toggle'
        ? false
        : true;
  }
  if (OPTION_TYPES.includes(type)) {
    data.options = Array.from(body.querySelectorAll('[data-bl-option]')).map((opt) => ({
      label: opt.querySelector('[data-bl-opt-label]')?.value || '',
      value: opt.querySelector('[data-bl-opt-value]')?.value || '',
    }));
  }
  if (type === 'radio' || type === 'checkboxes' || type === 'button_group') {
    const layoutBtn = q('[data-bl-layout].is-active');
    const raw = layoutBtn?.dataset.blLayout || '';
    if (type === 'button_group') {
      data.layout = raw === 'vertical' ? 'vertical' : 'horizontal';
    } else {
      data.layout = raw === 'horizontal' ? 'horizontal' : 'vertical';
    }
  }
  if (type === 'checkboxes') {
    const parseLimit = (raw) => {
      const next = parseInt(raw, 10);
      return Number.isFinite(next) && next >= 1 ? Math.min(50, next) : '';
    };
    let min = parseLimit(q('[data-bl-min-selections]')?.value?.trim());
    let max = parseLimit(q('[data-bl-max-selections]')?.value?.trim());
    if (min !== '' && max !== '' && min > max) {
      [min, max] = [max, min];
    }
    data.min_selections = min;
    data.max_selections = max;
  }
  if (MULTIPLE_TYPES.includes(type)) {
    data.multiple = Boolean(q('[data-bl-multiple]')?.checked);
  }
  if (type === 'select') {
    if (data.multiple) {
      delete data.allow_null;
    } else {
      const allowEl = q('[data-bl-allow-null]');
      data.allow_null = allowEl ? allowEl.checked : true;
    }
  }
  if (type === 'link') {
    const allowed = ['page', 'url', 'email', 'phone', 'file'];
    const checked = Array.from(body.querySelectorAll('[data-bl-link-type]:checked')).map(
      (input) => input.value
    );
    data.link_types = checked.filter((t) => allowed.includes(t));
    if (data.link_types.length === 0) {
      data.link_types = [...allowed];
    }
    data.allow_target = Boolean(q('[data-bl-allow-target]')?.checked);
  }
  if (type === 'page') {
    const catalog = pickerPostTypeCatalog();
    const allowedKeys = catalog.map((row) => row.value);
    const checked = Array.from(body.querySelectorAll('[data-bl-page-post-type]:checked')).map(
      (input) => input.value
    );
    data.post_types = checked.filter((slug) => allowedKeys.includes(slug));
    if (data.post_types.length === 0) {
      data.post_types = [...allowedKeys];
    }
  }
  if (type === 'file' || type === 'image') {
    if (useMediaLibraryFields()) {
      if (data.multiple) {
        const rawMax = q('[data-bl-max-files]')?.value?.trim();
        const parsed = parseInt(rawMax, 10);
        data.max_files = Number.isFinite(parsed) && parsed >= 1 ? Math.min(50, parsed) : 10;
      } else {
        delete data.max_files;
      }
      delete data.extensions;
      delete data.upload_style;
      delete data.preview;
      delete data.button_text;
      delete data.max_size_mb;
    } else {
      data.extensions = q('[data-bl-extensions]')?.value?.trim() || '';
      data.upload_style = q('[data-bl-upload-style]')?.value === 'classic' ? 'classic' : 'modern';
      data.preview =
        data.upload_style === 'modern' ? Boolean(q('[data-bl-preview]')?.checked) : false;
      data.button_text = q('[data-bl-upload-button]')?.value?.trim() || '';
      data.max_size_mb = q('[data-bl-max-size-mb]')?.value?.trim() || '';
      if (data.multiple) {
        const rawMax = q('[data-bl-max-files]')?.value?.trim();
        const parsed = parseInt(rawMax, 10);
        data.max_files = Number.isFinite(parsed) && parsed >= 1 ? Math.min(50, parsed) : 10;
      }
    }
  }
  if (AUTOCOMPLETE_TYPES.includes(type)) {
    const ac = q('[data-bl-autocomplete]');
    data.autocomplete = ac?.value === 'off' ? 'off' : 'auto';
  }
  if (AFFIX_TYPES.includes(type)) {
    data.prefix = q('[data-bl-prefix]')?.value ?? '';
    data.suffix = q('[data-bl-suffix]')?.value ?? '';
  }
  if (type === 'number') {
    data.min = q('[data-bl-min]')?.value?.trim() || '';
    data.max = q('[data-bl-max]')?.value?.trim() || '';
  }
  if (type === 'text' || type === 'textarea') {
    data.min_length = q('[data-bl-min-length]')?.value?.trim() || '';
    data.max_length = q('[data-bl-max-length]')?.value?.trim() || '';
    data.show_char_count = Boolean(q('[data-bl-show-char-count]')?.checked);
  }
  if (type === 'textarea') {
    const rawRows = parseInt(q('[data-bl-rows]')?.value, 10);
    data.rows = Number.isFinite(rawRows) && rawRows >= 2 ? Math.min(50, rawRows) : 4;
  }
  if (type === 'date' || type === 'time' || type === 'datetime') {
    data.placeholder = '';
    const readSide = (which) => {
      const modeSel =
        which === 'min'
          ? '[data-bl-min-mode]'
          : which === 'max'
            ? '[data-bl-max-mode]'
            : '[data-bl-default-mode]';
      const valueSel =
        which === 'min' ? '[data-bl-min]' : which === 'max' ? '[data-bl-max]' : '[data-bl-default]';
      const offsetSel =
        which === 'min'
          ? '[data-bl-min-offset]'
          : which === 'max'
            ? '[data-bl-max-offset]'
            : '[data-bl-default-offset]';
      const valueKey = which === 'default' ? 'default_value' : which;
      const mode = q(modeSel)?.value || '';
      if (!mode) {
        if (which === 'default') {
          data.default_value = '';
        }
        return;
      }
      data[`${which}_mode`] = mode;
      if (mode === 'fixed') {
        data[valueKey] = q(valueSel)?.value?.trim() || '';
      }
      if (mode === 'offset') {
        const raw = q(offsetSel)?.value;
        const n = parseInt(raw, 10);
        data[`${which}_offset`] = Number.isFinite(n) ? n : 0;
      }
    };
    readSide('min');
    readSide('max');
    readSide('default');
    const relation = q('[data-bl-relation]')?.value || 'none';
    if (relation === 'before' || relation === 'after') {
      data.relation = relation;
      data.relation_field = q('[data-bl-relation-field]')?.value || '';
      if (!data.relation_field) {
        data.relation = 'none';
        data.relation_field = '';
      }
    } else {
      data.relation = 'none';
      data.relation_field = '';
    }
  }
  if (NO_READONLY.includes(type)) {
    delete data.readonly;
  }
  if (NO_DISABLED.includes(type)) {
    delete data.disabled;
  }
  if (NO_REQUIRED.includes(type)) {
    delete data.required;
  }
  if (
    !NO_DEFAULT.includes(type) &&
    type !== 'date' &&
    type !== 'time' &&
    type !== 'datetime'
  ) {
    const defEl = q('[data-bl-default]');
    if (defEl) {
      data.default_value = defEl.type === 'checkbox' ? (defEl.checked ? '1' : '') : defEl.value || '';
    }
  }

  const hooks = getFieldCardHooks();
  if (typeof hooks.onSerialize === 'function') {
    hooks.onSerialize(data, { type, q, body, row });
  }

  return withConditionalLogic(body, data);
}

/**
 * Duplicate a canvas field card (deep clone) and insert it after the source.
 *
 * @param {HTMLElement} row
 */
export function duplicateFieldCard(row) {
  if (!row) {
    return;
  }
  const data = serializeRow(row);
  if (!data) {
    return;
  }
  const clone = cloneFieldData(data);
  const copy = createFieldCard(clone, false);
  row.after(copy);
  if ((copy.dataset.fieldType || '') === 'column') {
    const list = row.parentElement;
    if (list) {
      equalizeColumnRun(list, copy);
    }
  }
  document.dispatchEvent(new CustomEvent('bl-forms-builder-changed'));
}

export function createFieldCard(initial, open = false) {
  const hooks = getFieldCardHooks();
  if (typeof hooks.createFieldCard === 'function') {
    const custom = hooks.createFieldCard(initial, open);
    if (custom) {
      return custom;
    }
  }

  if ((initial?.type || '') === 'column') {
    return createColumnCard(initial, open);
  }
  if ((initial?.type || '') === 'section') {
    return createSectionCard(initial, open);
  }
  if ((initial?.type || '') === 'tab') {
    return createTabCard(initial, open);
  }

  let field = {
    width: '100',
    width_custom: '',
    hide_label: false,
    active: true,
    ...initial,
    id: initial.id || uid(),
    name_manual: initial.name_manual != null ? !!initial.name_manual : true,
  };
  if (field.active === undefined) {
    field.active = true;
  }
  if (field.type === 'spacer') {
    normalizeSpacerHeight(field);
  }
  if (field.type === 'divider') {
    normalizeDividerMargin(field);
  }
  if (field.type === 'heading') {
    normalizeHeadingLevel(field);
  }
  if (NAMED_TYPES.includes(field.type) && !field.name) {
    field.name = uniqueFieldName(field.label || field.type, field.id);
  }
  const initHooks = getFieldCardHooks();
  if (typeof initHooks.onInitField === 'function') {
    initHooks.onInitField(field);
  }

  const row = el('div', {
    className: 'bl-forms-builder__field' + (open ? ' is-open' : ''),
    dataset: {
      blFormsField: '1',
      fieldId: field.id,
      fieldType: field.type,
      fieldWidth: field.width || '100',
      fieldHeight: field.type === 'spacer' ? field.height || 'm' : '',
      fieldMargin: field.type === 'divider' ? field.margin || 'm' : '',
      fieldName: field.name || '',
      nameManual: field.name_manual ? '1' : '0',
    },
  });
  row._blFieldRef = field;

  const preview = el('span', { className: 'bl-forms-builder__preview' });
  const widthBadge = el('span', { className: 'bl-forms-builder__width-badge' });
  const activateBtn = el('button', {
    type: 'button',
    className: 'bl-forms-builder__icon-btn bl-forms-builder__activate-btn',
    title: t('fieldActivateTitle', 'Show on the frontend'),
    'aria-label': t('fieldActivateTitle', 'Show on the frontend'),
    hidden: fieldIsActive(field),
    onClick: (evt) => {
      evt.preventDefault();
      evt.stopPropagation();
      field.active = true;
      const activeInput = body.querySelector('[data-bl-active]');
      if (activeInput) {
        activeInput.checked = true;
      }
      updatePreview();
      document.dispatchEvent(new CustomEvent('bl-forms-builder-changed'));
    },
  });
  activateBtn.appendChild(iconEl('inactive', 'bl-forms-builder__activate-btn-icon'));
  const typeChip = el('span', { className: 'bl-forms-builder__field-type' });
  const body = el('div', { className: 'bl-forms-builder__field-body' });

  const updatePreview = () => {
    let title = (field.label || field.placeholder || '').trim();
    if (field.type === 'captcha') {
      title = typeLabel('captcha');
    } else if (field.type === 'spacer') {
      const height = field.height || 'm';
      title =
        height === 'custom'
          ? (field.height_custom || t('widthCustom', 'Custom')).trim()
          : height.toUpperCase();
    } else if (field.type === 'divider') {
      const margin = field.margin || 'm';
      if (margin === 'custom') {
        title = (field.margin_custom || t('widthCustom', 'Custom')).trim();
      } else {
        const preset = DIVIDER_MARGIN_PRESETS.find((item) => item.value === margin);
        title = preset?.label || margin.toUpperCase();
      }
    } else if (field.type === 'row_break') {
      title = typeLabel('row_break');
    } else if (field.type === 'heading' || field.type === 'text_block' || field.type === 'html') {
      title = (field.content || '').trim();
    }
    preview.textContent = title;
    preview.hidden = title === '';

    const widthText =
      field.type === 'hidden' ||
      field.type === 'divider' ||
      field.type === 'spacer' ||
      field.type === 'row_break'
        ? ''
        : widthBadgeLabel(field);
    widthBadge.textContent = widthText;
    widthBadge.hidden = widthText === '';
    widthBadge.classList.toggle('is-interactive', widthText !== '');
    if (widthText !== '') {
      widthBadge.title = t('width', 'Width');
    } else {
      widthBadge.removeAttribute('title');
    }

    const active = fieldIsActive(field);
    row.classList.toggle('is-inactive', !active);
    activateBtn.hidden = active;

    const typeChildren = [
      iconEl(field.type, 'bl-forms-builder__field-type-icon'),
      el('span', { className: 'bl-forms-builder__field-type-label', text: typeLabel(field.type) }),
    ];
    if (field.required && !NO_REQUIRED.includes(field.type)) {
      typeChildren.push(
        el('span', {
          className: 'bl-forms-builder__field-required-dot',
          title: t('required', 'Required'),
          'aria-label': t('required', 'Required'),
        })
      );
    }
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
    row.dataset.fieldType = field.type;
    row.dataset.fieldWidth = field.width || '100';
    row.dataset.fieldHeight = field.type === 'spacer' ? field.height || 'm' : '';
    row.dataset.fieldMargin = field.type === 'divider' ? field.margin || 'm' : '';
    row.dataset.fieldName = field.name || '';
    row.dataset.nameManual = field.name_manual ? '1' : '0';
  };

  const setOpen = (nextOpen) => {
    if (nextOpen) {
      document.querySelectorAll('.bl-forms-builder__field.is-open').forEach((other) => {
        if (other === row) {
          return;
        }
        other.classList.remove('is-open');
        const otherHeader = other.querySelector(':scope > .bl-forms-builder__field-header');
        if (otherHeader) {
          otherHeader.setAttribute('aria-expanded', 'false');
          otherHeader.setAttribute('aria-label', t('expandField', 'Expand field'));
        }
      });
    }

    row.classList.toggle('is-open', nextOpen);
    const currentHeader = row.querySelector(':scope > .bl-forms-builder__field-header');
    if (currentHeader) {
      currentHeader.setAttribute('aria-expanded', nextOpen ? 'true' : 'false');
      currentHeader.setAttribute(
        'aria-label',
        nextOpen ? t('collapseField', 'Collapse field') : t('expandField', 'Expand field')
      );
    }
    if (nextOpen) {
      body.querySelectorAll('.bl-forms-builder__logic').forEach((node) => {
        if (typeof node.refreshLogicSources === 'function') {
          node.refreshLogicSources();
        }
      });
    }
  };

  const deleteBtn = el('button', {
    type: 'button',
    className: 'bl-forms-builder__icon-btn bl-forms-builder__icon-btn--danger',
    title: t('delete', 'Delete'),
    'aria-label': t('delete', 'Delete'),
    onClick: (evt) => {
      evt.preventDefault();
      evt.stopPropagation();
      row.remove();
      document.dispatchEvent(new CustomEvent('bl-forms-builder-changed'));
    },
  });
  const trashIcon = iconEl('trash');
  if (trashIcon.innerHTML) {
    deleteBtn.appendChild(trashIcon);
  } else {
    deleteBtn.textContent = '×';
  }

  const duplicateBtn = el('button', {
    type: 'button',
    className: 'bl-forms-builder__icon-btn',
    title: t('duplicate', 'Duplicate'),
    'aria-label': t('duplicate', 'Duplicate'),
    onClick: (evt) => {
      evt.preventDefault();
      evt.stopPropagation();
      duplicateFieldCard(row);
    },
  });
  const duplicateIcon = iconEl('duplicate');
  if (duplicateIcon.innerHTML) {
    duplicateBtn.appendChild(duplicateIcon);
  } else {
    duplicateBtn.textContent = '⧉';
  }

  const syncNameFromLabel = (nameInput) => {
    if (field.name_manual || !nameInput) {
      return;
    }
    const next = uniqueFieldName(field.label || field.type, field.id);
    field.name = next;
    nameInput.value = next;
    row.dataset.fieldName = next;
  };

  const renderBody = (activeTab = 'general') => {
    body.replaceChildren();
    const tabs = createFieldEditorTabs(activeTab);
    const { general, advanced, appearance, logic } = tabs;
    const generalSections = createSectionAppender(general);
    const advancedSections = createSectionAppender(advanced);
    const appearanceSections = createSectionAppender(appearance);
    const logicSections = createSectionAppender(logic);

    generalSections.add(
      (() => {
        const switches = [
          createSwitchSetting('blActive', t('fieldActive', 'Active'), fieldIsActive(field), (checked) => {
            field.active = checked;
            updatePreview();
            document.dispatchEvent(new CustomEvent('bl-forms-builder-changed'));
          }),
        ];
        const switchHooks = getFieldCardHooks();
        if (typeof switchHooks.extraSwitches === 'function') {
          const extra = switchHooks.extraSwitches(field) || [];
          extra.filter(Boolean).forEach((node) => switches.push(node));
        }
        return el('div', { className: 'bl-forms-builder__field-status' }, switches);
      })()
    );

    const onTypeConvert = () => {
      updatePreview();
      const stayOn =
        ['heading', 'text_block', 'html'].includes(field.type) ? 'general' : 'advanced';
      renderBody(stayOn);
      document.dispatchEvent(new CustomEvent('bl-forms-builder-changed'));
    };

    const typeSelect = createTypeSelect(field, row, onTypeConvert);
    const contentTypes = ['heading', 'text_block', 'html'];
    if (typeSelect && contentTypes.includes(field.type)) {
      generalSections.add(typeSelect);
    } else if (typeSelect) {
      advancedSections.add(typeSelect);
    }

    if (field.type === 'heading') {
      appearanceSections.add(createHeadingLevelControl(field, updatePreview));
    }
    if (field.type === 'spacer') {
      appearanceSections.add(createHeightControl(field, updatePreview));
    }
    if (field.type === 'divider') {
      appearanceSections.add(createMarginControl(field, updatePreview));
    }
    if (field.type === 'toggle' || field.type === 'terms' || field.type === 'checkboxes') {
      appearanceSections.add(createShowAsCheckboxControl(field));
    }
    if (field.type === 'radio' || field.type === 'checkboxes' || field.type === 'button_group') {
      appearanceSections.add(createLayoutControl(field));
    }
    if (field.type !== 'hidden' && field.type !== 'divider' && field.type !== 'spacer' && field.type !== 'row_break') {
      appearanceSections.add(createWidthControl(field, updatePreview));
    }
    const appearanceHooks = getFieldCardHooks();
    if (typeof appearanceHooks.extraAppearanceSections === 'function') {
      const extraAppearance =
        appearanceHooks.extraAppearanceSections(field, { updatePreview }) || [];
      extraAppearance.forEach((node) => {
        if (node) appearanceSections.add(node);
      });
    }
    if ((field.type === 'file' || field.type === 'image') && !useMediaLibraryFields()) {
      appearanceSections.add(createUploadAppearanceControls(field));
    }
    appearanceSections.add(createCssClassControl(field));

    logicSections.add(createConditionalLogicEditor(field, undefined, updatePreview));

    if (field.type === 'divider' || field.type === 'spacer' || field.type === 'row_break') {
      // Appearance only.
    } else if (field.type === 'captcha') {
      generalSections.add(
        createCaptchaSettings(field, () => {
          updatePreview();
        })
      );
    } else if (['heading', 'text_block', 'html'].includes(field.type)) {
      const ta = el('textarea', {
        className: 'widefat',
        rows: field.type === 'html' ? '6' : '3',
        dataset: { blContent: '1' },
      });
      ta.value = field.content || '';
      ta.addEventListener('input', () => {
        field.content = ta.value;
        updatePreview();
      });
      const contentLabel =
        field.type === 'html' ? t('htmlContent', 'HTML') : t('content', 'Content');
      generalSections.add(el('p', {}, [el('label', { text: contentLabel }), ta]));
    } else {
      const labelInput = el('input', {
        type: 'text',
        className: 'widefat',
        dataset: { blLabel: '1' },
      });
      labelInput.value = field.label || '';

      let nameInput = null;
      if (NAMED_TYPES.includes(field.type)) {
        nameInput = el('input', {
          type: 'text',
          className: 'widefat',
          dataset: { blName: '1' },
          value: field.name || uniqueFieldName(field.label || field.type, field.id),
        });
        nameInput.addEventListener('input', () => {
          field.name_manual = true;
          field.name = nameInput.value;
          row.dataset.nameManual = '1';
          row.dataset.fieldName = field.name;
        });
        nameInput.addEventListener('blur', () => {
          const next = uniqueFieldName(nameInput.value || field.label || field.type, field.id);
          field.name = next;
          nameInput.value = next;
          row.dataset.fieldName = next;
          document.dispatchEvent(new CustomEvent('bl-forms-builder-changed'));
        });
      }

      labelInput.addEventListener('input', () => {
        field.label = labelInput.value;
        syncNameFromLabel(nameInput);
        updatePreview();
      });

      const labelControls = el('div', { className: 'bl-forms-builder__label-controls' }, [labelInput]);
      if (HIDE_LABEL_TYPES.includes(field.type)) {
        labelControls.appendChild(
          el('div', { className: 'bl-forms-builder__hide-label' }, [
            createSwitchSetting('blHideLabel', t('hideLabel', 'Hide'), !!field.hide_label, (checked) => {
              field.hide_label = checked;
              document.dispatchEvent(new CustomEvent('bl-forms-builder-changed'));
            }),
          ])
        );
      }
      generalSections.add(
        el('div', { className: 'bl-forms-builder__label-row' }, [
          el('label', { text: t('label', 'Label') }),
          labelControls,
        ])
      );

      if (nameInput) {
        generalSections.add(
          el('p', {}, [el('label', { text: t('name', 'Field name') }), nameInput]),
          el('p', {
            className: 'description',
            text: t(
              'nameHelp',
              'Internal field key used in submissions, emails, and entry data.'
            ),
          })
        );
      }

      if (DESCRIPTION_TYPES.includes(field.type)) {
        const desc = el('textarea', {
          className: 'widefat',
          rows: '2',
          dataset: { blDescription: '1' },
        });
        desc.value = field.description || '';
        desc.addEventListener('input', () => {
          field.description = desc.value;
        });
        advancedSections.add(
          el('p', {}, [el('label', { text: t('description', 'Description') }), desc])
        );
      }

      if (AFFIX_TYPES.includes(field.type)) {
        advancedSections.add(createPrefixSuffixControl(field));
      }

      if (field.type === 'textarea') {
        advancedSections.add(createTextareaRowsControl(field));
      }

      if (field.type === 'text' || field.type === 'textarea') {
        advancedSections.add(createLengthLimitsControl(field));
      }

      if (field.type === 'file' || field.type === 'image') {
        if (useMediaLibraryFields()) {
          if (field.multiple) {
            advancedSections.add(createMaxFilesControl(field));
          }
        } else {
          advancedSections.add(createExtensionsControl(field));
          advancedSections.add(createMaxSizeControl(field));
          advancedSections.add(createUploadButtonControl(field));
          if (field.multiple) {
            advancedSections.add(createMaxFilesControl(field));
          }
        }
      }

      if (field.type === 'number') {
        advancedSections.add(createNumberBoundsControl(field));
      }

      if (field.type === 'checkboxes') {
        advancedSections.add(createSelectionBoundsControl(field));
      }

      if (['date', 'time', 'datetime'].includes(field.type)) {
        advancedSections.add(createTemporalBoundsControl(field));
        const relationControl = createTemporalRelationControl(field);
        if (relationControl) {
          advancedSections.add(relationControl);
        }
      }

      if (AUTOCOMPLETE_TYPES.includes(field.type)) {
        advancedSections.add(createAutocompleteControl(field));
      }

      const fieldCardHooks = getFieldCardHooks();
      if (typeof fieldCardHooks.extraAdvancedSections === 'function') {
        const extra = fieldCardHooks.extraAdvancedSections(field, { updatePreview }) || [];
        extra.forEach((node) => {
          if (node) advancedSections.add(node);
        });
      }

      if (field.type === 'terms') {
        const consentText = el('textarea', {
          className: 'widefat',
          rows: '3',
          dataset: { blContent: '1' },
        });
        consentText.value = field.content || '';
        consentText.addEventListener('input', () => {
          field.content = consentText.value;
          updatePreview();
        });
        generalSections.add(
          el('p', {}, [el('label', { text: t('checkboxText', 'Checkbox text') }), consentText]),
          el('p', {
            className: 'description',
            html: t(
              'checkboxTextHelp',
              'Markdown is supported, e.g. <b>**Bold**</b>, <i>*Italic*</i>, and <span style="white-space: nowrap">[Link](...)</span>. For the target you can use a URL (/agb), a WordPress page (page:123), or a standard page such as page:privacy.'
            ),
          })
        );
      }

      if (field.type === 'toggle') {
        const toggleText = el('input', {
          type: 'text',
          className: 'widefat',
          dataset: { blContent: '1' },
          value: field.content || '',
        });
        toggleText.addEventListener('input', () => {
          field.content = toggleText.value;
          updatePreview();
        });
        generalSections.add(
          el('p', {}, [el('label', { text: t('toggleText', 'Toggle text') }), toggleText])
        );
      }

      if (field.type === 'hidden') {
        const def = el('input', {
          type: 'text',
          className: 'widefat',
          dataset: { blDefault: '1' },
          value: field.default_value || '',
        });
        def.addEventListener('input', () => {
          field.default_value = def.value;
          document.dispatchEvent(new CustomEvent('bl-forms-builder-changed'));
        });
        generalSections.add(
          el('p', {}, [el('label', { text: t('defaultValue', 'Default value') }), def])
        );
      }

      if (field.type === 'honeypot') {
        generalSections.add(
          el('p', {
            className: 'description',
            text: t(
              'honeypotHelp',
              'Hidden from visitors. If filled, the submission is treated as spam.'
            ),
          })
        );
      }

      if (!NO_PLACEHOLDER.includes(field.type)) {
        if (field.type === 'select' && field.multiple) {
          // Multi-select has no empty option; skip placeholder.
        } else if (field.type === 'select') {
          if (field.allow_null === undefined) {
            field.allow_null = true;
          }
          const allowNull = field.allow_null !== false && field.allow_null !== 0 && field.allow_null !== '0';
          generalSections.add(
            createSwitchSetting(
              'blAllowNull',
              t('selectAllowNull', 'Allow empty selection'),
              allowNull,
              (checked) => {
                field.allow_null = checked;
                renderBody('general');
                document.dispatchEvent(new CustomEvent('bl-forms-builder-changed'));
              }
            )
          );
          if (allowNull) {
            const ph = el('input', {
              type: 'text',
              className: 'widefat',
              dataset: { blPlaceholder: '1' },
              placeholder: t('selectEmptyOptionPlaceholder', 'Please select…'),
            });
            ph.value = field.placeholder || '';
            ph.addEventListener('input', () => {
              field.placeholder = ph.value;
              updatePreview();
            });
            generalSections.add(
              el('p', {}, [
                el('label', { text: t('selectEmptyOptionLabel', 'Empty option label') }),
                ph,
              ]),
              el('p', {
                className: 'description',
                text: t(
                  'selectEmptyOptionHelp',
                  'Label for the blank choice. Leave empty for “Please select…”. Required still shows this option, but the user must pick a real value.'
                ),
              })
            );
          } else {
            // Preserve placeholder while empty selection is off.
            generalSections.add(
              el('input', {
                type: 'hidden',
                dataset: { blPlaceholder: '1' },
                value: field.placeholder || '',
              })
            );
          }
        } else {
          const ph = el('input', {
            type: 'text',
            className: 'widefat',
            dataset: { blPlaceholder: '1' },
          });
          ph.value = field.placeholder || '';
          ph.addEventListener('input', () => {
            field.placeholder = ph.value;
            updatePreview();
          });
          generalSections.add(
            el('p', {}, [el('label', { text: t('placeholder', 'Placeholder') }), ph])
          );
        }
      }

      if (OPTION_TYPES.includes(field.type)) {
        generalSections.add(
          settingHeading(t('choices', 'Choices')),
          createOptionsEditor(field.options || [])
        );
      }

      if (field.type === 'link') {
        const allowedKeys = ['page', 'url', 'email', 'phone', 'file'];
        const labels = {
          page: t('linkTypePage', 'Page'),
          url: t('linkTypeUrl', 'URL'),
          email: t('linkTypeEmail', 'Email'),
          phone: t('linkTypePhone', 'Phone'),
          file: t('linkTypeFile', 'File'),
        };
        let selected = Array.isArray(field.link_types)
          ? field.link_types.filter((k) => allowedKeys.includes(k))
          : [...allowedKeys];
        if (selected.length === 0) {
          selected = [...allowedKeys];
        }
        field.link_types = selected;
        if (field.allow_target === undefined) {
          field.allow_target = true;
        }

        const typeChecks = allowedKeys.map((key) => {
          const input = el('input', {
            type: 'checkbox',
            value: key,
            dataset: { blLinkType: '1' },
            checked: selected.includes(key),
          });
          input.addEventListener('change', () => {
            let next = Array.from(
              body.querySelectorAll('[data-bl-link-type]:checked')
            ).map((elInput) => elInput.value);
            if (next.length === 0) {
              input.checked = true;
              next = [key];
            }
            field.link_types = next;
            document.dispatchEvent(new CustomEvent('bl-forms-builder-changed'));
          });
          return el('label', {}, [
            input,
            document.createTextNode(' ' + labels[key]),
          ]);
        });

        generalSections.add(
          settingHeading(t('linkAllowedTypes', 'Allowed types')),
          el('div', { className: 'bl-forms-builder__options-toggles' }, typeChecks),
          createSwitchSetting(
            'blAllowTarget',
            t('linkAllowTarget', 'Allow editor to set target'),
            field.allow_target !== false,
            (checked) => {
              field.allow_target = checked;
              document.dispatchEvent(new CustomEvent('bl-forms-builder-changed'));
            }
          )
        );
      }

      if (field.type === 'page') {
        const catalog = pickerPostTypeCatalog();
        const allowedKeys = catalog.map((row) => row.value);
        const labelByValue = Object.fromEntries(
          catalog.map((row) => [row.value, row.label || row.value])
        );
        let selected = Array.isArray(field.post_types)
          ? field.post_types.filter((k) => allowedKeys.includes(k))
          : [...allowedKeys];
        if (selected.length === 0) {
          selected = [...allowedKeys];
        }
        field.post_types = selected;

        const typeChecks = allowedKeys.map((key) => {
          const input = el('input', {
            type: 'checkbox',
            value: key,
            dataset: { blPagePostType: '1' },
            checked: selected.includes(key),
          });
          input.addEventListener('change', () => {
            let next = Array.from(
              body.querySelectorAll('[data-bl-page-post-type]:checked')
            ).map((elInput) => elInput.value);
            if (next.length === 0) {
              input.checked = true;
              next = [key];
            }
            field.post_types = next;
            document.dispatchEvent(new CustomEvent('bl-forms-builder-changed'));
          });
          return el('label', {}, [
            input,
            document.createTextNode(' ' + (labelByValue[key] || key)),
          ]);
        });

        if (allowedKeys.length > 0) {
          generalSections.add(
            settingHeading(t('pageAllowedPostTypes', 'Allowed post types')),
            el('div', { className: 'bl-forms-builder__options-toggles' }, typeChecks)
          );
        }
      }

      if (field.type !== 'hidden') {
        const defaults = createDefaultValueControl(field, updatePreview);
        if (defaults) {
          if (CHECKED_DEFAULT_TYPES.includes(field.type)) {
            generalSections.add(
              settingHeading(t('defaultValue', 'Default value')),
              el('div', { className: 'bl-forms-builder__options-toggles' }, defaults)
            );
          } else {
            generalSections.add(...defaults);
          }
        }
      }

      const optionToggles = [];
      if (!NO_REQUIRED.includes(field.type)) {
        optionToggles.push(
          createSwitchSetting('blRequired', t('required', 'Required'), !!field.required, (checked) => {
            field.required = checked;
            updatePreview();
            document.dispatchEvent(new CustomEvent('bl-forms-builder-changed'));
          })
        );
      }
      if (MULTIPLE_TYPES.includes(field.type)) {
        let multipleLabel = t('allowMultiple', 'Allow multiple');
        if (field.type === 'button_group') {
          multipleLabel = t('buttonGroupMultiple', 'Allow multiple selection');
        } else if (field.type === 'select') {
          multipleLabel = t('selectMultiple', 'Allow multiple selection');
        } else if (field.type === 'file' || field.type === 'image') {
          multipleLabel = useMediaLibraryFields()
            ? t('allowMultipleMedia', 'Allow multiple')
            : t('allowMultipleFiles', 'Allow multiple files');
        } else if (field.type === 'page') {
          multipleLabel = t('pageMultiple', 'Allow multiple pages');
        }
        optionToggles.push(
          createSwitchSetting('blMultiple', multipleLabel, !!field.multiple, (checked) => {
            field.multiple = checked;
            if (field.type === 'file' || field.type === 'image') {
              if (checked && (field.max_files == null || field.max_files === '')) {
                field.max_files = 10;
              }
              renderBody('general');
            } else if (field.type === 'select') {
              renderBody('general');
            }
            document.dispatchEvent(new CustomEvent('bl-forms-builder-changed'));
          })
        );
      }
      if (!NO_READONLY.includes(field.type)) {
        optionToggles.push(
          createSwitchSetting('blReadonly', t('readOnly', 'Read only'), !!field.readonly, (checked) => {
            field.readonly = checked;
            document.dispatchEvent(new CustomEvent('bl-forms-builder-changed'));
          })
        );
      }
      if (!NO_DISABLED.includes(field.type)) {
        optionToggles.push(
          createSwitchSetting('blDisabled', t('disabled', 'Disabled'), !!field.disabled, (checked) => {
            field.disabled = checked;
            document.dispatchEvent(new CustomEvent('bl-forms-builder-changed'));
          })
        );
      }
      if (optionToggles.length) {
        generalSections.add(
          settingHeading(t('options', 'Options')),
          el('div', { className: 'bl-forms-builder__options-toggles' }, optionToggles)
        );
      }
    }

    tabs.syncVisibility(activeTab);
    body.appendChild(tabs.wrap);
  };

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
  handle.addEventListener('click', (evt) => {
    evt.stopPropagation();
  });

  const headerMeta = el('div', { className: 'bl-forms-builder__field-meta' }, [
    widthBadge,
    typeChip,
  ]);

  widthBadge.addEventListener('click', (evt) => {
    if (
      widthBadge.hidden ||
      field.type === 'hidden' ||
      field.type === 'divider' ||
      field.type === 'spacer' ||
      field.type === 'row_break'
    ) {
      return;
    }
    evt.preventDefault();
    evt.stopPropagation();
    openFieldWidthModal(field, () => {
      updatePreview();
      syncWidthControlUi(body, field);
      document.dispatchEvent(new CustomEvent('bl-forms-builder-changed'));
    });
  });

  const header = el('div', {
    className: 'bl-forms-builder__field-header bl-forms-builder__field-header--expandable',
    role: 'button',
    tabindex: '0',
    'aria-expanded': open ? 'true' : 'false',
    'aria-label': open ? t('collapseField', 'Collapse field') : t('expandField', 'Expand field'),
  }, [
    handle,
    preview,
    headerMeta,
    el('div', { className: 'bl-forms-builder__field-actions' }, [activateBtn, duplicateBtn, deleteBtn]),
  ]);

  header.addEventListener('click', (evt) => {
    if (
      evt.target.closest(
        '.bl-forms-builder__icon-btn, .bl-forms-builder__width-badge.is-interactive, .bl-forms-builder__handle'
      )
    ) {
      return;
    }
    setOpen(!row.classList.contains('is-open'));
  });

  header.addEventListener('keydown', (evt) => {
    if (evt.target !== header || (evt.key !== 'Enter' && evt.key !== ' ')) {
      return;
    }
    evt.preventDefault();
    setOpen(!row.classList.contains('is-open'));
  });

  updatePreview();
  renderBody();
  row.appendChild(header);
  row.appendChild(body);
  if (open) {
    setOpen(true);
  }
  return row;
}
