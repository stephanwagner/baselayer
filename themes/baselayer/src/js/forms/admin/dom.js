/** Shared DOM / i18n helpers for the form builder. */

export const TYPE_KEYS = [
  'text',
  'textarea',
  'email',
  'phone',
  'url',
  'number',
  'terms',
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
  'heading',
  'text_block',
  'divider',
  'spacer',
  'html',
  'hidden',
  'password',
  'honeypot',
  'captcha',
];

/** Palette accordion groups (Popular is default-open). */
export const PALETTE_SECTIONS = [
  {
    id: 'popular',
    headingKey: 'paletteSectionPopular',
    headingFallback: 'Popular',
    types: ['text', 'textarea', 'email', 'phone', 'terms'],
  },
  {
    id: 'input',
    headingKey: 'paletteSectionInput',
    headingFallback: 'Input',
    types: ['text', 'textarea', 'email', 'phone', 'url', 'number', 'terms'],
  },
  {
    id: 'choice',
    headingKey: 'paletteSectionChoice',
    headingFallback: 'Choice',
    types: ['checkboxes', 'radio', 'select', 'toggle', 'button_group'],
  },
  {
    id: 'datetime',
    headingKey: 'paletteSectionDatetime',
    headingFallback: 'Date & time',
    types: ['date', 'time', 'datetime'],
  },
  {
    id: 'files',
    headingKey: 'paletteSectionFiles',
    headingFallback: 'Uploads',
    types: ['file', 'image'],
  },
  {
    id: 'content',
    headingKey: 'paletteSectionContent',
    headingFallback: 'Content',
    types: ['heading', 'text_block', 'divider', 'spacer', 'html'],
  },
  {
    id: 'advanced',
    headingKey: 'paletteSectionAdvanced',
    headingFallback: 'Advanced',
    types: ['hidden', 'password', 'honeypot', 'captcha'],
  },
];

/** Type dropdown groups (no Popular duplicates). */
export const TYPE_SELECT_SECTIONS = PALETTE_SECTIONS.filter((section) => section.id !== 'popular');

export function uid() {
  return 'f' + Math.random().toString(36).slice(2, 10);
}

export function el(tag, props = {}, children = []) {
  const node = document.createElement(tag);
  Object.entries(props).forEach(([key, value]) => {
    if (value == null || value === false) return;
    if (key === 'className') node.className = value;
    else if (key === 'text') node.textContent = value;
    else if (key === 'dataset') Object.assign(node.dataset, value);
    else if (key.startsWith('on') && typeof value === 'function') {
      node.addEventListener(key.slice(2).toLowerCase(), value);
    } else if (key === 'checked') node.checked = Boolean(value);
    else node.setAttribute(key, value === true ? '' : String(value));
  });
  (Array.isArray(children) ? children : [children]).forEach((child) => {
    if (child == null || child === false) return;
    node.appendChild(typeof child === 'string' ? document.createTextNode(child) : child);
  });
  return node;
}

export function t(key, fallback = '') {
  const dict = (window.blFormsAdmin && window.blFormsAdmin.i18n) || {};
  return dict[key] || fallback || key;
}

/** Inline SVG from localized blFormsAdmin.icons. */
export function iconMarkup(key) {
  const icons = (window.blFormsAdmin && window.blFormsAdmin.icons) || {};
  return icons[key] || '';
}

export function iconEl(key, className = 'bl-forms-builder__icon') {
  const wrap = el('span', {
    className,
    'aria-hidden': 'true',
  });
  const markup = iconMarkup(key);
  if (markup) {
    wrap.innerHTML = markup;
  }
  return wrap;
}

export function typeLabel(type) {
  const dict = (window.blFormsAdmin && window.blFormsAdmin.i18n) || {};
  return (dict.types && dict.types[type]) || type;
}

export function defaultField(type = 'text') {
  const id = uid();
  if (type === 'divider') {
    return { id, type, width: '100', width_custom: '' };
  }
  if (type === 'spacer') {
    return { id, type, height: '24px', width: '100', width_custom: '' };
  }
  if (type === 'captcha') {
    return { id, type, width: '100', width_custom: '' };
  }
  if (type === 'heading' || type === 'text_block' || type === 'html') {
    return {
      id,
      type,
      content: type === 'heading' ? typeLabel(type) : '',
      width: '100',
      width_custom: '',
    };
  }
  if (type === 'honeypot') {
    return {
      id,
      type,
      name: id,
      label: typeLabel(type),
      width: '100',
      width_custom: '',
    };
  }
  if (type === 'hidden') {
    return {
      id,
      type,
      name: id,
      label: typeLabel(type),
      default_value: '',
      width: '100',
      width_custom: '',
    };
  }
  const base = {
    id,
    type,
    label: typeLabel(type),
    name: id,
    required: type === 'terms',
    placeholder: '',
    description: '',
    width: '100',
    width_custom: '',
  };
  if (['radio', 'checkboxes', 'select', 'button_group'].includes(type)) {
    base.options = [
      { label: 'Option 1', value: 'option-1' },
      { label: 'Option 2', value: 'option-2' },
    ];
  }
  if (['select', 'button_group', 'file', 'image'].includes(type)) {
    base.multiple = false;
  }
  if (type === 'terms') {
    base.label = '';
    base.content = t('termsDefaultLabel', 'I agree to the [Privacy Policy](page:privacy).');
  }
  if (type === 'toggle') {
    base.label = typeLabel(type);
  }
  return base;
}

export function readConfig() {
  const input = document.getElementById('bl-forms-config-json');
  if (!input) return { fields: [], settings: {} };
  try {
    return JSON.parse(input.value || '{}') || { fields: [], settings: {} };
  } catch (e) {
    return { fields: [], settings: {} };
  }
}

export function writeConfig(partial) {
  const input = document.getElementById('bl-forms-config-json');
  if (!input) return;
  const current = readConfig();
  input.value = JSON.stringify({
    fields: partial.fields !== undefined ? partial.fields : current.fields || [],
    settings: partial.settings !== undefined ? partial.settings : current.settings || {},
  });
}
