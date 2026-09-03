/**
 * Page picker control for Blocks field value UIs (modal + PHP site settings).
 */
import { openPagePicker } from '../../../../../src/js/admin/utils/page-picker.js';
import { createSortable } from '../../../../../src/js/admin/canvas-builder/sortable.js';

function el(tag, props = {}, children = []) {
  const node = document.createElement(tag);
  Object.entries(props).forEach(([key, value]) => {
    if (value == null || value === false) return;
    if (key === 'className') node.className = value;
    else if (key === 'text') node.textContent = value;
    else if (key === 'dataset') Object.assign(node.dataset, value);
    else if (key.startsWith('on') && typeof value === 'function') {
      node.addEventListener(key.slice(2).toLowerCase(), value);
    } else if (key === 'checked') node.checked = Boolean(value);
    else if (key === 'value') node.value = value === true ? '' : String(value);
    else node.setAttribute(key, value === true ? '' : String(value));
  });
  (Array.isArray(children) ? children : [children]).forEach((child) => {
    if (child == null || child === false) return;
    node.appendChild(typeof child === 'string' ? document.createTextNode(child) : child);
  });
  return node;
}

function i18n(key, fallback) {
  const dict =
    (window.blBlocksFieldUi && window.blBlocksFieldUi.i18n) ||
    (window.blBlocksEditor && window.blBlocksEditor.i18n) ||
    (window.blBlocksPage && window.blBlocksPage.i18n) ||
    (window.blBlocksAdmin && window.blBlocksAdmin.i18n) ||
    {};
  return dict[key] || fallback || key;
}

function formatNoun(template, noun) {
  return String(template || '').replace(/%s/g, String(noun || ''));
}

/**
 * @param {{text_singular?: string, text_plural?: string, textSingular?: string, textPlural?: string}|null|undefined} source
 * @returns {{singular: string, plural: string}}
 */
function pickerNouns(source) {
  const singular =
    String((source && (source.text_singular || source.textSingular)) || '').trim() ||
    i18n('pageNounSingular', 'Page');
  const plural =
    String((source && (source.text_plural || source.textPlural)) || '').trim() ||
    i18n('pageNounPlural', 'Pages');
  return { singular, plural };
}

/**
 * Localized picker copy with field-noun interpolation.
 *
 * @param {{text_singular?: string, text_plural?: string}|null|undefined} source
 * @param {boolean} multiple
 */
function pickerCopy(source, multiple) {
  const { singular, plural } = pickerNouns(source);
  const noun = multiple ? plural : singular;
  return {
    singular,
    plural,
    noun,
    choose: formatNoun(i18n('chooseNoun', 'Choose %s'), noun),
    change: formatNoun(i18n('changeNoun', 'Change %s'), noun),
    title: formatNoun(
      multiple ? i18n('selectNoun', 'Select %s') : i18n('selectANoun', 'Select a %s'),
      noun
    ),
    search: i18n('searchNouns', 'Search…') || i18n('pagePickerSearch', 'Search…'),
    empty: formatNoun(i18n('noNounsFound', 'No %s found.'), plural),
    help: formatNoun(
      multiple
        ? i18n('selectNounsHelp', 'Select one or more %s.')
        : i18n('selectANoun', 'Select a %s'),
      multiple ? plural : singular
    ),
  };
}

/**
 * @param {HTMLElement} wrap
 */
function wrapNounSource(wrap) {
  return {
    text_singular: wrap.getAttribute('data-text-singular') || '',
    text_plural: wrap.getAttribute('data-text-plural') || '',
  };
}

function pickerConfig() {
  const sources = [
    window.blBlocksFieldUi,
    window.blBlocksEditor,
    window.blBlocksPage,
    window.blBlocksAdmin,
  ];
  let restUrl = '';
  let restNonce = '';
  /** @type {Array<{value: string, label: string, restBase: string}>} */
  let pickerPostTypes = [];
  sources.forEach((src) => {
    if (!src) return;
    if (!restUrl && src.pagesRestUrl) restUrl = src.pagesRestUrl;
    if (!restNonce && src.restNonce) restNonce = src.restNonce;
    if (
      !pickerPostTypes.length &&
      Array.isArray(src.pickerPostTypes) &&
      src.pickerPostTypes.length
    ) {
      pickerPostTypes = src.pickerPostTypes;
    }
  });
  return { restUrl, restNonce, pickerPostTypes };
}

