/**
 * Expandable item chrome helpers (optional; consumers may supply full cards).
 */
import { el } from './dom.js';

/**
 * Minimal expandable row shell. Prefer consumer `createItem` for rich cards.
 *
 * @param {object} options
 * @param {string} options.ns
 * @param {string} [options.title]
 * @param {string} [options.type]
 * @param {string} [options.id]
 * @param {HTMLElement|HTMLElement[]} [options.body]
 * @param {() => void} [options.onRemove]
 */
export function createItemChrome(options = {}) {
  const ns = options.ns || 'bl-builder';
  const row = el('div', {
    className: `${ns}__item`,
    dataset: {
      blBuilderItem: '1',
      itemId: options.id || '',
      itemType: options.type || '',
    },
  });

  const handle = el('span', {
    className: `${ns}__handle`,
    'aria-hidden': 'true',
    text: '⋮⋮',
  });

  const title = el('button', {
    type: 'button',
    className: `${ns}__item-title`,
    text: options.title || options.type || 'Item',
  });

  const remove = el('button', {
    type: 'button',
    className: `${ns}__item-remove`,
    text: '×',
    'aria-label': 'Remove',
    onClick: (event) => {
      event.preventDefault();
      event.stopPropagation();
      options.onRemove?.();
      row.remove();
    },
  });

  const header = el('div', { className: `${ns}__item-header` }, [handle, title, remove]);
  const body = el('div', { className: `${ns}__item-body`, hidden: true });
  if (options.body) {
    (Array.isArray(options.body) ? options.body : [options.body]).forEach((child) => {
      if (child) body.appendChild(child);
    });
  }

  title.addEventListener('click', () => {
    const open = body.hidden;
    body.hidden = !open;
    row.classList.toggle('is-open', open);
  });

  row.append(header, body);
  return row;
}
