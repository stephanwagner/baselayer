/**
 * Block-option custom registry — no type switches in core.
 */

const customs = Object.create(null);

/**
 * Legacy custom types still present in old bl_block_options stores.
 * Maps to the live registered type.
 */
const TYPE_ALIASES = {
  'align-wide': 'container-wide',
};

/**
 * @typedef {Object} BlockOptionCustom
 * @property {string} type
 * @property {Function} Control
 * @property {(option: object) => string[]} [attributeKeys]
 * @property {(settings: object, option: object) => object} [registerAttributes]
 * @property {(option: object, attributes: object) => string[]} [classesFromAttributes]
 * @property {string[]} [managedClasses]
 * @property {(option: object, attributes: object) => object|null} [migrateAttributes]
 * @property {(option: object, index: number) => string} [optionKey]
 * @property {(ctx: object) => void} [onEditMount] optional hook inside BlockEdit
 */

/**
 * @param {BlockOptionCustom} def
 */
export function registerCustom(def) {
  if (!def || !def.type || typeof def.Control !== 'function') {
    return;
  }
  customs[def.type] = def;
}

/**
 * @param {string} type
 * @returns {string}
 */
export function resolveCustomType(type) {
  if (!type) {
    return type;
  }
  const canonical = TYPE_ALIASES[type];
  if (canonical && customs[canonical]) {
    return canonical;
  }
  return type;
}

/**
 * Whether a store/editor type is the given live custom (including aliases).
 *
 * @param {string} type
 * @param {string} canonical
 */
export function customTypeIs(type, canonical) {
  return type === canonical || TYPE_ALIASES[type] === canonical;
}

/**
 * @param {string} type
 * @returns {BlockOptionCustom|undefined}
 */
export function getCustom(type) {
  if (!type) {
    return undefined;
  }
  return customs[resolveCustomType(type)] || customs[type];
}

/**
 * @returns {BlockOptionCustom[]}
 */
export function getAllCustoms() {
  return Object.values(customs);
}

/**
 * Collect managed CSS classes from all registered customs.
 * @returns {string[]}
 */
export function allCustomManagedClasses() {
  const out = [];
  getAllCustoms().forEach((custom) => {
    if (Array.isArray(custom.managedClasses)) {
      out.push(...custom.managedClasses);
    }
  });
  return out;
}