/**
 * Resolve allowed post types for a page field against the localized catalog.
 *
 * @param {object} field
 * @returns {Array<{value: string, label: string, restBase: string}>}
 */
function resolveFieldPostTypes(field) {
  const { pickerPostTypes } = pickerConfig();
  const catalog =
    pickerPostTypes.length > 0
      ? pickerPostTypes
      : [{ value: 'page', label: 'Pages', restBase: 'pages' }];
  const allowedKeys = catalog.map((row) => String(row.value || ''));
  let selected = Array.isArray(field && field.post_types)
    ? field.post_types.map((slug) => String(slug || '')).filter((slug) => allowedKeys.includes(slug))
    : [];
  if (selected.length === 0) {
    selected = [...allowedKeys];
  }
  return catalog.filter((row) => selected.includes(String(row.value || '')));
}

/**
 * Parse post_types from a data attribute (JSON array of slugs).
 *
 * @param {HTMLElement} wrap
 * @returns {Array<{value: string, label: string, restBase: string}>}
 */
function resolveWrapPostTypes(wrap) {
  const { pickerPostTypes } = pickerConfig();
  const catalog =
    pickerPostTypes.length > 0
      ? pickerPostTypes
      : [{ value: 'page', label: 'Pages', restBase: 'pages' }];
  let selected = [];
  try {
    const raw = wrap.getAttribute('data-post-types');
    const parsed = raw ? JSON.parse(raw) : null;
    if (Array.isArray(parsed)) {
      selected = parsed.map((slug) => String(slug || ''));
    }
  } catch (err) {
    selected = [];
  }
  const allowedKeys = catalog.map((row) => String(row.value || ''));
  selected = selected.filter((slug) => allowedKeys.includes(slug));
  if (selected.length === 0) {
    selected = [...allowedKeys];
  }
  return catalog.filter((row) => selected.includes(String(row.value || '')));
}

/**
 * Hydrate titles for selected IDs across one or more REST endpoints.
 *
 * @param {Array<{id:number,title:string,url:string}>} selected
 * @param {Array<{value: string, label: string, restBase: string}>} postTypes
 * @param {string} restNonce
 * @returns {Promise<Array<{id:number,title:string,url:string}>>}
 */
async function hydrateSelectedPages(selected, postTypes, restNonce) {
  const missing = selected.filter((p) => !p.title);
  if (missing.length === 0) return selected;
  const api = window.wpApiSettings || {};
  const restRoot = api.root ? String(api.root).replace(/\/?$/, '/') : '';
  const include = missing.map((p) => p.id).join(',');
  const urls = postTypes
    .map((pt) => {
      const base = String(pt.restBase || pt.value || '').replace(/^\/+|\/+$/g, '');
      if (!base || !restRoot) return '';
      return (
        restRoot +
        'wp/v2/' +
        base +
        '/?include=' +
        encodeURIComponent(include) +
        '&per_page=' +
        missing.length +
        '&_fields=id,title,link'
      );
    })
    .filter(Boolean);
  if (urls.length === 0) return selected;

  try {
    const batches = await Promise.all(
      urls.map(async (url) => {
        const res = await fetch(url, {
          headers: restNonce ? { 'X-WP-Nonce': restNonce } : {},
        });
        if (!res.ok) return [];
        const rows = await res.json();
        return Array.isArray(rows) ? rows : [];
      })
    );
    const byId = new Map();
    batches.flat().forEach((row) => {
      const id = Number(row.id) || 0;
      if (id <= 0 || byId.has(id)) return;
      byId.set(id, {
        id,
        title:
          row.title && typeof row.title.rendered === 'string'
            ? row.title.rendered.replace(/<[^>]+>/g, '')
            : String((row.title && row.title.rendered) || row.title || ''),
        url: typeof row.link === 'string' ? row.link : '',
      });
    });
    return selected.map((page) => {
      const hit = byId.get(page.id);
      return hit ? { ...page, ...hit } : page;
    });
  } catch (err) {
    return selected;
  }
}

/**
 * Path (+ query/hash) for a page URL, without the host.
 *
 * @param {string} url
 * @returns {string}
 */
