import { el, t, typeLabel, uid, iconEl, uniqueFieldName, slugifyOption } from './dom.js';
import { createColumnCard, serializeLayoutRow } from './layout.js';

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
  const nav = el('div', {
    className: 'bl-forms-builder__captcha-nav',
    role: 'tablist',
    'aria-label': t('captchaService', 'CAPTCHA service'),
  });
  const panel = el('div', { className: 'bl-forms-builder__captcha-panel' });

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
  const providerInput = el('input', {
    type: 'hidden',
    dataset: { blCaptchaProvider: '1' },
    value: field.captcha_provider,
  });

  const siteRow = el('p', {}, [
    el('label', {}, [el('strong', { text: t('captchaSiteKey', 'Site key') })]),
    siteKey,
  ]);
  const secretRow = el('p', {}, [el('label', {}, [secretLabel]), secretKey]);

  panel.append(help, siteRow, secretRow, providerInput);

  const renderPanel = () => {
    const meta = captchaProviderMeta(field.captcha_provider);
    help.textContent = t(meta.helpKey, meta.helpFallback);
    secretLabel.textContent = t(meta.secretKey, meta.secretFallback);
    providerInput.value = field.captcha_provider;
    nav.querySelectorAll('.bl-forms-builder__captcha-service').forEach((btn) => {
      const active = btn.dataset.provider === field.captcha_provider;
      btn.classList.toggle('is-active', active);
      btn.setAttribute('aria-selected', active ? 'true' : 'false');
    });
  };

  CAPTCHA_PROVIDERS.forEach((meta) => {
    const btn = el('button', {
      type: 'button',
      className: 'bl-forms-builder__captcha-service',
      role: 'tab',
      text: t(meta.labelKey, meta.labelFallback),
      dataset: { provider: meta.id },
      onClick: () => {
        field.captcha_provider = meta.id;
        renderPanel();
        onChange();
        document.dispatchEvent(new CustomEvent('bl-forms-builder-changed'));
      },
    });
    nav.appendChild(btn);
  });

  siteKey.addEventListener('input', () => {
    field.captcha_site_key = siteKey.value;
    onChange();
  });
  secretKey.addEventListener('input', () => {
    field.captcha_secret_key = secretKey.value;
    onChange();
  });

  renderPanel();
  root.append(nav, panel);
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
  if (!data || data.type === 'column') {
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
      field.content = field.label || '';
    }
    field.required = true;
  }

  if (['heading', 'text_block', 'html'].includes(nextType) && field.content == null) {
    field.content = '';
  }

  if (NO_DEFAULT.includes(nextType)) {
    delete field.default_value;
  }

  if (NO_PLACEHOLDER.includes(nextType)) {
    field.placeholder = '';
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
];
const NO_REQUIRED = ['hidden', 'honeypot', 'captcha', 'divider', 'spacer', 'heading', 'text_block', 'html'];
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

function createCheckboxSetting(key, label, checked, onChange) {
  const input = el('input', {
    type: 'checkbox',
    dataset: { [key]: '1' },
    checked: !!checked,
  });
  input.addEventListener('change', () => onChange(input.checked));
  return el('p', {}, [el('label', {}, [input, ' ' + label])]);
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

function appendDefaultValueControl(general, field, updatePreview) {
  if (NO_DEFAULT.includes(field.type) || field.type === 'hidden') {
    return false;
  }

  if (CHECKED_DEFAULT_TYPES.includes(field.type)) {
    general.appendChild(
      createCheckboxSetting(
        'blDefault',
        t('defaultChecked', 'Checked by default'),
        isDefaultChecked(field.default_value),
        (checked) => {
          field.default_value = checked ? '1' : '';
          document.dispatchEvent(new CustomEvent('bl-forms-builder-changed'));
        }
      )
    );
    return true;
  }

  const def =
    field.type === 'textarea'
      ? el('textarea', {
          className: 'widefat',
          rows: '2',
          dataset: { blDefault: '1' },
        })
      : el('input', {
          type: 'text',
          className: 'widefat',
          dataset: { blDefault: '1' },
          value: field.default_value || '',
        });
  if (field.type === 'textarea') {
    def.value = field.default_value || '';
  }
  def.addEventListener('input', () => {
    field.default_value = def.value;
    updatePreview();
  });
  general.appendChild(
    el('p', {}, [el('label', { text: t('defaultValue', 'Default value') }), def])
  );

  if (OPTION_TYPES.includes(field.type)) {
    general.appendChild(
      el('p', {
        className: 'description',
        text: t(
          'defaultValueOptionsHelp',
          'Use option slugs from the list above. For multiple values, separate with commas (e.g. option-1, option-2).'
        ),
      })
    );
  }

  return true;
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
  };
}

