/**
 * Page picker control for Blocks field value UIs (modal + PHP site settings).
 */
import { openPagePicker } from '../../../../../src/js/admin/utils/page-picker.js';

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

function pickerConfig() {
  const sources = [
    window.blBlocksFieldUi,
    window.blBlocksEditor,
    window.blBlocksPage,
    window.blBlocksAdmin,
  ];
  let restUrl = '';
  let restNonce = '';
  sources.forEach((src) => {
    if (!src) return;
    if (!restUrl && src.pagesRestUrl) restUrl = src.pagesRestUrl;
    if (!restNonce && src.restNonce) restNonce = src.restNonce;
  });
  return { restUrl, restNonce };
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
  const removeBtn = el('button', {
    type: 'button',
    className: 'button-link bl-blocks-fields__page-remove',
    text: '×',
    title: i18n('clearPage', 'Clear'),
    'aria-label': i18n('clearPage', 'Clear'),
  });
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
 * @param {Array<{id:number,title:string,url:string}>} pages
 * @param {boolean} multiple
 * @param {(id: number) => void} onRemove
 * @returns {HTMLElement}
 */
export function buildPagePreview(pages, multiple, onRemove) {
  const preview = el('div', {
    className:
      'bl-blocks-fields__page-preview' + (multiple ? ' is-multiple' : ' is-single'),
  });
  pages.forEach((page) => {
    preview.appendChild(buildPageCard(page, () => onRemove(page.id)));
  });
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
  /** @type {Array<{id:number,title:string,url:string}>} */
  let selected = normalizePageIds(current, multiple).map((id) => ({
    id,
    title: '',
    url: '',
  }));

  const summary = el('div', { className: 'bl-blocks-fields__page-picker-summary' });
  const pickBtn = el('button', {
    type: 'button',
    className: 'button bl-button',
    text: i18n('choosePage', 'Choose page'),
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
    dataset: { blBlocksPagePicker: '1' },
  });
  control.append(
    el('div', { className: 'bl-blocks-fields__page-picker-row' }, [summary, actions])
  );

  const syncUi = () => {
    summary.replaceChildren();
    if (selected.length === 0) {
      summary.appendChild(
        el('span', {
          className: 'description',
          text: multiple
            ? i18n('choosePagesHelp', 'Select one or more pages.')
            : i18n('choosePageHelp', 'Select a page.'),
        })
      );
    } else {
      summary.appendChild(
        buildPagePreview(selected, multiple, (id) => {
          selected = selected.filter((page) => page.id !== id);
          syncUi();
        })
      );
    }
    clearBtn.hidden = selected.length === 0;
    pickBtn.textContent =
      selected.length > 0
        ? multiple
          ? i18n('changePages', 'Change pages')
          : i18n('changePage', 'Change page')
        : multiple
          ? i18n('choosePages', 'Choose pages')
          : i18n('choosePage', 'Choose page');
  };

  const hydrateTitles = async () => {
    const missing = selected.filter((p) => !p.title);
    if (missing.length === 0) return;
    const { restUrl, restNonce } = pickerConfig();
    if (!restUrl) return;
    try {
      const include = missing.map((p) => p.id).join(',');
      const url =
        String(restUrl).replace(/\/?$/, '/') +
        '?include=' +
        encodeURIComponent(include) +
        '&per_page=' +
        missing.length +
        '&_fields=id,title,link';
      const res = await fetch(url, {
        headers: restNonce ? { 'X-WP-Nonce': restNonce } : {},
      });
      if (!res.ok) return;
      const rows = await res.json();
      if (!Array.isArray(rows)) return;
      const byId = new Map(
        rows.map((row) => [
          Number(row.id) || 0,
          {
            id: Number(row.id) || 0,
            title: (row.title && row.title.rendered) || '',
            url: row.link || '',
          },
        ])
      );
      selected = selected.map((page) => {
        const hit = byId.get(page.id);
        return hit ? { ...page, ...hit } : page;
      });
      syncUi();
    } catch (err) {
      /* ignore hydrate errors */
    }
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
    const result = await open({
      multi: multiple,
      selectedId: !multiple && selected[0] ? selected[0].id : 0,
      selectedIds: multiple ? selected.map((p) => p.id) : [],
      title: multiple
        ? i18n('pagePickerTitleMulti', 'Select pages')
        : i18n('pagePickerTitle', 'Select a page'),
      searchPlaceholder: i18n('pagePickerSearch', 'Search pages…'),
      empty: i18n('pagePickerEmpty', 'No pages found.'),
      loading: i18n('pagePickerLoading', 'Loading…'),
      cancelLabel: i18n('cancel', 'Cancel'),
      selectLabel: i18n('selectPage', 'Select'),
      restUrl,
      restNonce,
    });
    if (!result) return;
    if (multiple) {
      selected = (Array.isArray(result) ? result : [result]).map((page) => ({
        id: Number(page.id) || 0,
        title: page.title || '',
        url: page.url || '',
      })).filter((p) => p.id > 0);
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
      summary.replaceChildren();
      if (selected.length === 0) {
        summary.appendChild(
          el('span', {
            className: 'description',
            text: multiple
              ? i18n('choosePagesHelp', 'Select one or more pages.')
              : i18n('choosePageHelp', 'Select a page.'),
          })
        );
      } else {
        summary.appendChild(
          buildPagePreview(selected, multiple, (id) => {
            selected = selected.filter((page) => page.id !== id);
            syncUi();
          })
        );
      }
      clearBtn.hidden = selected.length === 0;
      pickBtn.textContent =
        selected.length > 0
          ? multiple
            ? i18n('changePages', 'Change pages')
            : i18n('changePage', 'Change page')
          : multiple
            ? i18n('choosePages', 'Choose pages')
            : i18n('choosePage', 'Choose page');
      writeInputs();
    };

    pickBtn.addEventListener('click', async () => {
      if (typeof openPagePicker !== 'function') {
        console.error('Page picker is unavailable.');
        return;
      }
      const { restUrl, restNonce } = pickerConfig();
      const result = await openPagePicker({
        multi: multiple,
        selectedId: !multiple && selected[0] ? selected[0].id : 0,
        selectedIds: multiple ? selected.map((p) => p.id) : [],
        title: multiple
          ? i18n('pagePickerTitleMulti', 'Select pages')
          : i18n('pagePickerTitle', 'Select a page'),
        searchPlaceholder: i18n('pagePickerSearch', 'Search pages…'),
        empty: i18n('pagePickerEmpty', 'No pages found.'),
        loading: i18n('pagePickerLoading', 'Loading…'),
        cancelLabel: i18n('cancel', 'Cancel'),
        selectLabel: i18n('selectPage', 'Select'),
        restUrl,
        restNonce,
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