export function pageUrlPath(url) {
  const raw = String(url || '').trim();
  if (!raw) return '';
  try {
    const base =
      typeof window !== 'undefined' && window.location && window.location.origin
        ? window.location.origin
        : 'https://example.com';
    const parsed = new URL(raw, base);
    return (parsed.pathname || '/') + (parsed.search || '') + (parsed.hash || '');
  } catch (err) {
    const stripped = raw.replace(/^[a-z][a-z0-9+.-]*:\/\/[^/?#]+/i, '');
    if (!stripped) return '/';
    return stripped.startsWith('/') ? stripped : '/' + stripped.replace(/^\/*/, '');
  }
}

/**
 * @param {{id:number,title:string,url:string}} page
 * @param {() => void} onRemove
 * @returns {HTMLElement}
 */
export function buildPageCard(page, onRemove) {
  const title =
    page.title || i18n('selectedPage', 'Selected page') + ' #' + page.id;
  const path = pageUrlPath(page.url);
  const body = el('div', { className: 'bl-blocks-fields__page-card-body' }, [
    el('span', {
      className: 'bl-blocks-fields__page-card-title',
      text: title,
      title,
    }),
  ]);
  if (path) {
    body.appendChild(
      el('span', {
        className: 'description bl-blocks-fields__page-card-url',
        text: path,
        title: page.url || path,
      })
    );
  }
  const removeBtn = el(
    'button',
    {
      type: 'button',
      className: 'button-link bl-blocks-fields__card-remove',
      title: i18n('clearPage', 'Clear'),
      'aria-label': i18n('clearPage', 'Clear'),
    },
    [el('span', { className: 'bl-icon -icon-close', 'aria-hidden': 'true' })]
  );
  removeBtn.addEventListener('click', (evt) => {
    evt.preventDefault();
    evt.stopPropagation();
    onRemove();
  });
  return el(
    'div',
    {
      className: 'bl-blocks-fields__page-card',
      dataset: { pageId: String(page.id) },
    },
    [body, removeBtn]
  );
}

/**
 * Enable drag-reorder for multi-select page lists.
 *
 * @param {HTMLElement} preview
 * @param {{ getSelected: () => Array<{id:number}>, setSelected: (next: Array) => void, onChange?: () => void }} api
 * @returns {import('sortablejs').default|null}
 */
function bindPageSortable(preview, api) {
  if (!preview) return null;
  preview.classList.add('is-sortable');
  return createSortable(preview, {
    animation: 150,
    draggable: '.bl-blocks-fields__page-card',
    filter: '.bl-blocks-fields__card-remove',
    preventOnFilter: true,
    ghostClass: 'is-dragging-ghost',
    chosenClass: 'is-dragging-chosen',
    onEnd: () => {
      const ids = Array.from(
        preview.querySelectorAll('.bl-blocks-fields__page-card[data-page-id]')
      )
        .map((node) => Number(node.getAttribute('data-page-id')) || 0)
        .filter((id) => id > 0);
      const byId = new Map(api.getSelected().map((item) => [item.id, item]));
      const next = [];
      ids.forEach((id) => {
        const item = byId.get(id);
        if (item) next.push(item);
      });
      api.setSelected(next);
      if (typeof api.onChange === 'function') {
        api.onChange();
      }
    },
  });
}

/**
 * Render page cards into a preview host (keeps the host for Sortable).
 *
 * @param {HTMLElement} preview
 * @param {Array<{id:number,title:string,url:string}>} pages
 * @param {(id: number) => void} onRemove
 */
function renderPageCards(preview, pages, onRemove) {
  preview.replaceChildren();
  pages.forEach((page) => {
    preview.appendChild(buildPageCard(page, () => onRemove(page.id)));
  });
}

/**
 * @param {Array<{id:number,title:string,url:string}>} pages
 * @param {boolean} multiple
 * @param {(id: number) => void} onRemove
 * @returns {HTMLElement}
 */
export function buildPagePreview(pages, multiple, onRemove) {
  const preview = el('div', {
    className:
      'bl-blocks-fields__page-preview' +
      (multiple ? ' is-multiple is-sortable' : ' is-single'),
  });
  renderPageCards(preview, pages, onRemove);
  return preview;
}

/**
 * Normalize stored value into positive page IDs.
 *
 * @param {unknown} current
 * @param {boolean} multiple
 * @returns {number[]}
 */
export function normalizePageIds(current, multiple) {
  if (multiple) {
    const list = Array.isArray(current) ? current : current != null && current !== '' ? [current] : [];
    return list.map((id) => Number(id) || 0).filter((id) => id > 0);
  }
  const one = Number(Array.isArray(current) ? current[0] : current) || 0;
  return one > 0 ? [one] : [];
}

/**
 * Build an in-memory page picker control for field-form.js.
 *
 * @param {object} field
 * @param {unknown} current
 * @returns {HTMLElement & { getPageValue: () => number|number[]|string }}
 */
export function createPagePickerControl(field, current) {
  const multiple = !!field.multiple;
  const copy = pickerCopy(field, multiple);
  /** @type {Array<{id:number,title:string,url:string}>} */
  let selected = normalizePageIds(current, multiple).map((id) => ({
    id,
    title: '',
    url: '',
  }));

  const empty = el('span', {
    className: 'description bl-blocks-fields__description bl-blocks-fields__page-empty',
    text: copy.help,
  });
  const preview = el('div', {
    className:
      'bl-blocks-fields__page-preview' +
      (multiple ? ' is-multiple is-sortable' : ' is-single'),
  });
  const summary = el('div', { className: 'bl-blocks-fields__page-picker-summary' }, [
    empty,
    preview,
  ]);
  const pickBtn = el('button', {
    type: 'button',
    className: 'button bl-button',
    text: copy.choose,
  });
  const clearBtn = el('button', {
    type: 'button',
    className: 'button-link',
    text: i18n('clearPage', 'Clear'),
  });
  const actions = el('div', { className: 'bl-blocks-fields__page-picker-actions' }, [
    pickBtn,
    clearBtn,
  ]);
  const control = el('div', {
    className: 'bl-blocks-fields__page-picker',
    dataset: {
      blBlocksPagePicker: '1',
      textSingular: field.text_singular || '',
      textPlural: field.text_plural || '',
    },
  });
  control.append(
    el('div', { className: 'bl-blocks-fields__page-picker-row' }, [summary, actions])
  );

  const dispatchChange = () => {
    control.dispatchEvent(new Event('change', { bubbles: true }));
  };

  const syncUi = () => {
    const has = selected.length > 0;
    empty.hidden = has;
    preview.hidden = !has;
    if (has) {
      renderPageCards(preview, selected, (id) => {
        selected = selected.filter((page) => page.id !== id);
        syncUi();
        dispatchChange();
      });
    } else {
      preview.replaceChildren();
    }
    clearBtn.hidden = !has;
    pickBtn.textContent = has ? copy.change : copy.choose;
  };

  if (multiple) {
    bindPageSortable(preview, {
      getSelected: () => selected,
      setSelected: (next) => {
        selected = next;
      },
      onChange: dispatchChange,
    });
  }

  const hydrateTitles = async () => {
    const { restNonce } = pickerConfig();
    const postTypes = resolveFieldPostTypes(field);
    selected = await hydrateSelectedPages(selected, postTypes, restNonce);
    syncUi();
  };

  pickBtn.addEventListener('click', async () => {
    let open;
    try {
      open = openPagePicker;
    } catch (err) {
      console.error('Page picker failed to load.', err);
      return;
    }
    if (typeof open !== 'function') {
      console.error('Page picker is unavailable.');
      return;
    }
    const { restUrl, restNonce } = pickerConfig();
    const postTypes = resolveFieldPostTypes(field);
    const result = await open({
      multi: multiple,
      selectedId: !multiple && selected[0] ? selected[0].id : 0,
      selectedIds: multiple ? selected.map((p) => p.id) : [],
      title: copy.title,
      searchPlaceholder: copy.search,
      empty: copy.empty,
      moreNote: i18n(
        'pagePickerMore',
        'More results available. Refine your search to narrow them down.'
      ),
      cancelLabel: i18n('cancel', 'Cancel'),
      selectLabel: i18n('selectPage', 'Select'),
      allLabel: i18n('pagePickerAll', 'All'),
      restUrl,
      restNonce,
      postTypes,
    });
    if (!result) return;
    if (multiple) {
      selected = (Array.isArray(result) ? result : [result])
        .map((page) => ({
          id: Number(page.id) || 0,
          title: page.title || '',
          url: page.url || '',
        }))
        .filter((p) => p.id > 0);
    } else {
      selected = [
        {
          id: Number(result.id) || 0,
          title: result.title || '',
          url: result.url || '',
        },
      ].filter((p) => p.id > 0);
    }
    syncUi();
    dispatchChange();
  });

  clearBtn.addEventListener('click', () => {
    selected = [];
    syncUi();
    dispatchChange();
  });

  control.getPageValue = () => {
    const ids = selected.map((p) => p.id).filter((id) => id > 0);
    if (multiple) return ids;
    return ids[0] || '';
  };

  syncUi();
  hydrateTitles();
  return control;
}

/**
 * Bind PHP-rendered page picker markup (Website / classic admin screens).
 *
 * @param {ParentNode} [root=document]
 */
export function bindPagePickers(root = document) {
  root.querySelectorAll('[data-bl-blocks-page-picker]').forEach((wrap) => {
    if (wrap.dataset.blPagePickerBound === '1') return;
    wrap.dataset.blPagePickerBound = '1';

    const multiple = wrap.dataset.multiple === '1';
    const copy = pickerCopy(wrapNounSource(wrap), multiple);
    const inputName = wrap.dataset.inputName || '';
    const summary = wrap.querySelector('[data-bl-page-summary]');
    const pickBtn = wrap.querySelector('[data-bl-page-choose]');
    const clearBtn = wrap.querySelector('[data-bl-page-clear]');
    const inputsHost = wrap.querySelector('[data-bl-page-inputs]');
    if (!summary || !pickBtn || !clearBtn || !inputsHost || !inputName) return;

    /** @type {Array<{id:number,title:string,url:string}>} */
    let selected = Array.from(inputsHost.querySelectorAll('input[type="hidden"]'))
      .map((input) => ({
        id: Number(input.value) || 0,
        title: input.dataset.title || '',
        url: input.dataset.url || '',
      }))
      .filter((p) => p.id > 0);

    const empty = el('span', {
      className: 'description bl-blocks-fields__description bl-blocks-fields__page-empty',
      text: copy.help,
    });
    const preview = el('div', {
      className:
        'bl-blocks-fields__page-preview' +
        (multiple ? ' is-multiple is-sortable' : ' is-single'),
    });
    summary.replaceChildren(empty, preview);

    const writeInputs = () => {
      inputsHost.replaceChildren();
      if (selected.length === 0) {
        // Keep an empty marker so unchecked multi fields still post.
        if (multiple) {
          inputsHost.appendChild(
            el('input', { type: 'hidden', name: inputName + '[]', value: '' })
          );
        } else {
          inputsHost.appendChild(el('input', { type: 'hidden', name: inputName, value: '' }));
        }
        return;
      }
      selected.forEach((page) => {
        const name = multiple ? inputName + '[]' : inputName;
        const input = el('input', {
          type: 'hidden',
          name,
          value: String(page.id),
        });
        if (page.title) input.dataset.title = page.title;
        if (page.url) input.dataset.url = page.url;
        inputsHost.appendChild(input);
      });
    };

    const syncUi = () => {
      const has = selected.length > 0;
      empty.hidden = has;
      preview.hidden = !has;
      if (has) {
        renderPageCards(preview, selected, (id) => {
          selected = selected.filter((page) => page.id !== id);
          syncUi();
        });
      } else {
        preview.replaceChildren();
      }
      clearBtn.hidden = !has;
      pickBtn.textContent = has ? copy.change : copy.choose;
      writeInputs();
    };

    if (multiple) {
      bindPageSortable(preview, {
        getSelected: () => selected,
        setSelected: (next) => {
          selected = next;
        },
        onChange: writeInputs,
      });
    }

    pickBtn.addEventListener('click', async () => {
      if (typeof openPagePicker !== 'function') {
        console.error('Page picker is unavailable.');
        return;
      }
      const { restUrl, restNonce } = pickerConfig();
      const postTypes = resolveWrapPostTypes(wrap);
      const result = await openPagePicker({
        multi: multiple,
        selectedId: !multiple && selected[0] ? selected[0].id : 0,
        selectedIds: multiple ? selected.map((p) => p.id) : [],
        title: copy.title,
        searchPlaceholder: copy.search,
        empty: copy.empty,
        moreNote: i18n(
          'pagePickerMore',
          'More results available. Refine your search to narrow them down.'
        ),
        cancelLabel: i18n('cancel', 'Cancel'),
        selectLabel: i18n('selectPage', 'Select'),
        allLabel: i18n('pagePickerAll', 'All'),
        restUrl,
        restNonce,
        postTypes,
      });
      if (!result) return;
      if (multiple) {
        selected = (Array.isArray(result) ? result : [result])
          .map((page) => ({
            id: Number(page.id) || 0,
            title: page.title || '',
            url: page.url || '',
          }))
          .filter((p) => p.id > 0);
      } else {
        selected = [
          {
            id: Number(result.id) || 0,
            title: result.title || '',
            url: result.url || '',
          },
        ].filter((p) => p.id > 0);
      }
      syncUi();
    });

    clearBtn.addEventListener('click', () => {
      selected = [];
      syncUi();
    });

    syncUi();
  });
}
