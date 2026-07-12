/**
 * Field type registry.
 */

const types = new Map();

/**
 * @param {object} definition
 */
export function registerType(definition) {
  if (!definition || !definition.id) {
    throw new Error('Field type must export an id');
  }
  types.set(definition.id, definition);
}

/**
 * @param {string} id
 */
export function getType(id) {
  return types.get(id) || null;
}

/**
 * @param {'fields'|'options'} mode
 * @returns {object[]}
 */
export function listTypesForMode(mode = 'fields') {
  return Array.from(types.values()).filter((type) => {
    const modes = type.modes || ['fields'];
    return modes.includes(mode);
  });
}

/**
 * @returns {string[]}
 */
export function listTypeIds() {
  return Array.from(types.keys());
}
