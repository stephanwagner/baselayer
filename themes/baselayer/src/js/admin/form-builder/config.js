/**
 * Consumer hooks for package-specific field-card behaviour (Forms, Blocks, …).
 * Nested cards pick these up automatically — no need to thread options through createFieldCard.
 */

/** @type {{
 *   mediaLibraryFields: boolean,
 *   fieldCard: {
 *     onInitField?: (field: object) => void,
 *     onNormalizeType?: (field: object, nextType: string) => void,
 *     extraSwitches?: (field: object) => (Node|null|undefined)[],
 *     onSerialize?: (data: object, ctx: { type: string, q: Function, body: Element, row: Element }) => void,
 *   }
 * }} */
const state = {
  mediaLibraryFields: false,
  fieldCard: {},
};

/**
 * Merge consumer hooks into the form-builder kit.
 *
 * @param {{ mediaLibraryFields?: boolean, fieldCard?: object }} options
 */
export function configure(options = {}) {
  if (typeof options.mediaLibraryFields === 'boolean') {
    state.mediaLibraryFields = options.mediaLibraryFields;
  }
  if (options.fieldCard && typeof options.fieldCard === 'object') {
    state.fieldCard = { ...state.fieldCard, ...options.fieldCard };
  }
}

/**
 * Replace all hooks (mainly for tests).
 *
 * @param {{ mediaLibraryFields?: boolean, fieldCard?: object }} options
 */
export function resetConfig(options = {}) {
  state.mediaLibraryFields = !!options.mediaLibraryFields;
  state.fieldCard =
    options.fieldCard && typeof options.fieldCard === 'object' ? { ...options.fieldCard } : {};
}

/**
 * @returns {typeof state.fieldCard}
 */
export function getFieldCardHooks() {
  return state.fieldCard;
}

/**
 * When true, file/image fields use the WP media library (Blocks), not visitor uploads (Forms).
 *
 * @returns {boolean}
 */
export function useMediaLibraryFields() {
  return !!state.mediaLibraryFields;
}
