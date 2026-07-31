/**
 * BaseLayer canvas builder — shared palette + DnD canvas kit.
 *
 * Consumers (Forms, later Blocks) pass createItem / serializeItem / palette sections.
 */
import { mount } from './mount.js';
import { createPalette } from './palette.js';
import { createCanvas } from './canvas.js';
import { createItemChrome } from './item-chrome.js';
import { createHistory } from './history.js';
import { createSelection } from './selection.js';
import { createRegistry } from './registry.js';
import { createEmitter } from './events.js';
import { serializeList } from './serialize.js';
import { bindKeyboard } from './keyboard.js';
import { createSortable, dragStart, dragEnd, Sortable } from './sortable.js';
import { el, uid, makeT } from './dom.js';

export {
  mount,
  createPalette,
  createCanvas,
  createItemChrome,
  createHistory,
  createSelection,
  createRegistry,
  createEmitter,
  serializeList,
  bindKeyboard,
  createSortable,
  dragStart,
  dragEnd,
  Sortable,
  el,
  uid,
  makeT,
};

const BlCanvasBuilder = {
  mount,
  createPalette,
  createCanvas,
  createItemChrome,
  createHistory,
  createSelection,
  createRegistry,
  createEmitter,
  serializeList,
  bindKeyboard,
  createSortable,
  dragStart,
  dragEnd,
  Sortable,
  el,
  uid,
  makeT,
};

export default BlCanvasBuilder;

if (typeof window !== 'undefined') {
  window.BlCanvasBuilder = BlCanvasBuilder;
}
