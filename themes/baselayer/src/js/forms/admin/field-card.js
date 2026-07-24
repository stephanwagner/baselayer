import { el, t, typeLabel, uid, iconEl, uniqueFieldName, slugifyOption } from './dom.js';
import { createColumnCard, createSectionCard, serializeLayoutRow } from './layout.js';

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
  { value: 'xs', label: '8' },
  { value: 's', label: '16' },
  { value: 'm', label: '24' },
  { value: 'l', label: '32' },
  { value: 'xl', label: '48' },
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
const MULTIPLE_TYPES = ['select', 'button_group', 'file', 'image'];

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
 * Service picker + keys for a captcha field.
 *
 * @param {object} field
 * @param {() => void} onChange
 */
function createCaptchaSettings(field, onChange) {
  if (!field.captcha_provider || !CAPTCHA_PROVIDERS.some((p) => p.id === field.captcha_provider)) {
    field.captcha_provider = 'turnstile';
  }
  field.captcha_site_key = field.captcha_site_key || '';
  field.captcha_secret_key = field.captcha_secret_key || '';

  const root = el('div', { className: 'bl-forms-builder__captcha' });

  const provider = el('select', {
    className: 'widefat',
    dataset: { blCaptchaProvider: '1' },
  });
  CAPTCHA_PROVIDERS.forEach((meta) => {
    const opt = document.createElement('option');
    opt.value = meta.id;
    opt.textContent = t(meta.labelKey, meta.labelFallback);
    if (meta.id === field.captcha_provider) {
      opt.selected = true;
    }
    provider.appendChild(opt);
  });

  const help = el('p', { className: 'description' });
  const siteKey = el('input', {
    type: 'text',
    className: 'widefat code',
    dataset: { blCaptchaSiteKey: '1' },
    value: field.captcha_site_key,
    autocomplete: 'off',
  });
  const secretKey = el('input', {
    type: 'password',
    className: 'widefat code',
    dataset: { blCaptchaSecretKey: '1' },
    value: field.captcha_secret_key,
    autocomplete: 'new-password',
  });
  const secretLabel = el('strong', { text: '' });

  const syncLabels = () => {
    const meta = captchaProviderMeta(field.captcha_provider);
    help.textContent = t(meta.helpKey, meta.helpFallback);
    secretLabel.textContent = t(meta.secretKey, meta.secretFallback);
  };

  provider.addEventListener('change', () => {
    field.captcha_provider = provider.value;
    syncLabels();
    onChange();
    document.dispatchEvent(new CustomEvent('bl-forms-builder-changed'));
  });
  siteKey.addEventListener('input', () => {
    field.captcha_site_key = siteKey.value;
    onChange();
  });
  secretKey.addEventListener('input', () => {
    field.captcha_secret_key = secretKey.value;
    onChange();
  });

  syncLabels();
  root.append(
    el('p', {}, [
      el('label', {}, [el('strong', { text: t('captchaService', 'CAPTCHA service') })]),
      provider,
    ]),
    help,
    el('p', {}, [el('label', {}, [el('strong', { text: t('captchaSiteKey', 'Site key') })]), siteKey]),
    el('p', {}, [el('label', {}, [secretLabel]), secretKey])
  );
  return root;
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
  if (!data || data.type === 'column' || data.type === 'section') {
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
  } else {
    delete field.layout;
  }

  if (MULTIPLE_TYPES.includes(nextType)) {
    field.multiple = Boolean(field.multiple);
  } else {
    delete field.multiple;
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
    const level = String(field.level || 'h2').toLowerCase();
    field.level = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'].includes(level) ? level : 'h2';
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

  if (!['text', 'textarea'].includes(nextType)) {
    delete field.max_length;
    delete field.show_char_count;
    delete field.char_count_text;
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
  } else {
    // Migrating into a temporal type: legacy plain default → fixed mode.
    if (
      !field.default_mode &&
      field.default_value != null &&
      String(field.default_value).trim() !== ''
    ) {
      field.default_mode = 'fixed';
    }
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
  'date',
  'time',
  'datetime',
  'file',
  'image',
  'toggle',
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
  'heading',
  'text_block',
  'html',
  'column',
  'section',
  'date',
  'time',
  'datetime',
];
const NO_REQUIRED = [
  'hidden',
  'honeypot',
  'captcha',
  'divider',
  'spacer',
  'heading',
  'text_block',
  'html',
  'column',
  'section',
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
const NO_DEFAULT = [
  'file',
  'image',
  'honeypot',
  'captcha',
  'divider',
  'spacer',
  'heading',
  'text_block',
  'html',
];
const CHECKED_DEFAULT_TYPES = ['terms', 'toggle'];
const NAMED_TYPES = [
  'text',
  'textarea',
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
  'terms',
  'hidden',
  'honeypot',
];
const HIDE_LABEL_TYPES = NAMED_TYPES.filter((type) => type !== 'hidden' && type !== 'honeypot');

function createOptionsEditor(options) {
  const wrap = el('div', { className: 'bl-forms-builder__options' });
  const list = el('div', { className: 'bl-forms-builder__options-list' });

  list.appendChild(
    el('div', { className: 'bl-forms-builder__option bl-forms-builder__option--head' }, [
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
      className: 'button button-small',
      text: t('addOption', 'Add option'),
      onClick: () => addOption(),
    })
  );
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
  const wrap = el('div', { className: 'bl-forms-builder__width' });
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
  const active = field.layout === 'horizontal' ? 'horizontal' : 'vertical';
  const group = createSegmentedControl(
    [
      { value: 'vertical', label: t('layoutVertical', 'Vertical') },
      { value: 'horizontal', label: t('layoutHorizontal', 'Horizontal') },
    ],
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

const HEADING_LEVELS = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'];

function normalizeHeadingLevel(field) {
  const level = String(field.level || 'h2').toLowerCase();
  field.level = HEADING_LEVELS.includes(level) ? level : 'h2';
}

/** Heading tag level: H1–H6 (default H2). */
function createHeadingLevelControl(field, onChange = () => {}) {
  normalizeHeadingLevel(field);
  const wrap = el('div', { className: 'bl-forms-builder__heading-level' });
  const group = createSegmentedControl(
    HEADING_LEVELS.map((level) => ({
      value: level,
      label: level.toUpperCase(),
      dataset: { blHeadingLevel: level },
    })),
    field.level || 'h2',
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

function createMaxLengthControl(field) {
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
    t('showCharCount', 'Show remaining characters'),
    !!field.show_char_count,
    syncShow
  );

  const syncMax = () => {
    field.max_length = maxInput.value.trim();
    document.dispatchEvent(new CustomEvent('bl-forms-builder-changed'));
  };
  maxInput.addEventListener('change', syncMax);
  maxInput.addEventListener('blur', syncMax);
  maxInput.addEventListener('input', syncMax);

  return el('div', { className: 'bl-forms-builder__max-length' }, [
    el('p', {}, [el('label', { text: t('maxLength', 'Maximum length') }), maxInput]),
    showSwitch,
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
  return el('p', { className: 'bl-forms-builder__setting-heading', text });
}

function createCheckboxSetting(key, label, checked, onChange) {
  const input = el('input', {
    type: 'checkbox',
    dataset: { [key]: '1' },
    checked: !!checked,
  });
  input.addEventListener('change', () => onChange(input.checked));
  return el('p', { className: 'bl-forms-builder__check-setting' }, [
    el('label', {}, [input, ' ' + label]),
  ]);
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
      return 'url';
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
    try {
      const parsed = new URL(v, window.location.origin);
      return parsed.protocol === 'http:' || parsed.protocol === 'https:';
    } catch (err) {
      return false;
    }
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

function normalizeDefaultValue(type, value) {
  const v = String(value || '').trim();
  if (v === '' || isValidDefaultValue(type, v)) {
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
      createCheckboxSetting(
        'blDefault',
        t('defaultChecked', 'Checked by default'),
        isDefaultChecked(field.default_value),
        (checked) => {
          field.default_value = checked ? '1' : '';
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
    field.type === 'textarea'
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
  if (field.type === 'textarea') {
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
    if (['text', 'textarea', 'phone'].includes(field.type) || OPTION_TYPES.includes(field.type)) {
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
  };

  const wrap = el('div', { className: 'bl-forms-builder__field-editor' }, [tabBar, panelsWrap]);
  return {
    wrap,
    general: tabs[0].panel,
    advanced: tabs[1].panel,
    appearance: tabs[2].panel,
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

  if (type === 'divider') {
    const marginBtn = q('[data-bl-margin].is-active');
    const margin = marginBtn?.dataset.blMargin || row.dataset.fieldMargin || 'm';
    const marginCustom = q('[data-bl-margin-custom]')?.value || '';
    return {
      id,
      type,
      margin,
      margin_custom: margin === 'custom' ? marginCustom : '',
      css_class: q('[data-bl-css-class]')?.value || '',
    };
  }

  if (type === 'captcha') {
    return {
      id,
      type,
      captcha_provider: q('[data-bl-captcha-provider]')?.value || 'turnstile',
      captcha_site_key: q('[data-bl-captcha-site-key]')?.value || '',
      captcha_secret_key: q('[data-bl-captcha-secret-key]')?.value || '',
      ...appearancePayload(body, width, widthCustom),
    };
  }

  if (type === 'spacer') {
    const heightBtn = q('[data-bl-height].is-active');
    const height = heightBtn?.dataset.blHeight || row.dataset.fieldHeight || 'm';
    const heightCustom = q('[data-bl-height-custom]')?.value || '';
    return {
      id,
      type,
      height,
      height_custom: height === 'custom' ? heightCustom : '',
      css_class: q('[data-bl-css-class]')?.value || '',
    };
  }

  if (type === 'heading') {
    const levelBtn = q('[data-bl-heading-level].is-active');
    const level = levelBtn?.dataset.blHeadingLevel || 'h2';
    return {
      id,
      type,
      content: q('[data-bl-content]')?.value || '',
      level: HEADING_LEVELS.includes(level) ? level : 'h2',
      ...appearancePayload(body, width, widthCustom),
    };
  }

  if (type === 'text_block' || type === 'html') {
    return {
      id,
      type,
      content: q('[data-bl-content]')?.value || '',
      ...appearancePayload(body, width, widthCustom),
    };
  }

  if (type === 'honeypot') {
    return {
      id,
      type,
      label: q('[data-bl-label]')?.value || '',
      name: q('[data-bl-name]')?.value || id,
      name_manual: nameManual,
      hide_label: hideLabel,
      ...appearancePayload(body, width, widthCustom),
    };
  }

  if (type === 'hidden') {
    return {
      id,
      type,
      label: q('[data-bl-label]')?.value || '',
      name: q('[data-bl-name]')?.value || id,
      name_manual: nameManual,
      hide_label: hideLabel,
      default_value: q('[data-bl-default]')?.value || '',
      ...appearancePayload(body, '100', ''),
    };
  }

  const data = {
    id,
    type,
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
  if (type === 'terms') {
    data.content = q('[data-bl-content]')?.value || '';
  }
  if (OPTION_TYPES.includes(type)) {
    data.options = Array.from(body.querySelectorAll('[data-bl-option]')).map((opt) => ({
      label: opt.querySelector('[data-bl-opt-label]')?.value || '',
      value: opt.querySelector('[data-bl-opt-value]')?.value || '',
    }));
  }
  if (type === 'radio' || type === 'checkboxes') {
    const layoutBtn = q('[data-bl-layout].is-active');
    data.layout = layoutBtn?.dataset.blLayout === 'horizontal' ? 'horizontal' : 'vertical';
  }
  if (MULTIPLE_TYPES.includes(type)) {
    data.multiple = Boolean(q('[data-bl-multiple]')?.checked);
  }
  if (AUTOCOMPLETE_TYPES.includes(type)) {
    const ac = q('[data-bl-autocomplete]');
    data.autocomplete = ac?.value === 'off' ? 'off' : 'auto';
  }
  if (type === 'number') {
    data.min = q('[data-bl-min]')?.value?.trim() || '';
    data.max = q('[data-bl-max]')?.value?.trim() || '';
  }
  if (type === 'text' || type === 'textarea') {
    data.max_length = q('[data-bl-max-length]')?.value?.trim() || '';
    data.show_char_count = Boolean(q('[data-bl-show-char-count]')?.checked);
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

  return data;
}

export function createFieldCard(initial, open = false) {
  if ((initial?.type || '') === 'column') {
    return createColumnCard(initial, open);
  }
  if ((initial?.type || '') === 'section') {
    return createSectionCard(initial, open);
  }

  let field = {
    width: '100',
    width_custom: '',
    hide_label: false,
    ...initial,
    id: initial.id || uid(),
    name_manual: initial.name_manual != null ? !!initial.name_manual : true,
  };
  if (field.type === 'terms' && field.content == null && field.label) {
    field = { ...field, content: field.label, label: '' };
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

  const preview = el('span', { className: 'bl-forms-builder__preview' });
  const widthBadge = el('span', { className: 'bl-forms-builder__width-badge' });
  const typeChip = el('span', { className: 'bl-forms-builder__field-type' });
  const body = el('div', { className: 'bl-forms-builder__field-body' });

  const updatePreview = () => {
    let title = (field.label || field.placeholder || '').trim();
    if (field.type === 'captcha') {
      title = captchaProviderLabel(field.captcha_provider || 'turnstile');
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
    } else if (field.type === 'heading' || field.type === 'text_block' || field.type === 'html') {
      title = (field.content || '').trim();
    }
    preview.textContent = title;
    preview.hidden = title === '';

    const widthText =
      field.type === 'hidden' || field.type === 'divider' || field.type === 'spacer'
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
        const otherToggle = other.querySelector('.bl-forms-builder__field-toggle');
        if (otherToggle) {
          otherToggle.setAttribute('aria-expanded', 'false');
          otherToggle.setAttribute('aria-label', t('expandField', 'Expand field'));
        }
      });
    }

    row.classList.toggle('is-open', nextOpen);
    toggle.setAttribute('aria-expanded', nextOpen ? 'true' : 'false');
    toggle.setAttribute(
      'aria-label',
      nextOpen ? t('collapseField', 'Collapse field') : t('expandField', 'Expand field')
    );
  };

  const toggle = el('button', {
    type: 'button',
    className: 'bl-forms-builder__icon-btn bl-forms-builder__field-toggle',
    'aria-expanded': open ? 'true' : 'false',
    'aria-label': open ? t('collapseField', 'Collapse field') : t('expandField', 'Expand field'),
    onClick: () => setOpen(!row.classList.contains('is-open')),
  });
  const caretIcon = iconEl('caret', 'bl-forms-builder__field-toggle-icon');
  if (caretIcon.innerHTML) {
    toggle.appendChild(caretIcon);
  } else {
    toggle.textContent = '▾';
  }

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
    const { general, advanced, appearance } = tabs;
    const generalSections = createSectionAppender(general);
    const advancedSections = createSectionAppender(advanced);
    const appearanceSections = createSectionAppender(appearance);

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
    if (field.type !== 'hidden' && field.type !== 'divider' && field.type !== 'spacer') {
      appearanceSections.add(createWidthControl(field, updatePreview));
    }
    if (field.type === 'radio' || field.type === 'checkboxes') {
      appearanceSections.add(createLayoutControl(field));
    }
    appearanceSections.add(createCssClassControl(field));

    if (field.type === 'divider' || field.type === 'spacer') {
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
            createSwitchSetting('blHideLabel', t('hideLabel', 'Hide label'), !!field.hide_label, (checked) => {
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
        advancedSections.add(
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

      if (AUTOCOMPLETE_TYPES.includes(field.type)) {
        advancedSections.add(createAutocompleteControl(field));
      }

      if (field.type === 'text' || field.type === 'textarea') {
        advancedSections.add(createMaxLengthControl(field));
      }

      if (field.type === 'number') {
        advancedSections.add(createNumberBoundsControl(field));
      }

      if (['date', 'time', 'datetime'].includes(field.type)) {
        advancedSections.add(createTemporalBoundsControl(field));
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
            text: t(
              'checkboxTextHelp',
              'Links: [Privacy Policy](page:privacy) (site privacy page), [Privacy Policy](/privacy-policy), or [Privacy Policy](page:234). Unresolved page links show as plain text.'
            ),
          })
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
        generalSections.add(
          el('p', {}, [el('label', { text: t('description', 'Description') }), desc])
        );
      }

      if (OPTION_TYPES.includes(field.type)) {
        generalSections.add(
          settingHeading(t('choices', 'Choices')),
          createOptionsEditor(field.options || [])
        );
      }

      if (field.type !== 'hidden') {
        const defaults = createDefaultValueControl(field, updatePreview);
        if (defaults) {
          if (CHECKED_DEFAULT_TYPES.includes(field.type)) {
            generalSections.add(settingHeading(t('defaultValue', 'Default value')), ...defaults);
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
        }
        optionToggles.push(
          createSwitchSetting('blMultiple', multipleLabel, !!field.multiple, (checked) => {
            field.multiple = checked;
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

  const headerMeta = el('div', { className: 'bl-forms-builder__field-meta' }, [
    widthBadge,
    typeChip,
  ]);

  widthBadge.addEventListener('click', (evt) => {
    if (
      widthBadge.hidden ||
      field.type === 'hidden' ||
      field.type === 'divider' ||
      field.type === 'spacer'
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

  const header = el('div', { className: 'bl-forms-builder__field-header' }, [
    toggle,
    preview,
    headerMeta,
    el('div', { className: 'bl-forms-builder__field-actions' }, [deleteBtn, handle]),
  ]);

  updatePreview();
  renderBody();
  row.appendChild(header);
  row.appendChild(body);
  if (open) {
    setOpen(true);
  }
  return row;
}
