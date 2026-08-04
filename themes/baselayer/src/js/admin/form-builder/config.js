/**
 * Consumer hooks for package-specific field-card behaviour (Forms, Blocks, …).
 * Nested cards pick these up automatically — no need to thread options through createFieldCard.
 */

const DEFAULT_HEADING_LEVELS = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'];

/** @type {{
 *   mediaLibraryFields: boolean,
 *   headingLevels: string[],
 *   fieldCard: {
 *     onInitField?: (field: object) => void,
 *     onNormalizeType?: (field: object, nextType: string) => void,
 *     extraSwitches?: (field: object) => (Node|null|undefined)[],
 *     onSerialize?: (data: object, ctx: { type: string, q: Function, body: Element, row: Element }) => void,
 *   }
 * }} */
const state = {
  mediaLibraryFields: false,
  headingLevels: [...DEFAULT_HEADING_LEVELS],
  fieldCard: {},
};

/**
 * @param {unknown} levels
 * @returns {string[]}
 */
function sanitizeHeadingLevels(levels) {
  if (!Array.isArray(levels) || levels.length === 0) {
    return [...DEFAULT_HEADING_LEVELS];
  }
  const allowed = new Set(DEFAULT_HEADING_LEVELS);
  const out = [];
  levels.forEach((raw) => {
    const level = String(raw || '').toLowerCase();
    if (allowed.has(level) && !out.includes(level)) {
      out.push(level);
    }
  });
  return out.length ? out : [...DEFAULT_HEADING_LEVELS];
}

/**
 * Merge consumer hooks into the form-builder kit.
 *
 * @param {{ mediaLibraryFields?: boolean, headingLevels?: string[], fieldCard?: object }} options
 */
export function configure(options = {}) {
  if (typeof options.mediaLibraryFields === 'boolean') {
    state.mediaLibraryFields = options.mediaLibraryFields;
  }
  if (options.headingLevels !== undefined) {
    state.headingLevels = sanitizeHeadingLevels(options.headingLevels);
  }
  if (options.fieldCard && typeof options.fieldCard === 'object') {
    state.fieldCard = { ...state.fieldCard, ...options.fieldCard };
  }
}

/**
 * Replace all hooks (mainly for tests).
 *
 * @param {{ mediaLibraryFields?: boolean, headingLevels?: string[], fieldCard?: object }} options
 */
export function resetConfig(options = {}) {
  state.mediaLibraryFields = !!options.mediaLibraryFields;
  state.headingLevels = sanitizeHeadingLevels(options.headingLevels);
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
 * Allowed heading tag levels for the Level control (Forms: h1–h6, Blocks: h2–h4).
 *
 * @returns {string[]}
 */
export function getHeadingLevels() {
  return state.headingLevels.length ? state.headingLevels : [...DEFAULT_HEADING_LEVELS];
}

/**
 * When true, file/image fields use the WP media library (Blocks), not visitor uploads (Forms).
 *
 * @returns {boolean}
 */
export function useMediaLibraryFields() {
  return !!state.mediaLibraryFields;
}
