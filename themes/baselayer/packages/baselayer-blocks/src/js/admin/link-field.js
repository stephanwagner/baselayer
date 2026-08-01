/**
 * Link field control for Blocks value UIs (modal + PHP site settings).
 */
import { openPagePicker } from '../../../../../src/js/admin/utils/page-picker.js';

const LINK_TYPES = ['page', 'url', 'email', 'phone'];

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

function allowedLinkTypes(field) {
  const raw = Array.isArray(field.link_types) ? field.link_types : LINK_TYPES;
  const list = raw.map(String).filter((t) => LINK_TYPES.includes(t));
  return list.length ? list : [...LINK_TYPES];
}

function normalizeLinkValue(current, allowed) {
  const empty = {
    type: allowed[0] || 'url',
    url: '',
    title: '',
    page_id: 0,
    target: '',
  };
  if (!current || typeof current !== 'object' || Array.isArray(current)) {
    return empty;
  }
  let type = String(current.type || '');
  if (!allowed.includes(type)) {
    type = allowed[0] || 'url';
  }
  return {
    type,
    url: current.url != null ? String(current.url) : '',
    title: current.title != null ? String(current.title) : '',
    page_id: Number(current.page_id) || 0,
    target: current.target === '_blank' ? '_blank' : '',
  };
}

function displayDestination(state) {
  if (state.type === 'email') {
    return String(state.url || '').replace(/^mailto:/i, '');
  }
  if (state.type === 'phone') {
    return String(state.url || '').replace(/^tel:/i, '');
  }
  return String(state.url || '');
}

/**
 * Soft href normalize for link → URL type.
 * Keeps /…, #…, ?…, //…, and any existing scheme; bare hosts get https://.
 */
