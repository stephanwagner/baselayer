/** Shared DOM / i18n helpers for the form builder. */

let formsDragDepth = 0;

/** Mark body while a Sortable drag is active (supports nested/cross-list). */
export function formsDragStart() {
  formsDragDepth += 1;
  document.body.classList.add('is-dragging');
}

/** Collapse any open field editors (call from Sortable onChoose, before drag starts). */
export function collapseOpenFields() {
  document.querySelectorAll('.bl-forms-builder__field.is-open').forEach((field) => {
    field.classList.remove('is-open');
    const toggle = field.querySelector('.bl-forms-builder__field-toggle');
    if (toggle) {
      toggle.setAttribute('aria-expanded', 'false');
      toggle.setAttribute('aria-label', t('expandField', 'Expand field'));
    }
  });
}

export function formsDragEnd() {
  formsDragDepth = Math.max(0, formsDragDepth - 1);
  if (formsDragDepth === 0) {
    document.body.classList.remove('is-dragging');
  }
}

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
  'column',
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
    id: 'layout',
    headingKey: 'paletteSectionLayout',
    headingFallback: 'Layout',
    types: ['column'],
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

/** Slug for field name keys (ASCII, underscore). */
export function slugifyName(text) {
  const slug = String(text || '')
    .trim()
    .toLowerCase()
    .replace(/ä/g, 'ae')
    .replace(/ö/g, 'oe')
    .replace(/ü/g, 'ue')
    .replace(/ß/g, 'ss')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .replace(/_+/g, '_');
  return slug || 'field';
}

/** Slug for option values (ASCII, hyphen). */
export function slugifyOption(text) {
  const slug = String(text || '')
    .trim()
    .toLowerCase()
    .replace(/ä/g, 'ae')
    .replace(/ö/g, 'oe')
    .replace(/ü/g, 'ue')
    .replace(/ß/g, 'ss')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-+/g, '-');
  return slug || 'option';
}

/** Collect field name keys currently on the canvas (optional exclude id). */
export function collectFieldNames(exceptId = '') {
  return Array.from(document.querySelectorAll('[data-bl-forms-field]'))
    .filter((row) => !exceptId || row.dataset.fieldId !== exceptId)
    .map((row) => {
      const input = row.querySelector('[data-bl-name]');
      const value = (input?.value || row.dataset.fieldName || '').trim();
      return value;
    })
    .filter(Boolean);
}

/** Ensure a unique field name among siblings on the canvas. */
export function uniqueFieldName(base, exceptId = '') {
  const root = slugifyName(base);
  const used = new Set(collectFieldNames(exceptId).map((n) => n.toLowerCase()));
  if (!used.has(root)) {
    return root;
  }
  let i = 2;
  while (used.has(`${root}_${i}`)) {
    i += 1;
  }
  return `${root}_${i}`;
}

export function defaultField(type = 'text') {
  const id = uid();
  if (type === 'divider') {
    return { id, type, width: '100', width_custom: '', css_class: '' };
  }
  if (type === 'spacer') {
    return { id, type, height: '24px', width: '100', width_custom: '', css_class: '' };
  }
  if (type === 'captcha') {
    return { id, type, width: '100', width_custom: '', css_class: '' };
  }
  if (type === 'heading' || type === 'text_block' || type === 'html') {
    return {
      id,
      type,
      content: type === 'heading' ? typeLabel(type) : '',
      width: '100',
      width_custom: '',
      css_class: '',
    };
  }
  if (type === 'honeypot') {
    return {
      id,
      type,
      name: slugifyName(typeLabel(type)),
      name_manual: false,
      label: typeLabel(type),
      hide_label: false,
      width: '100',
      width_custom: '',
      css_class: '',
    };
  }
  if (type === 'hidden') {
    return {
      id,
      type,
      name: slugifyName(typeLabel(type)),
      name_manual: false,
      label: typeLabel(type),
      hide_label: false,
      default_value: '',
      width: '100',
      width_custom: '',
      css_class: '',
    };
  }
  if (type === 'column') {
    return {
      id,
      type,
      width: '100',
      width_custom: '',
      children: [],
    };
  }
  const base = {
    id,
    type,
    label: typeLabel(type),
    name: slugifyName(typeLabel(type)),
    name_manual: false,
    hide_label: false,
    required: type === 'terms',
    placeholder: '',
    description: '',
    width: '100',
    width_custom: '',
    css_class: '',
  };
  if (['radio', 'checkboxes', 'select', 'button_group'].includes(type)) {
    base.options = [
      { label: 'Option 1', value: 'option-1' },
      { label: 'Option 2', value: 'option-2' },
    ];
  }
  if (['radio', 'checkboxes'].includes(type)) {
    base.layout = 'vertical';
  }
  if (['select', 'button_group', 'file', 'image'].includes(type)) {
    base.multiple = false;
  }
  if (type === 'terms') {
    base.label = '';
    base.content = t('termsDefaultLabel', 'I agree to the [Privacy Policy](page:privacy).');
    base.default_value = '1';
  }
  if (type === 'toggle') {
    base.label = typeLabel(type);
    base.default_value = '';
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

/** Flatten nested column trees to leaf fields. */
export function flattenFields(fields = []) {
  const out = [];
  const walk = (list) => {
    (list || []).forEach((field) => {
      if (!field) return;
      if (field.type === 'column' || field.type === 'group') {
        walk(field.children || []);
        return;
      }
      out.push(field);
    });
  };
  walk(fields);
  return out;
}
