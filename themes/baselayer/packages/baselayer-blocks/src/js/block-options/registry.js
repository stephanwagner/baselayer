/**
 * Block-option custom registry — no type switches in core.
 */

const customs = Object.create(null);

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
 * @returns {BlockOptionCustom|undefined}
 */
export function getCustom(type) {
  return customs[type];
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
