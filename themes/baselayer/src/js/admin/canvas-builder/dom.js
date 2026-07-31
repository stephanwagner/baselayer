/**
 * Tiny DOM helpers for the canvas builder.
 */

export function uid(prefix = 'i') {
  return prefix + Math.random().toString(36).slice(2, 10);
}

export function el(tag, props = {}, children = []) {
  const node = document.createElement(tag);
  Object.entries(props).forEach(([key, value]) => {
    if (value == null || value === false) return;
    if (key === 'className') node.className = value;
    else if (key === 'text') node.textContent = value;
    else if (key === 'html') node.innerHTML = String(value);
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

/**
 * Resolve a translation via options.t or a plain fallback.
 *
 * @param {(key: string, fallback?: string) => string} tFn
 */
export function makeT(tFn) {
  if (typeof tFn === 'function') {
    return tFn;
  }
  return (_key, fallback = '') => fallback || _key;
}
