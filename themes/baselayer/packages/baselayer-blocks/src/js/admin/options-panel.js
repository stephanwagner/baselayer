/**
 * Options tab — block sidebar options (generics + preset refs).
 * Persisted via config.blockOptions → bl_block_options store on save.
 */
import { createOptionsPanel as createSharedOptionsPanel } from '../block-options/shared/options-items-panel.js';

/**
 * @param {object} initial — { items?: array }
 * @param {(next: { items: array }) => void} onChange
 */
export function createOptionsPanel(initial, onChange) {
  return createSharedOptionsPanel(initial, onChange, {
    allowCustoms: false,
    allowPresetRefs: true,
  });
}
