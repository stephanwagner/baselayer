/**
 * Consumer hooks for package-specific field-card behaviour (Forms, Blocks, …).
 * Nested cards pick these up automatically — no need to thread options through createFieldCard.
 */

/** @type {{ fieldCard: {
 *   onInitField?: (field: object) => void,
 *   onNormalizeType?: (field: object, nextType: string) => void,
 *   extraSwitches?: (field: object) => (Node|null|undefined)[],
 *   onSerialize?: (data: object, ctx: { type: string, q: Function, body: Element, row: Element }) => void,
 * } }} */
const state = {
  fieldCard: {},
};

/**
 * Merge consumer hooks into the form-builder kit.
 *
 * @param {{ fieldCard?: object }} options
 */
export function configure(options = {}) {
  if (options.fieldCard && typeof options.fieldCard === 'object') {
    state.fieldCard = { ...state.fieldCard, ...options.fieldCard };
  }
}

/**
 * Replace all hooks (mainly for tests).
 *
 * @param {{ fieldCard?: object }} options
 */
export function resetConfig(options = {}) {
  state.fieldCard = options.fieldCard && typeof options.fieldCard === 'object' ? { ...options.fieldCard } : {};
}

/**
 * @returns {typeof state.fieldCard}
 */
export function getFieldCardHooks() {
  return state.fieldCard;
}
