/**
 * Mount a palette + canvas builder with history and keyboard shortcuts.
 */
import { createEmitter } from './events.js';
import { createRegistry } from './registry.js';
import { createSelection } from './selection.js';
import { createHistory } from './history.js';
import { createPalette } from './palette.js';
import { createCanvas } from './canvas.js';
import { bindKeyboard } from './keyboard.js';
import { el, makeT } from './dom.js';

/**
 * @param {HTMLElement} rootEl
 * @param {object} options See plan / README for the options surface.
 */
export function mount(rootEl, options = {}) {
  if (!rootEl) {
    throw new Error('BlCanvasBuilder.mount requires a container element');
  }

  const t = makeT(options.t);
  const emitter = createEmitter();
  const registry = createRegistry();
  if (Array.isArray(options.types)) {
    registry.registerMany(options.types);
  }

  const selection = createSelection();
  const ns = options.ns || 'bl-builder';
  const groupName = options.groupName || (ns === 'bl-forms-builder' ? 'bl-forms-fields' : `${ns}-items`);

  /** @type {ReturnType<typeof createHistory>} */
  let history;

  const notifyChange = () => {
    const items = canvas.getItems();
    if (!history?.isApplying) {
      history?.commit();
    }
    options.onChange?.(items);
    emitter.emit('change', items);
  };

  const canvas = createCanvas({
    ns,
    groupName,
    items: options.items || options.fields || [],
    t,
    createItem: options.createItem,
    serializeItem: options.serializeItem,
    prepareItem: options.prepareItem,
    normalizeItems: options.normalizeItems,
    onItemMounted: options.onItemMounted,
    heading: options.heading,
    emptyText: options.emptyText,
    itemAttr: options.itemAttr,
    handleSelector: options.handleSelector,
    draggableSelector: options.draggableSelector,
    templateClass: options.templateClass || `${ns}__template`,
    onBeforeChange: () => {
      history?.recordBefore();
    },
    onChange: notifyChange,
  });

  history = createHistory({
    getSnapshot: () => canvas.getItems(),
    applySnapshot: (snapshot) => {
      canvas.replaceItems(Array.isArray(snapshot) ? snapshot : [], { recordHistory: false });
    },
  });

  const palette = createPalette({
    ...(options.palette || {}),
    sections: options.palette?.sections || options.sections || [],
    ns,
    groupName,
    t,
    typeLabel: options.typeLabel,
    renderIcon: options.renderIcon,
    icons: options.icons || options.palette?.icons,
    onAdd: (type) => {
      const card = canvas.addItem(type, true);
      emitter.emit('add', { type, card });
    },
  });

  const layout = el('div', { className: `${ns}__fields-layout` }, [palette, canvas.root]);

  if (options.replaceRoot !== false) {
    rootEl.replaceChildren();
  }
  // Host may already be inside a product shell (e.g. .bl-forms-builder). Only stamp
  // the block class when this mount owns the outer wrapper.
  if (options.addRootClass !== false) {
    rootEl.classList.add(ns);
  }
  if (options.rootClassName) {
    rootEl.classList.add(options.rootClassName);
  }
  rootEl.appendChild(layout);

  const unbindKeyboard = bindKeyboard({
    undo: () => {
      if (history.undo()) {
        emitter.emit('undo');
        options.onChange?.(canvas.getItems());
        return true;
      }
      return false;
    },
    redo: () => {
      if (history.redo()) {
        emitter.emit('redo');
        options.onChange?.(canvas.getItems());
        return true;
      }
      return false;
    },
    isEnabled: () => options.keyboard !== false && rootEl.isConnected,
  });

  const api = {
    root: rootEl,
    palette,
    canvas,
    registry,
    selection,
    history,
    on: emitter.on.bind(emitter),
    getItems: () => canvas.getItems(),
    getFields: () => canvas.getItems(),
    setItems: (items) => canvas.replaceItems(items),
    setFields: (items) => canvas.replaceItems(items),
    addItem: (data, open) => canvas.addItem(data, open),
    addField: (data, open) => canvas.addItem(data, open),
    destroy() {
      unbindKeyboard();
      emitter.clear();
      rootEl.replaceChildren();
    },
  };

  options.onReady?.(api);
  return api;
}
