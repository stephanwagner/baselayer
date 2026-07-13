import { registerAllTypes } from './types';
import { createShell } from './shell';

let typesRegistered = false;

function ensureTypes() {
  if (!typesRegistered) {
    registerAllTypes();
    typesRegistered = true;
  }
}

/**
 * Mount the Field builder into a container.
 *
 * @param {HTMLElement} el
 * @param {object} [options]
 * @returns {{ getSchema: Function, setSchema: Function, destroy: Function }}
 */
export function mount(el, options = {}) {
  if (!el) {
    throw new Error('BlFieldBuilder.mount requires a container element');
  }
  ensureTypes();
  return createShell(el, options);
}

export { getType, listTypesForMode, registerType } from './registry';

const BlFieldBuilder = { mount };
export default BlFieldBuilder;

if (typeof window !== 'undefined') {
  window.BlFieldBuilder = BlFieldBuilder;
}
