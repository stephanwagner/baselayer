/**
 * Layers (isolatable kit for Events, Blocks, later Forms peel):
 * 1. dom + sortable + controls + icons
 * 2. createListRow — unified expandable header chrome
 * 3. createFieldRow + type registry — schema fields (event-meta / fields / block)
 */
import { registerAllTypes } from './types';
import { createShell } from './shell';
import { createListRow } from './list-row';
import { createFieldRow, serializeFieldRow } from './field-row';
import { createSortable } from './sortable';
import { createSwitch, createSegmented, openModal } from './controls';
import { el, empty, slugify, uid, formRow } from './dom';
import { iconEl } from './icons';
import { getType, listTypesForMode, registerType, listTypeIds } from './registry';

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
 * @param {HTMLElement} mountEl
 * @param {object} [options]
 * @returns {{ getSchema: Function, setSchema: Function, destroy: Function, addField: Function }}
 */
export function mount(mountEl, options = {}) {
  if (!mountEl) {
    throw new Error('BlFieldBuilder.mount requires a container element');
  }
  ensureTypes();
  return createShell(mountEl, options);
}

export {
  createListRow,
  createFieldRow,
  serializeFieldRow,
  createSortable,
  createSwitch,
  createSegmented,
  openModal,
  el,
  empty,
  slugify,
  uid,
  formRow,
  iconEl,
  getType,
  listTypesForMode,
  registerType,
  listTypeIds,
  ensureTypes,
};

const BlFieldBuilder = {
  mount,
  createListRow,
  createFieldRow,
  serializeFieldRow,
  createSortable,
  createSwitch,
  createSegmented,
  openModal,
  el,
  empty,
  slugify,
  uid,
  formRow,
  iconEl,
  getType,
  listTypesForMode,
  registerType,
  listTypeIds,
  ensureTypes,
};

export default BlFieldBuilder;

if (typeof window !== 'undefined') {
  window.BlFieldBuilder = BlFieldBuilder;
}