function normalizeLinkHref(raw) {
  const v = String(raw || '').trim();
  if (!v) return '';
  if (/^([/#?]|\/\/|[a-z][a-z0-9+.\-]*:)/i.test(v)) {
    return v;
  }
  return 'https://' + v;
}

function destinationFieldLabel(type) {
  if (type === 'page') return i18n('linkDestPage', 'Page');
  if (type === 'email') return i18n('linkDestEmail', 'Email address');
  if (type === 'phone') return i18n('linkDestPhone', 'Phone number');
  return i18n('linkDestUrl', 'URL');
}

/**
 * @param {object} field
 * @param {unknown} current
 * @returns {HTMLElement & { getLinkValue: () => object }}
 */
export function createLinkControl(field, current) {
  const allowed = allowedLinkTypes(field);
  const allowTarget = field.allow_target !== false;
  let state = normalizeLinkValue(current, allowed);
  /** @type {{id:number,title:string,url:string}|null} */
  let pageMeta =
    state.type === 'page' && state.page_id > 0
      ? { id: state.page_id, title: state.title || '', url: state.url || '' }
      : null;

  const root = el('div', {
    className: 'bl-blocks-fields__link',
    dataset: { blBlocksLinkField: '1' },
  });

  const typeRow = el('div', { className: 'bl-blocks-fields__link-types' });
  const destLabel = el('label', { text: destinationFieldLabel(state.type) });
  const destWrap = el('div', { className: 'bl-blocks-fields__link-destination' });
  const destRow = el('div', { className: 'bl-blocks-fields__link-dest' }, [destLabel, destWrap]);
  const titleInput = el('input', {
    type: 'text',
    className: 'widefat',
    value: state.title,
  });
  const titleRow = el('p', { className: 'bl-blocks-fields__link-title' }, [
    el('label', { text: i18n('linkText', 'Link text') }),
    titleInput,
  ]);
  const targetInput = el('input', { type: 'checkbox' });
  const targetRow = el('label', { className: 'bl-blocks-fields__toggle bl-blocks-fields__link-target' }, [
    targetInput,
    document.createTextNode(' ' + i18n('linkOpenNewTab', 'Open in new tab')),
  ]);

  const syncTargetVisibility = () => {
    const show = allowTarget && (state.type === 'page' || state.type === 'url');
    targetRow.hidden = !show;
    if (!show) {
      targetInput.checked = false;
      state.target = '';
    }
  };

  const renderDestination = () => {
    destLabel.textContent = destinationFieldLabel(state.type);
    destWrap.replaceChildren();
    if (state.type === 'page') {
      const summary = el('div', { className: 'bl-blocks-fields__page-picker-summary' });
      const pickBtn = el('button', {
        type: 'button',
        className: 'button bl-button-small',
        text: pageMeta
          ? i18n('changePage', 'Change page')
          : i18n('choosePage', 'Choose page'),
      });
      const clearBtn = el('button', {
        type: 'button',
        className: 'button-link',
        text: i18n('clearPage', 'Clear'),
        hidden: !pageMeta,
      });
      if (pageMeta) {
        summary.appendChild(
          el('span', {
            className: 'bl-blocks-fields__page-picker-value',
            text: pageMeta.title || i18n('selectedPage', 'Selected page') + ' #' + pageMeta.id,
          })
        );
        if (pageMeta.url) {
          summary.appendChild(
            el('span', {
              className: 'description bl-blocks-fields__page-picker-url',
              text: pageMeta.url,
              title: pageMeta.url,
            })
          );
        }
      } else {
        summary.appendChild(
          el('span', {
            className: 'description',
            text: i18n('choosePageHelp', 'Select a page.'),
          })
        );
      }
      pickBtn.addEventListener('click', async () => {
        if (typeof openPagePicker !== 'function') {
          console.error('Page picker is unavailable.');
          return;
        }
        const { restUrl, restNonce } = pickerConfig();
        const page = await openPagePicker({
          selectedId: pageMeta ? pageMeta.id : 0,
          title: i18n('pagePickerTitle', 'Select a page'),
          searchPlaceholder: i18n('pagePickerSearch', 'Search pages…'),
          empty: i18n('pagePickerEmpty', 'No pages found.'),
          loading: i18n('pagePickerLoading', 'Loading…'),
          cancelLabel: i18n('cancel', 'Cancel'),
          selectLabel: i18n('selectPage', 'Select'),
          restUrl,
          restNonce,
        });
        if (!page) return;
        pageMeta = {
          id: Number(page.id) || 0,
          title: page.title || '',
          url: page.url || '',
        };
        state.page_id = pageMeta.id;
        state.url = pageMeta.url;
        if (!String(titleInput.value || '').trim() && pageMeta.title) {
          titleInput.value = pageMeta.title;
          state.title = pageMeta.title;
        }
        renderDestination();
      });
      clearBtn.addEventListener('click', () => {
        pageMeta = null;
        state.page_id = 0;
        state.url = '';
        renderDestination();
      });
      destWrap.appendChild(
        el('div', { className: 'bl-blocks-fields__page-picker-row' }, [
          summary,
          el('div', { className: 'bl-blocks-fields__page-picker-actions' }, [pickBtn, clearBtn]),
        ])
      );
      return;
    }

    let inputType = 'text';
    let value = displayDestination(state);
    if (state.type === 'email') {
      inputType = 'email';
    } else if (state.type === 'phone') {
      inputType = 'tel';
    } else if (state.type === 'url') {
      value = normalizeLinkHref(value);
      state.url = value;
    }
    const input = el('input', {
      type: inputType,
      className: 'widefat',
      value,
    });
    input.addEventListener('input', () => {
      state.url = input.value;
    });
    if (state.type === 'url') {
      input.addEventListener('blur', () => {
        const next = normalizeLinkHref(input.value);
        if (next !== input.value) {
          input.value = next;
        }
        state.url = next;
      });
    }
    destWrap.appendChild(input);
  };

  if (allowed.length > 1) {
    const labels = {
      page: i18n('linkTypePage', 'Page'),
      url: i18n('linkTypeUrl', 'URL'),
      email: i18n('linkTypeEmail', 'Email'),
      phone: i18n('linkTypePhone', 'Phone'),
    };
    allowed.forEach((type) => {
      const btn = el('button', {
        type: 'button',
        className:
          'button bl-button-small bl-blocks-fields__link-type' +
          (state.type === type ? ' is-active' : ''),
        text: labels[type] || type,
        dataset: { linkType: type },
      });
      btn.addEventListener('click', () => {
        if (state.type === type) return;
        state.type = type;
        state.url = '';
        state.page_id = 0;
        state.target = '';
        pageMeta = null;
        targetInput.checked = false;
        typeRow.querySelectorAll('[data-link-type]').forEach((node) => {
          node.classList.toggle('is-active', node.dataset.linkType === type);
        });
        syncTargetVisibility();
        renderDestination();
      });
      typeRow.appendChild(btn);
    });
    root.appendChild(
      el('div', { className: 'bl-blocks-fields__link-type-block' }, [
        el('label', { text: i18n('linkTypeLabel', 'Link type') }),
        typeRow,
      ])
    );
  }

  titleInput.addEventListener('input', () => {
    state.title = titleInput.value;
  });
  targetInput.checked = state.target === '_blank';
  targetInput.addEventListener('change', () => {
    state.target = targetInput.checked ? '_blank' : '';
  });

  root.append(destRow, titleRow, targetRow);
  syncTargetVisibility();
  renderDestination();

  // Hydrate page title/url if only id is known.
  if (state.type === 'page' && state.page_id > 0 && (!pageMeta || !pageMeta.title)) {
    const { restUrl, restNonce } = pickerConfig();
    if (restUrl) {
      fetch(String(restUrl).replace(/\/?$/, '/') + state.page_id + '?_fields=id,title,link', {
        headers: restNonce ? { 'X-WP-Nonce': restNonce } : {},
      })
        .then((res) => (res.ok ? res.json() : null))
        .then((row) => {
          if (!row || Number(row.id) !== state.page_id) return;
          pageMeta = {
            id: state.page_id,
            title: (row.title && row.title.rendered) || '',
            url: row.link || '',
          };
          state.url = pageMeta.url;
          if (!String(titleInput.value || '').trim() && pageMeta.title) {
            titleInput.value = pageMeta.title;
            state.title = pageMeta.title;
          }
          renderDestination();
        })
        .catch(() => {});
    }
  }

  root.getLinkValue = () => {
    const destInput = destWrap.querySelector('input:not([type="hidden"])');
    const title = String(titleInput.value || '').trim();
    const out = {
      type: state.type,
      url: '',
      title,
    };

    if (state.type === 'page') {
      out.page_id = state.page_id > 0 ? state.page_id : 0;
      out.url = (pageMeta && pageMeta.url) || state.url || '';
    } else if (state.type === 'email') {
      const email = String(destInput ? destInput.value : state.url || '')
        .replace(/^mailto:/i, '')
        .trim();
      out.url = email ? 'mailto:' + email : '';
    } else if (state.type === 'phone') {
      const phone = String(destInput ? destInput.value : state.url || '')
        .replace(/^tel:/i, '')
        .trim();
      out.url = phone ? 'tel:' + phone : '';
    } else {
      const href = normalizeLinkHref(destInput ? destInput.value : state.url || '');
      out.url = href;
      if (destInput && destInput.value !== href) {
        destInput.value = href;
      }
      state.url = href;
    }

    if (allowTarget && (state.type === 'page' || state.type === 'url') && targetInput.checked) {
      out.target = '_blank';
    }
    return out;
  };

  return root;
}

/**
 * Bind PHP-rendered link fields (Website / classic admin).
 *
 * @param {ParentNode} [root=document]
 */
export function bindLinkFields(root = document) {
  root.querySelectorAll('[data-bl-blocks-link-field]').forEach((wrap) => {
    if (wrap.dataset.blLinkBound === '1') return;
    if (wrap.querySelector('[data-bl-link-interactive]')) return;
    wrap.dataset.blLinkBound = '1';

    const inputName = wrap.dataset.inputName || '';
    if (!inputName) return;

    let allowed = String(wrap.dataset.linkTypes || '')
      .split(',')
      .map((s) => s.trim())
      .filter((t) => LINK_TYPES.includes(t));
    if (!allowed.length) allowed = [...LINK_TYPES];
    const allowTarget = wrap.dataset.allowTarget === '1';

    const readHidden = () => {
      const get = (key) => {
        const input = wrap.querySelector(`[data-bl-link-key="${key}"]`);
        return input ? input.value : '';
      };
      return normalizeLinkValue(
        {
          type: get('type'),
          url: get('url'),
          title: get('title'),
          page_id: get('page_id'),
          target: get('target'),
        },
        allowed
      );
    };

    const field = { link_types: allowed, allow_target: allowTarget };
    const control = createLinkControl(field, readHidden());
    control.dataset.blLinkInteractive = '1';

    const host = wrap.querySelector('[data-bl-link-ui]');
    const inputsHost = wrap.querySelector('[data-bl-link-inputs]');
    if (host) {
      host.replaceChildren(control);
    } else {
      wrap.appendChild(control);
    }

    const writeInputs = () => {
      if (!inputsHost) return;
      const value = control.getLinkValue();
      inputsHost.replaceChildren();
      const keys = ['type', 'url', 'title', 'page_id'];
      keys.forEach((key) => {
        const val = value[key] != null ? String(value[key]) : '';
        const input = el('input', {
          type: 'hidden',
          name: `${inputName}[${key}]`,
          value: val,
          dataset: { blLinkKey: key },
        });
        inputsHost.appendChild(input);
      });
      if (value.target === '_blank') {
        inputsHost.appendChild(
          el('input', {
            type: 'hidden',
            name: `${inputName}[target]`,
            value: '_blank',
            dataset: { blLinkKey: 'target' },
          })
        );
      }
    };

    // Keep hidden inputs in sync before form submit.
    const form = wrap.closest('form');
    if (form) {
      form.addEventListener('submit', writeInputs);
    }
    wrap.addEventListener('change', writeInputs);
    wrap.addEventListener('click', () => setTimeout(writeInputs, 0));
    writeInputs();
  });
}
