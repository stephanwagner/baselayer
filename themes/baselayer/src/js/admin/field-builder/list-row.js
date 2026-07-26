import { el, empty } from './dom';
import { iconEl } from './icons';

/**
 * Apply dataset map to an element.
 *
 * @param {HTMLElement} node
 * @param {Record<string, string|number|boolean>|undefined} dataset
 */
function applyDataset(node, dataset) {
  if (!dataset || typeof dataset !== 'object') {
    return;
  }
  Object.entries(dataset).forEach(([key, value]) => {
    if (value == null || value === false) {
      return;
    }
    node.dataset[key] = String(value);
  });
}

/**
 * Set meta slot content (element, string, or clear).
 *
 * @param {HTMLElement} metaHost
 * @param {HTMLElement|string|null|undefined} meta
 */
function fillMeta(metaHost, meta) {
  empty(metaHost);
  if (meta == null || meta === false || meta === '') {
    metaHost.hidden = true;
    return;
  }
  metaHost.hidden = false;
  if (typeof meta === 'string') {
    metaHost.appendChild(
      el('span', { className: 'bl-field-builder__meta-text', text: meta })
    );
    return;
  }
  if (meta instanceof HTMLElement) {
    metaHost.appendChild(meta);
  }
}

/**
 * Unified expandable list-row chrome.
 * Header order: toggle | title | meta | handle | delete
 *
 * Layers: dom/sortable → createListRow → createFieldRow / domain UIs
 *
 * @param {object} options
 * @param {string} [options.title]
 * @param {boolean} [options.open]
 * @param {HTMLElement|string|null} [options.meta]
 * @param {boolean} [options.draggable]
 * @param {() => void} [options.onDelete]
 * @param {string} [options.className] Extra classes on root
 * @param {Record<string, string|number|boolean>} [options.dataset]
 * @param {string} [options.untitled]
 * @param {string} [options.dragTitle]
 * @param {string} [options.deleteTitle]
 * @returns {{
 *   root: HTMLElement,
 *   header: HTMLElement,
 *   body: HTMLElement,
 *   titleEl: HTMLElement,
 *   metaEl: HTMLElement,
 *   setTitle: (title: string) => void,
 *   setMeta: (meta: HTMLElement|string|null) => void,
 *   setOpen: (open: boolean) => void,
 *   isOpen: () => boolean,
 *   destroy: () => void
 * }}
 */
export function createListRow({
  title = '',
  open = false,
  meta = null,
  draggable = true,
  onDelete = null,
  className = '',
  dataset = {},
  untitled = '(untitled)',
  dragTitle = 'Drag to reorder',
  deleteTitle = 'Delete',
} = {}) {
  const root = el('div', {
    className:
      'bl-field-builder__item' +
      (open ? ' is-open' : '') +
      (className ? ' ' + className : ''),
  });
  applyDataset(root, dataset);

  const header = el('div', { className: 'bl-field-builder__item-header' });

  const toggler = el('button', {
    type: 'button',
    className: 'bl-field-builder__item-toggle',
    'aria-expanded': open ? 'true' : 'false',
    'aria-label': 'Expand or collapse',
  });
  toggler.appendChild(iconEl('chevron', 'bl-field-builder__icon bl-field-builder__icon--chevron'));

  const titleEl = el('span', {
    className: 'bl-field-builder__item-title',
    text: String(title || '').trim() || untitled,
  });

  const metaEl = el('div', { className: 'bl-field-builder__item-meta' });
  fillMeta(metaEl, meta);

  const handle = el('span', {
    className: 'bl-field-builder__item-handle' + (draggable ? '' : ' is-disabled'),
    title: dragTitle,
    'aria-hidden': 'true',
  });
  handle.appendChild(iconEl('drag'));

  const deleteBtn = el('button', {
    type: 'button',
    className: 'bl-field-builder__item-delete',
    title: deleteTitle,
    'aria-label': deleteTitle,
  });
  deleteBtn.appendChild(iconEl('trash'));

  header.appendChild(toggler);
  header.appendChild(titleEl);
  header.appendChild(metaEl);
  if (draggable) {
    header.appendChild(handle);
  }
  header.appendChild(deleteBtn);

  const body = el('div', {
    className: 'bl-field-builder__item-body',
    hidden: open ? undefined : true,
  });

  root.appendChild(header);
  root.appendChild(body);

  const setOpen = (nextOpen) => {
    const isOpen = !!nextOpen;
    root.classList.toggle('is-open', isOpen);
    body.hidden = !isOpen;
    toggler.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
  };

  const setTitle = (next) => {
    titleEl.textContent = String(next || '').trim() || untitled;
  };

  const setMeta = (next) => {
    fillMeta(metaEl, next);
  };

  toggler.addEventListener('click', (event) => {
    event.preventDefault();
    event.stopPropagation();
    setOpen(!root.classList.contains('is-open'));
  });

  deleteBtn.addEventListener('click', (event) => {
    event.preventDefault();
    event.stopPropagation();
    if (typeof onDelete === 'function') {
      onDelete();
      return;
    }
    root.dispatchEvent(new CustomEvent('bl-fb-delete', { bubbles: true }));
  });

  return {
    root,
    header,
    body,
    titleEl,
    metaEl,
    setTitle,
    setMeta,
    setOpen,
    isOpen: () => root.classList.contains('is-open'),
    destroy() {
      root.remove();
    },
  };
}
