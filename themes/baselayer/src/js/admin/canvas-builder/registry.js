/**
 * Item-type registry for consumer-provided builders (Forms, Blocks, …).
 */

export function createRegistry() {
  /** @type {Map<string, object>} */
  const types = new Map();

  return {
    register(type) {
      if (!type || !type.id) {
        throw new Error('BlCanvasBuilder.registerType requires type.id');
      }
      types.set(String(type.id), type);
    },
    registerMany(list = []) {
      (list || []).forEach((type) => this.register(type));
    },
    get(id) {
      return types.get(String(id)) || null;
    },
    has(id) {
      return types.has(String(id));
    },
    list() {
      return Array.from(types.values());
    },
    clear() {
      types.clear();
    },
  };
}
