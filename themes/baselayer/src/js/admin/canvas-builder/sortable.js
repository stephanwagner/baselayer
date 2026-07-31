/**
 * SortableJS wrapper + body drag class helpers.
 */
import Sortable from 'sortablejs';

let dragDepth = 0;

export function dragStart() {
  dragDepth += 1;
  document.body.classList.add('is-dragging');
}

export function dragEnd() {
  dragDepth = Math.max(0, dragDepth - 1);
  if (dragDepth === 0) {
    document.body.classList.remove('is-dragging');
  }
}

/**
 * @param {HTMLElement} el
 * @param {object} options Sortable options
 */
export function createSortable(el, options = {}) {
  return Sortable.create(el, options);
}

export { Sortable };
