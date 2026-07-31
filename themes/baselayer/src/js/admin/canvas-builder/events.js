/**
 * Tiny event emitter for builder lifecycle events.
 */
export function createEmitter() {
  const listeners = new Map();

  return {
    on(event, fn) {
      if (!listeners.has(event)) {
        listeners.set(event, new Set());
      }
      listeners.get(event).add(fn);
      return () => listeners.get(event)?.delete(fn);
    },
    emit(event, payload) {
      const set = listeners.get(event);
      if (!set) return;
      set.forEach((fn) => {
        try {
          fn(payload);
        } catch (e) {
          // Keep one bad listener from breaking the builder.
          console.error(e);
        }
      });
    },
    clear() {
      listeners.clear();
    },
  };
}
