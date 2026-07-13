/**
 * Tiny DOM helpers — no jQuery.
 */

export function el(tag, attrs = {}, children = []) {
  const node = document.createElement(tag);
  Object.entries(attrs).forEach(([key, value]) => {
    if (value == null || value === false) {
      return;
    }
    if (key === 'className') {
      node.className = value;
      return;
    }
    if (key === 'dataset' && typeof value === 'object') {
      Object.entries(value).forEach(([dataKey, dataValue]) => {
        node.dataset[dataKey] = String(dataValue);
      });
      return;
    }
    if (key.startsWith('on') && typeof value === 'function') {
      node.addEventListener(key.slice(2).toLowerCase(), value);
      return;
    }
    if (key === 'text') {
      node.textContent = value;
      return;
    }
    if (key === 'html') {
      node.innerHTML = value;
      return;
    }
    node.setAttribute(key, value === true ? '' : String(value));
  });
  (Array.isArray(children) ? children : [children]).forEach((child) => {
    if (child == null || child === false) {
      return;
    }
    if (typeof child === 'string') {
      node.appendChild(document.createTextNode(child));
      return;
    }
    node.appendChild(child);
  });
  return node;
}

export function empty(node) {
  while (node.firstChild) {
    node.removeChild(node.firstChild);
  }
}

export function slugify(text) {
  return String(text || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .replace(/_+/g, '_');
}

export function formRow(labelText, control) {
  return el('div', { className: 'bl-field-builder__form-row' }, [
    el('div', { className: 'bl-field-builder__form-label', text: labelText }),
    control,
  ]);
}
