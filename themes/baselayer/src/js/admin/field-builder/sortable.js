import Sortable from 'sortablejs';

/**
 * Create a Sortable list with kit defaults.
 *
 * @param {HTMLElement} listEl
 * @param {object} [options] SortableJS options (merged with defaults)
 * @returns {import('sortablejs').default}
 */
export function createSortable(listEl, options = {}) {
  return Sortable.create(listEl, {
    handle: '.bl-field-builder__item-handle',
    animation: 150,
    draggable: '[data-bl-fb-field]',
    ghostClass: 'is-dragging-ghost',
    chosenClass: 'is-dragging-chosen',
    dragClass: 'is-dragging',
    onStart() {
      document.body.classList.add('bl-field-builder-dragging');
    },
    onEnd() {
      document.body.classList.remove('bl-field-builder-dragging');
    },
    ...options,
  });
}