function appendEmptyHint(panel, text) {
  panel.appendChild(
    el('p', {
      className: 'description bl-forms-builder__field-panel-empty',
      text,
    })
  );
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
    return { id, type, ...appearancePayload(body, width, widthCustom) };
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
    return {
      id,
      type,
      height: q('[data-bl-height]')?.value || '24px',
      ...appearancePayload(body, width, widthCustom),
    };
  }

  if (type === 'heading' || type === 'text_block' || type === 'html') {
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
  if (!NO_DEFAULT.includes(type)) {
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
      fieldName: field.name || '',
      nameManual: field.name_manual ? '1' : '0',
    },
  });

  const preview = el('span', { className: 'bl-forms-builder__preview' });
  const widthBadge = el('span', { className: 'bl-forms-builder__width-badge' });
  const typeChip = el('span', { className: 'bl-forms-builder__field-type' });
  const body = el('div', { className: 'bl-forms-builder__field-body' });

  const updatePreview = () => {
    let title = (field.label || field.content || field.placeholder || '').trim();
    if (field.type === 'captcha') {
      title = captchaProviderLabel(field.captcha_provider || 'turnstile');
    }
    preview.textContent = title;
    preview.hidden = title === '';

    const widthText = field.type === 'hidden' ? '' : widthBadgeLabel(field);
    widthBadge.textContent = widthText;
    widthBadge.hidden = widthText === '';
    widthBadge.classList.toggle('is-interactive', widthText !== '');
    if (widthText !== '') {
      widthBadge.title = t('width', 'Width');
    } else {
      widthBadge.removeAttribute('title');
    }

    typeChip.replaceChildren(
      iconEl(field.type, 'bl-forms-builder__field-type-icon'),
      el('span', { className: 'bl-forms-builder__field-type-label', text: typeLabel(field.type) })
    );
    row.dataset.fieldType = field.type;
    row.dataset.fieldWidth = field.width || '100';
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
    let generalCount = 0;
    let advancedCount = 0;

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
      general.appendChild(typeSelect);
      generalCount += 1;
    } else if (typeSelect) {
      advanced.appendChild(typeSelect);
      advancedCount += 1;
    }

    if (field.type !== 'hidden') {
      appearance.appendChild(createWidthControl(field, updatePreview));
    }
    if (field.type === 'radio' || field.type === 'checkboxes') {
      appearance.appendChild(createLayoutControl(field));
    }
    appearance.appendChild(createCssClassControl(field));

    if (field.type === 'spacer') {
      const heightInput = el('input', {
        type: 'text',
        className: 'widefat',
        dataset: { blHeight: '1' },
        value: field.height || '24px',
        placeholder: '24px',
      });
      heightInput.addEventListener('input', () => {
        field.height = heightInput.value;
      });
      appearance.appendChild(
        el('p', {}, [el('label', { text: t('spacerHeight', 'Height') }), heightInput])
      );
    }

    if (field.type === 'divider') {
      // no general settings
    } else if (field.type === 'captcha') {
      general.appendChild(
        createCaptchaSettings(field, () => {
          updatePreview();
        })
      );
      generalCount += 1;
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
      general.appendChild(el('p', {}, [el('label', { text: contentLabel }), ta]));
      generalCount += 1;
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

      const labelRow = el('div', { className: 'bl-forms-builder__label-row' });
      labelRow.appendChild(
        el('p', { className: 'bl-forms-builder__label-field' }, [
          el('label', { text: t('label', 'Label') }),
          labelInput,
        ])
      );
      if (HIDE_LABEL_TYPES.includes(field.type)) {
        const hide = el('input', {
          type: 'checkbox',
          dataset: { blHideLabel: '1' },
          checked: !!field.hide_label,
        });
        hide.addEventListener('change', () => {
          field.hide_label = hide.checked;
          document.dispatchEvent(new CustomEvent('bl-forms-builder-changed'));
        });
        labelRow.appendChild(
          el('p', { className: 'bl-forms-builder__hide-label' }, [
            el('label', {}, [hide, ' ' + t('hideLabel', 'Hide label')]),
          ])
        );
      }
      general.appendChild(labelRow);
      generalCount += 1;

      if (nameInput) {
        advanced.appendChild(
          el('p', {}, [el('label', { text: t('name', 'Field name') }), nameInput])
        );
        advanced.appendChild(
          el('p', {
            className: 'description',
            text: t(
              'nameHelp',
              'Internal field key used in submissions, emails, and entry data. Auto-filled from the label until you edit it.'
            ),
          })
        );
        advancedCount += 1;
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
        general.appendChild(
          el('p', {}, [el('label', { text: t('checkboxText', 'Checkbox text') }), consentText])
        );
        general.appendChild(
          el('p', {
            className: 'description',
            text: t(
              'checkboxTextHelp',
              'Links: [Privacy Policy](page:privacy) (site privacy page), [Privacy Policy](/privacy-policy), or [Privacy Policy](page:234). Unresolved page links show as plain text.'
            ),
          })
        );
        generalCount += 1;
      }

      if (CHECKED_DEFAULT_TYPES.includes(field.type)) {
        if (appendDefaultValueControl(general, field, updatePreview)) {
          generalCount += 1;
        }
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
        general.appendChild(
          el('p', {}, [el('label', { text: t('defaultValue', 'Default value') }), def])
        );
        generalCount += 1;
      }

      if (field.type === 'honeypot') {
        general.appendChild(
          el('p', {
            className: 'description',
            text: t(
              'honeypotHelp',
              'Hidden from visitors. If filled, the submission is treated as spam.'
            ),
          })
        );
        generalCount += 1;
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
        general.appendChild(
          el('p', {}, [el('label', { text: t('placeholder', 'Placeholder') }), ph])
        );
        generalCount += 1;
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
        general.appendChild(
          el('p', {}, [el('label', { text: t('description', 'Description') }), desc])
        );
        generalCount += 1;
      }

      if (MULTIPLE_TYPES.includes(field.type)) {
        let multipleLabel = t('allowMultiple', 'Allow multiple');
        if (field.type === 'button_group') {
          multipleLabel = t('buttonGroupMultiple', 'Allow multiple selection');
        } else if (field.type === 'select') {
          multipleLabel = t('selectMultiple', 'Allow multiple selection');
        }
        general.appendChild(
          createCheckboxSetting('blMultiple', multipleLabel, !!field.multiple, (checked) => {
            field.multiple = checked;
            document.dispatchEvent(new CustomEvent('bl-forms-builder-changed'));
          })
        );
        generalCount += 1;
      }

      if (OPTION_TYPES.includes(field.type)) {
        general.appendChild(el('p', { text: t('options', 'Options') }));
        general.appendChild(createOptionsEditor(field.options || []));
        generalCount += 1;
      }

      if (!CHECKED_DEFAULT_TYPES.includes(field.type) && appendDefaultValueControl(general, field, updatePreview)) {
        generalCount += 1;
      }

      if (!NO_REQUIRED.includes(field.type)) {
        const req = el('input', {
          type: 'checkbox',
          dataset: { blRequired: '1' },
          checked: !!field.required,
        });
        general.appendChild(
          el('p', {}, [el('label', {}, [req, ' ' + t('required', 'Required')])])
        );
        generalCount += 1;
      }
    }

    if (generalCount === 0) {
      appendEmptyHint(general, t('fieldTabGeneralEmpty', 'No general settings for this field.'));
    }
    if (advancedCount === 0) {
      appendEmptyHint(advanced, t('fieldTabAdvancedEmpty', 'No advanced settings for this field.'));
    }

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
    if (widthBadge.hidden || field.type === 'hidden') {
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
