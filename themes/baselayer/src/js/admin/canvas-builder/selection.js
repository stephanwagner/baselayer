/**
 * Selection state for the open/selected canvas item.
 */
export function createSelection() {
  let selectedId = '';

  return {
    get() {
      return selectedId;
    },
    set(id) {
      selectedId = id ? String(id) : '';
    },
    clear() {
      selectedId = '';
    },
  };
}
