/** Shared DOM / i18n helpers for the form builder. */

export const TYPE_KEYS = ['text', 'email', 'textarea', 'radio', 'checkboxes', 'terms', 'heading', 'text_block'];

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

export function typeLabel(type) {
  const dict = (window.blFormsAdmin && window.blFormsAdmin.i18n) || {};
  return (dict.types && dict.types[type]) || type;
}

export function defaultField(type = 'text') {
  const id = uid();
  if (type === 'heading' || type === 'text_block') {
    return {
      id,
      type,
      content: type === 'heading' ? typeLabel(type) : '',
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
  if (type === 'radio' || type === 'checkboxes') {
    base.options = [
      { label: 'Option 1', value: 'option-1' },
      { label: 'Option 2', value: 'option-2' },
    ];
  }
  if (type === 'terms') {
    base.label = 'I agree to the terms.';
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
