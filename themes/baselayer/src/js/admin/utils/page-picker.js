/**
 * Reusable admin page picker modal.
 *
 * Opens a searchable list of published pages (WP REST API) and returns the selection.
 *
 * @example
 * import { openPagePicker } from '../../admin/utils/page-picker.js';
 * openPagePicker({ selectedId: 12 }).then((page) => { ... });
 * // or window.baselayerOpenPagePicker({ ... })
 *
 * @param {object} options
 * @param {number} [options.selectedId=0]
 * @param {string} [options.title]
 * @param {string} [options.searchPlaceholder]
 * @param {string} [options.empty]
 * @param {string} [options.loading]
 * @param {string} [options.cancelLabel]
 * @param {string} [options.selectLabel]
 * @param {string} [options.restUrl] - Defaults to wpApiSettings.root + 'wp/v2/pages'
 * @param {string} [options.restNonce] - Defaults to wpApiSettings.nonce
 * @returns {Promise<{ id: number, title: string, url: string }|null>}
 */
export function openPagePicker(options = {}) {
  const opts = {
    selectedId: 0,
    title: 'Select a page',
    searchPlaceholder: 'Search pages…',
    empty: 'No pages found.',
    loading: 'Loading…',
    cancelLabel: 'Cancel',
    selectLabel: 'Select',
    restUrl: '',
    restNonce: '',
    ...options,
  };

  const api = window.wpApiSettings || {};
  const restUrl =
    opts.restUrl ||
    (api.root ? String(api.root).replace(/\/?$/, '/') + 'wp/v2/pages' : '');
  const restNonce = opts.restNonce || api.nonce || '';

  return new Promise((resolve) => {
    let settled = false;
    let selected = {
      id: Number(opts.selectedId) || 0,
      title: '',
      url: '',
    };
    let debounceTimer = 0;
    let abort = null;

    const finish = (value) => {
      if (settled) return;
      settled = true;
      cleanup();
      resolve(value);
    };

    const onKey = (evt) => {
      if (evt.key === 'Escape') {
        finish(null);
      }
    };

    const cleanup = () => {
      document.removeEventListener('keydown', onKey);
      if (abort) {
        abort.abort();
        abort = null;
      }
      if (debounceTimer) {
        window.clearTimeout(debounceTimer);
      }
      backdrop.remove();
    };

    const backdrop = document.createElement('div');
    backdrop.className = 'bl-page-picker';
    backdrop.setAttribute('role', 'dialog');
    backdrop.setAttribute('aria-modal', 'true');
    backdrop.setAttribute('aria-label', opts.title);

    const dialog = document.createElement('div');
    dialog.className = 'bl-page-picker__dialog';

    const header = document.createElement('div');
    header.className = 'bl-page-picker__header';
    const titleEl = document.createElement('h2');
    titleEl.className = 'bl-page-picker__title';
    titleEl.textContent = opts.title;
    header.appendChild(titleEl);

    const searchWrap = document.createElement('div');
    searchWrap.className = 'bl-page-picker__search-wrap';
    const search = document.createElement('input');
    search.type = 'search';
    search.className = 'bl-page-picker__search';
    search.placeholder = opts.searchPlaceholder;
    search.setAttribute('autocomplete', 'off');
    searchWrap.appendChild(search);

    const list = document.createElement('div');
    list.className = 'bl-page-picker__list';
    list.setAttribute('role', 'listbox');

    const status = document.createElement('p');
    status.className = 'bl-page-picker__status description';
    status.hidden = true;

    const body = document.createElement('div');
    body.className = 'bl-page-picker__body';
    body.append(searchWrap, status, list);

    const footer = document.createElement('div');
    footer.className = 'bl-page-picker__footer';
    const cancelBtn = document.createElement('button');
    cancelBtn.type = 'button';
    cancelBtn.className = 'button';
    cancelBtn.textContent = opts.cancelLabel;
    cancelBtn.addEventListener('click', () => finish(null));

    const selectBtn = document.createElement('button');
    selectBtn.type = 'button';
    selectBtn.className = 'button button-primary';
    selectBtn.textContent = opts.selectLabel;
    selectBtn.disabled = !selected.id;
    selectBtn.addEventListener('click', () => {
      if (selected.id) {
        finish({ ...selected });
      }
    });

    footer.append(cancelBtn, selectBtn);
    dialog.append(header, body, footer);
    backdrop.appendChild(dialog);

    backdrop.addEventListener('click', (evt) => {
      if (evt.target === backdrop) {
        finish(null);
      }
    });
    document.addEventListener('keydown', onKey);

    const setStatus = (text) => {
      status.textContent = text || '';
      status.hidden = !text;
    };

    const renderRows = (pages) => {
      list.replaceChildren();
      if (!pages.length) {
        setStatus(opts.empty);
        return;
      }
      setStatus('');
      pages.forEach((page) => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'bl-page-picker__item';
        btn.setAttribute('role', 'option');
        const active = Number(page.id) === selected.id;
        btn.classList.toggle('is-selected', active);
        btn.setAttribute('aria-selected', active ? 'true' : 'false');

        const title = document.createElement('span');
        title.className = 'bl-page-picker__item-title';
        title.textContent = page.title || `#${page.id}`;

        const meta = document.createElement('span');
        meta.className = 'bl-page-picker__item-meta';
        meta.textContent = page.url || '';

        btn.append(title, meta);
        btn.addEventListener('click', () => {
          selected = {
            id: Number(page.id) || 0,
            title: page.title || '',
            url: page.url || '',
          };
          list.querySelectorAll('.bl-page-picker__item').forEach((node) => {
            const on = Number(node.dataset.pageId) === selected.id;
            node.classList.toggle('is-selected', on);
            node.setAttribute('aria-selected', on ? 'true' : 'false');
          });
          selectBtn.disabled = !selected.id;
        });
        btn.dataset.pageId = String(page.id);
        list.appendChild(btn);
      });
    };

    const fetchPages = async (query = '') => {
      if (!restUrl) {
        setStatus(opts.empty);
        return;
      }
      if (abort) {
        abort.abort();
      }
      abort = new AbortController();
      setStatus(opts.loading);
      list.replaceChildren();

      const url = new URL(restUrl, window.location.origin);
      url.searchParams.set('status', 'publish');
      url.searchParams.set('per_page', '20');
      url.searchParams.set('orderby', 'title');
      url.searchParams.set('order', 'asc');
      url.searchParams.set('_fields', 'id,title,link');
      if (query) {
        url.searchParams.set('search', query);
      }

      try {
        const res = await fetch(url.toString(), {
          credentials: 'same-origin',
          signal: abort.signal,
          headers: restNonce
            ? {
                'X-WP-Nonce': restNonce,
              }
            : {},
        });
        if (!res.ok) {
          setStatus(opts.empty);
          return;
        }
        const data = await res.json();
        const pages = (Array.isArray(data) ? data : []).map((row) => ({
          id: Number(row.id) || 0,
          title: row.title && typeof row.title.rendered === 'string'
            ? row.title.rendered.replace(/<[^>]+>/g, '')
            : String(row.title || ''),
          url: typeof row.link === 'string' ? row.link : '',
        }));
        renderRows(pages);
      } catch (err) {
        if (err && err.name === 'AbortError') {
          return;
        }
        setStatus(opts.empty);
      }
    };

    search.addEventListener('input', () => {
      window.clearTimeout(debounceTimer);
      debounceTimer = window.setTimeout(() => {
        fetchPages(search.value.trim());
      }, 220);
    });

    document.body.appendChild(backdrop);
    search.focus();
    fetchPages('');
  });
}

window.baselayerOpenPagePicker = openPagePicker;
