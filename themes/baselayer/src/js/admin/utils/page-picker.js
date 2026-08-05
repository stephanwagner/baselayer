/**
 * Reusable admin page picker modal.
 *
 * Opens a searchable list of published posts (WP REST API) and returns the selection.
 *
 * @example
 * import { openPagePicker } from '../../admin/utils/page-picker.js';
 * openPagePicker({ selectedId: 12 }).then((page) => { ... });
 * openPagePicker({ multi: true, selectedIds: [1, 2] }).then((pages) => { ... });
 * openPagePicker({ postTypes: [{ value: 'page', label: 'Pages', restBase: 'pages' }] });
 * // or window.baselayerOpenPagePicker({ ... })
 *
 * @param {object} options
 * @param {boolean} [options.multi=false]
 * @param {number} [options.selectedId=0]
 * @param {number[]} [options.selectedIds=[]]
 * @param {string} [options.title]
 * @param {string} [options.searchPlaceholder]
 * @param {string} [options.empty]
 * @param {string} [options.moreNote]
 * @param {string} [options.cancelLabel]
 * @param {string} [options.selectLabel]
 * @param {string} [options.allLabel]
 * @param {string} [options.restUrl] - Legacy single-type URL (wp/v2/pages). Ignored when postTypes is set.
 * @param {string} [options.restNonce] - Defaults to wpApiSettings.nonce
 * @param {Array<{value: string, label: string, restBase: string}>} [options.postTypes]
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
    moreNote:
      'More results available. Refine your search to narrow them down.',
    cancelLabel: 'Cancel',
    selectLabel: 'Select',
    allLabel: 'All',
    restUrl: '',
    restNonce: '',
    postTypes: null,
    ...options,
  };

  const api = window.wpApiSettings || {};
  const restNonce = opts.restNonce || api.nonce || '';
  const restRoot = api.root
    ? String(api.root).replace(/\/?$/, '/')
    : '';

  /** @type {Array<{value: string, label: string, restBase: string, restUrl: string}>} */
  let postTypes = normalizePostTypes(opts.postTypes, opts.restUrl, restRoot);
  if (postTypes.length === 0) {
    postTypes = [
      {
        value: 'page',
        label: 'Pages',
        restBase: 'pages',
        restUrl: restRoot ? restRoot + 'wp/v2/pages' : String(opts.restUrl || ''),
      },
    ];
  }

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
    let fetchGen = 0;
    /** @type {string} */
    let activeTab = postTypes.length > 1 ? 'all' : postTypes[0].value;

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

    /** @type {HTMLElement|null} */
    let tabsEl = null;
    if (postTypes.length > 1) {
      tabsEl = document.createElement('div');
      tabsEl.className = 'bl-page-picker__tabs';
      tabsEl.setAttribute('role', 'group');
      tabsEl.setAttribute('aria-label', opts.allLabel);

      const tabDefs = [
        { value: 'all', label: opts.allLabel },
        ...postTypes.map((pt) => ({ value: pt.value, label: pt.label })),
      ];
      tabDefs.forEach((tab) => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'bl-page-picker__tab';
        btn.dataset.value = tab.value;
        btn.textContent = tab.label;
        btn.setAttribute('aria-pressed', tab.value === activeTab ? 'true' : 'false');
        if (tab.value === activeTab) {
          btn.classList.add('is-active');
        }
        btn.addEventListener('click', () => {
          if (activeTab === tab.value) return;
          activeTab = tab.value;
          tabsEl.querySelectorAll('.bl-page-picker__tab').forEach((node) => {
            const on = node.dataset.value === activeTab;
            node.classList.toggle('is-active', on);
            node.setAttribute('aria-pressed', on ? 'true' : 'false');
          });
          fetchPages(search.value.trim());
        });
        tabsEl.appendChild(btn);
      });
    }

    const list = document.createElement('div');
    list.className = 'bl-page-picker__list';

    const status = document.createElement('p');
    status.className = 'bl-page-picker__status description';
    status.hidden = true;

    const results = document.createElement('div');
    results.className = 'bl-page-picker__results';
    results.setAttribute('role', 'listbox');
    if (opts.multi) {
      results.setAttribute('aria-multiselectable', 'true');
    }

    list.append(status, results);

    const body = document.createElement('div');
    body.className = 'bl-page-picker__body';
    if (tabsEl) {
      body.append(searchWrap, tabsEl, list);
    } else {
      body.append(searchWrap, list);
    }

    const footer = document.createElement('div');
    footer.className = 'bl-page-picker__footer';

    const spinner = document.createElement('span');
    spinner.className = 'bl-page-picker__spinner';
    spinner.hidden = true;
    spinner.setAttribute('aria-hidden', 'true');

    const footerActions = document.createElement('div');
    footerActions.className = 'bl-page-picker__footer-actions';

    const cancelBtn = document.createElement('button');
    cancelBtn.type = 'button';
    cancelBtn.className = 'button bl-button';
    cancelBtn.textContent = opts.cancelLabel;
    cancelBtn.addEventListener('click', () => finish(null));

    const selectBtn = document.createElement('button');
    selectBtn.type = 'button';
    selectBtn.className = 'button button-primary bl-button';
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

    footerActions.append(cancelBtn, selectBtn);
    footer.append(spinner, footerActions);
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

    const setLoading = (loading) => {
      list.classList.toggle('is-loading', loading);
      list.setAttribute('aria-busy', loading ? 'true' : 'false');
      spinner.hidden = !loading;
      spinner.setAttribute('aria-hidden', loading ? 'false' : 'true');
    };

    /** @type {Array<{id:number,title:string,url:string,modified?:string}>} */
    let lastFetchedPages = [];
    let lastHasMore = false;

    /**
     * Selected items first, then fetched results (excluding already-selected IDs).
     *
     * @param {Array<{id:number,title:string,url:string,modified?:string}>} fetched
     * @returns {Array<{id:number,title:string,url:string,modified?:string}>}
     */
    const buildDisplayPages = (fetched) => {
      const selected = Array.from(selectedMap.values()).filter((page) => page.id > 0);
      const selectedIds = new Set(selected.map((page) => page.id));
      const rest = (Array.isArray(fetched) ? fetched : []).filter(
        (page) => page.id > 0 && !selectedIds.has(page.id)
      );
      return [...selected, ...rest];
    };

    const renderRows = (pages, hasMore = false) => {
      results.replaceChildren();
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
          syncSelectEnabled();
          renderRows(buildDisplayPages(lastFetchedPages), lastHasMore);
        });
        results.appendChild(btn);
      });
      if (hasMore && opts.moreNote) {
        const note = document.createElement('p');
        note.className = 'bl-page-picker__more-note description';
        note.textContent = opts.moreNote;
        results.appendChild(note);
      }
    };

    /**
     * @param {string} restUrl
     * @param {string} query
     * @param {AbortSignal} signal
     * @param {number} perPage
     * @returns {Promise<{items: Array<{id:number,title:string,url:string,modified:string}>, total: number}>}
     */
    const fetchType = async (restUrl, query, signal, perPage) => {
      if (!restUrl) return { items: [], total: 0 };
      const url = new URL(restUrl, window.location.origin);
      url.searchParams.set('status', 'publish');
      url.searchParams.set('per_page', String(perPage));
      url.searchParams.set('orderby', 'modified');
      url.searchParams.set('order', 'desc');
      url.searchParams.set('_fields', 'id,title,link,modified');
      if (query) {
        url.searchParams.set('search', query);
      }
      const res = await fetch(url.toString(), {
        credentials: 'same-origin',
        signal,
        headers: restNonce
          ? {
              'X-WP-Nonce': restNonce,
            }
          : {},
      });
      if (!res.ok) {
        return { items: [], total: 0 };
      }
      const totalHeader = parseInt(res.headers.get('X-WP-Total') || '', 10);
      const data = await res.json();
      const items = (Array.isArray(data) ? data : []).map((row) => ({
        id: Number(row.id) || 0,
        title:
          row.title && typeof row.title.rendered === 'string'
            ? row.title.rendered.replace(/<[^>]+>/g, '')
            : String(row.title || ''),
        url: typeof row.link === 'string' ? row.link : '',
        modified: typeof row.modified === 'string' ? row.modified : '',
      }));
      const total = Number.isFinite(totalHeader) ? totalHeader : items.length;
      return { items, total };
    };

    const fetchPages = async (query = '') => {
      const typesToFetch =
        activeTab === 'all'
          ? postTypes
          : postTypes.filter((pt) => pt.value === activeTab);
      if (typesToFetch.length === 0 || typesToFetch.every((pt) => !pt.restUrl)) {
        setLoading(false);
        lastFetchedPages = [];
        lastHasMore = false;
        renderRows(buildDisplayPages([]), false);
        return;
      }
      if (abort) {
        abort.abort();
      }
      abort = new AbortController();
      const gen = ++fetchGen;
      setLoading(true);
      setStatus('');

      const perPage = 50;

      try {
        const batches = await Promise.all(
          typesToFetch.map((pt) =>
            fetchType(pt.restUrl, query, abort.signal, perPage)
          )
        );
        if (gen !== fetchGen) return;
        let hasMore = batches.some(
          (batch) => batch.total > batch.items.length
        );
        let pages = batches
          .flatMap((batch) => batch.items)
          .filter((page) => page.id > 0);
        if (activeTab === 'all' && typesToFetch.length > 1) {
          const seen = new Set();
          pages = pages.filter((page) => {
            if (seen.has(page.id)) return false;
            seen.add(page.id);
            return true;
          });
          pages.sort((a, b) =>
            String(b.modified || '').localeCompare(String(a.modified || ''))
          );
          if (pages.length > perPage) {
            hasMore = true;
            pages = pages.slice(0, perPage);
          }
        }
        pages.forEach((page) => {
          if (selectedMap.has(page.id)) {
            selectedMap.set(page.id, {
              id: page.id,
              title: page.title,
              url: page.url,
            });
          }
        });
        lastFetchedPages = pages;
        lastHasMore = hasMore;
        renderRows(buildDisplayPages(pages), hasMore);
      } catch (err) {
        if (err && err.name === 'AbortError') {
          return;
        }
        if (gen !== fetchGen) return;
        lastFetchedPages = [];
        lastHasMore = false;
        renderRows(buildDisplayPages([]), false);
      } finally {
        if (gen === fetchGen) {
          setLoading(false);
        }
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

/**
 * @param {unknown} raw
 * @param {string} legacyRestUrl
 * @param {string} restRoot
 * @returns {Array<{value: string, label: string, restBase: string, restUrl: string}>}
 */
function normalizePostTypes(raw, legacyRestUrl, restRoot) {
  if (!Array.isArray(raw) || raw.length === 0) {
    if (legacyRestUrl) {
      return [
        {
          value: 'page',
          label: 'Pages',
          restBase: 'pages',
          restUrl: String(legacyRestUrl),
        },
      ];
    }
    return [];
  }
  return raw
    .map((row) => {
      const value = String((row && row.value) || '').trim();
      const restBase = String((row && (row.restBase || row.value)) || '').trim();
      const label = String((row && row.label) || value || '').trim() || value;
      if (!value || !restBase) return null;
      const restUrl = restRoot
        ? restRoot + 'wp/v2/' + restBase.replace(/^\/+|\/+$/g, '')
        : '';
      return { value, label, restBase, restUrl };
    })
    .filter(Boolean);
}

window.baselayerOpenPagePicker = openPagePicker;
