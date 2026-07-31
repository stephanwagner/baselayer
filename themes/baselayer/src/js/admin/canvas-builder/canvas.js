/**
 * Canvas: drop list + reorderable items.
 */
import { el, makeT } from './dom.js';
import { createSortable, dragStart, dragEnd } from './sortable.js';

/**
 * @param {object} options
 * @param {unknown[]} [options.items]
 * @param {() => void} options.onChange
 * @param {() => void} [options.onBeforeChange]
 * @param {(data: unknown, open?: boolean) => HTMLElement} options.createItem
 * @param {(el: HTMLElement) => unknown} options.serializeItem
 * @param {(typeOrData: unknown) => unknown} [options.prepareItem]
 * @param {(items: unknown[]) => unknown[]} [options.normalizeItems]
 * @param {(card: HTMLElement, list: HTMLElement) => void} [options.onItemMounted]
 * @param {(key: string, fallback?: string) => string} [options.t]
 * @param {string} [options.ns='bl-builder']
 * @param {string} [options.groupName='bl-builder-items']
 * @param {string} [options.heading]
 * @param {string} [options.emptyText]
 * @param {string} [options.itemAttr='data-bl-builder-item']
 * @param {string} [options.handleSelector]
 * @param {string} [options.draggableSelector]
 * @param {string} [options.templateClass]
 */
export function createCanvas(options = {}) {
  const ns = options.ns || 'bl-builder';
  const t = makeT(options.t);
  const groupName = options.groupName || 'bl-builder-items';
  const itemAttr = options.itemAttr || 'data-bl-builder-item';
  const handleSelector = options.handleSelector || `.${ns}__handle`;
  const templateClass = options.templateClass || `${ns}__template`;
  const draggableSelector =
    options.draggableSelector || `.${ns}__item, .${ns}__field, .${templateClass}`;
  const createItem = options.createItem;
  const serializeItem = options.serializeItem;
  const prepareItem =
    options.prepareItem ||
    ((typeOrData) => (typeof typeOrData === 'string' ? { type: typeOrData } : { ...typeOrData }));
  const normalizeItems = options.normalizeItems || ((items) => items || []);
  const onChange = options.onChange || (() => {});
  const onBeforeChange = options.onBeforeChange || (() => {});
  const onItemMounted = options.onItemMounted || (() => {});

  if (typeof createItem !== 'function' || typeof serializeItem !== 'function') {
    throw new Error('BlCanvasBuilder.createCanvas requires createItem and serializeItem');
  }

  const wrap = el('section', { className: `${ns}__canvas` });
  wrap.appendChild(
    el('h3', {
      className: `${ns}__col-title`,
      text: options.heading || t('canvasHeading', 'Canvas'),
    })
  );

  const list = el('div', {
    className: `${ns}__list`,
    dataset: { blBuilderCanvas: '1' },
  });
  if (ns === 'bl-forms-builder') {
    list.dataset.blFormsCanvas = '1';
  }

  const empty = el('div', {
    className: `description ${ns}__empty`,
    text: options.emptyText || t('empty', 'Drag an item here.'),
  });

  const itemMatches = (node) =>
    node?.matches?.(
      `[${itemAttr}], [data-bl-forms-field], .${ns}__item, .${ns}__field`
    );

  const syncEmpty = () => {
    empty.hidden = Array.from(list.children).some(itemMatches);
  };

  const mountCard = (card) => {
    list.appendChild(card);
    onItemMounted(card, list);
    syncEmpty();
    return card;
  };

  const addItem = (typeOrData, open = true) => {
    onBeforeChange();
    const data = prepareItem(typeOrData);
    const card = createItem(data, open);
    mountCard(card);
    onChange();
    return card;
  };

  normalizeItems(options.items || []).forEach((item) => {
    mountCard(createItem(item, false));
  });
  syncEmpty();

  wrap.append(list, empty);

  createSortable(list, {
    group: {
      name: groupName,
      put() {
        return true;
      },
    },
    handle: handleSelector,
    animation: 150,
    draggable: draggableSelector,
    onStart() {
      onBeforeChange();
      dragStart();
    },
    onEnd: dragEnd,
    onAdd(evt) {
      const item = evt.item;
      const type = item.dataset.itemType || item.dataset.fieldType || 'text';
      let card = item;
      if (item.classList.contains(templateClass)) {
        card = createItem(prepareItem(type), true);
        item.replaceWith(card);
      }
      onItemMounted(card, list);
      syncEmpty();
      onChange();
    },
    onUpdate() {
      onChange();
    },
    onSort() {
      onChange();
    },
  });

  const replaceItems = (nextItems = [], { recordHistory = true } = {}) => {
    if (recordHistory) {
      onBeforeChange();
    }
    list.replaceChildren();
    normalizeItems(nextItems || []).forEach((item) => {
      mountCard(createItem(item, false));
    });
    syncEmpty();
    onChange();
  };

  const getItems = () =>
    Array.from(list.children)
      .filter(itemMatches)
      .map((node) => serializeItem(node));

  return {
    root: wrap,
    list,
    addItem,
    addField: addItem,
    replaceItems,
    replaceFields: replaceItems,
    syncEmpty,
    getItems,
    getFields: getItems,
  };
}
