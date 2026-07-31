/**
 * Walk canvas children and serialize via the consumer hook.
 *
 * @param {HTMLElement} listEl
 * @param {(el: HTMLElement) => unknown} serializeItem
 * @param {(el: HTMLElement) => boolean} [isItem]
 */
export function serializeList(listEl, serializeItem, isItem) {
  if (!listEl) return [];
  const match =
    isItem ||
    ((node) =>
      node?.matches?.(
        '[data-bl-builder-item], [data-bl-forms-field], .bl-builder__item, .bl-forms-builder__field'
      ));
  return Array.from(listEl.children)
    .filter(match)
    .map((node) => serializeItem(node));
}
