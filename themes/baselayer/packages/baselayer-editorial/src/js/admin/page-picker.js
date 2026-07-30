/**
 * Page picker with optional multi-select (Editorial package copy).
 *
 * @param {object} options
 * @param {boolean} [options.multi=false]
 * @param {number} [options.selectedId=0]
 * @param {number[]} [options.selectedIds=[]]
 * @returns {Promise<{id:number,title:string,url:string}|Array<{id:number,title:string,url:string}>|null>}
 */
export function openPagePicker(options = {}) {
  const opts = {
    multi: false,
    selectedId: 0,
    selectedIds: [],
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
    /** @type {Map<number, {id:number,title:string,url:string}>} */
    const selectedMap = new Map();

    if (opts.multi) {
      const ids = Array.isArray(opts.selectedIds) ? opts.selectedIds : [];
      ids.forEach((id) => {
        const n = Number(id) || 0;
        if (n > 0) {
          selectedMap.set(n, { id: n, title: '', url: '' });
        }
      });
    } else {
      const id = Number(opts.selectedId) || 0;
      if (id > 0) {
        selectedMap.set(id, { id, title: '', url: '' });
      }
    }

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
      document.body.classList.remove('bl-page-picker-open');
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
    if (opts.multi) {
      list.setAttribute('aria-multiselectable', 'true');
    }

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
    cancelBtn.className = 'button bl-button-small';
    cancelBtn.textContent = opts.cancelLabel;
    cancelBtn.addEventListener('click', () => finish(null));

    const selectBtn = document.createElement('button');
    selectBtn.type = 'button';
    selectBtn.className = 'button button-primary bl-button-small';
    selectBtn.textContent = opts.selectLabel;

    const syncSelectEnabled = () => {
      selectBtn.disabled = selectedMap.size === 0;
    };
    syncSelectEnabled();

    selectBtn.addEventListener('click', () => {
      if (selectedMap.size === 0) return;
      if (opts.multi) {
        finish(Array.from(selectedMap.values()));
        return;
      }
      finish({ ...selectedMap.values().next().value });
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
        const id = Number(page.id) || 0;
        const active = selectedMap.has(id);
        btn.classList.toggle('is-selected', active);
        btn.setAttribute('aria-selected', active ? 'true' : 'false');
        btn.dataset.pageId = String(id);

        const title = document.createElement('span');
        title.className = 'bl-page-picker__item-title';
        title.textContent = page.title || `#${id}`;

        const meta = document.createElement('span');
        meta.className = 'bl-page-picker__item-meta';
        meta.textContent = page.url || '';

        btn.append(title, meta);
        btn.addEventListener('click', () => {
          const item = {
            id,
            title: page.title || '',
            url: page.url || '',
          };
          if (opts.multi) {
            if (selectedMap.has(id)) {
              selectedMap.delete(id);
            } else {
              selectedMap.set(id, item);
            }
          } else {
            selectedMap.clear();
            selectedMap.set(id, item);
          }
          list.querySelectorAll('.bl-page-picker__item').forEach((node) => {
            const on = selectedMap.has(Number(node.dataset.pageId) || 0);
            node.classList.toggle('is-selected', on);
            node.setAttribute('aria-selected', on ? 'true' : 'false');
          });
          syncSelectEnabled();
        });
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
          title:
            row.title && typeof row.title.rendered === 'string'
              ? row.title.rendered.replace(/<[^>]+>/g, '')
              : String(row.title || ''),
          url: typeof row.link === 'string' ? row.link : '',
        }));
        // Fill titles for already-selected IDs when they appear in results.
        pages.forEach((page) => {
          if (selectedMap.has(page.id)) {
            selectedMap.set(page.id, page);
          }
        });
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

    document.body.classList.add('bl-page-picker-open');
    document.body.appendChild(backdrop);
    search.focus();
    fetchPages('');
  });
}

window.baselayerOpenPagePicker = openPagePicker;
