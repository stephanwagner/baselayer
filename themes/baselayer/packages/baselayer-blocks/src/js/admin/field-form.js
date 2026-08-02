/**
 * Shared admin field form renderer + modal shell for Blocks runtimes.
 */
import { createPagePickerControl, bindPagePickers } from './page-field.js';
import { createLinkControl, bindLinkFields } from './link-field.js';
import { createMediaPickerControl, bindMediaPickers } from './media-field.js';

function el(tag, props = {}, children = []) {
  const node = document.createElement(tag);
  Object.entries(props).forEach(([key, value]) => {
    if (value == null || value === false) return;
    if (key === 'className') node.className = value;
    else if (key === 'text') node.textContent = value;
    else if (key === 'html') node.innerHTML = value;
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
    {};
  return dict[key] || fallback || key;
}

function isLayout(type) {
  return type === 'column' || type === 'section' || type === 'tab' || type === 'group';
}

function isStatic(type) {
  return (
    type === 'divider' ||
    type === 'spacer' ||
    type === 'heading' ||
    type === 'text_block' ||
    type === 'html' ||
    type === 'honeypot' ||
    type === 'captcha'
  );
}

/**
 * Strip any scheme and force https://. Loose check — any host-like value is fine.
 */
function normalizeHttpsUrl(raw) {
  let v = String(raw || '').replace(
    /^[\s\u00A0\u2000-\u200B\uFEFF]+|[\s\u00A0\u2000-\u200B\uFEFF]+$/g,
    ''
  );
  if (!v) return '';
  v = v.replace(/^[a-z][a-z0-9+.\-]*:/i, '').replace(/^\/\//, '');
  v = v.replace(/^[\s\u00A0\u2000-\u200B\uFEFF]+|[\s\u00A0\u2000-\u200B\uFEFF]+$/g, '');
  if (!v || v.startsWith('/') || v.startsWith('#') || v.startsWith('?')) {
    return '';
  }
  if (/\s/.test(v)) {
    return '';
  }
  const host = v.split(/[/?#]/)[0].split(':')[0];
  if (!host || !/[a-z0-9]/i.test(host)) {
    return '';
  }
  return 'https://' + v;
}

function bindHttpsUrlInput(input) {
  if (!(input instanceof HTMLInputElement) || input.dataset.blHttpsUrlBound === '1') {
    return;
  }
  input.dataset.blHttpsUrlBound = '1';
  input.addEventListener('blur', () => {
    const next = normalizeHttpsUrl(input.value);
    if (next !== '') {
      input.value = next;
    }
  });
}

/**
 * Bind PHP-rendered URL fields (Website / classic admin).
 *
 * @param {ParentNode} [root=document]
 */
export function bindHttpsUrlFields(root = document) {
  root.querySelectorAll('input[data-bl-blocks-https-url]').forEach((input) => {
    bindHttpsUrlInput(input);
  });
}

function collectLeafValue(field, control, type) {
  const name = field.name;
  if (!name) return null;
  if (type === 'page' && control && typeof control.getPageValue === 'function') {
    return control.getPageValue();
  }
  if ((type === 'image' || type === 'file') && control && typeof control.getMediaValue === 'function') {
    return control.getMediaValue();
  }
  if (type === 'link' && control && typeof control.getLinkValue === 'function') {
    return control.getLinkValue();
  }
  if (type === 'icon' && control && typeof control.getIconValue === 'function') {
    return control.getIconValue();
  }
  if (type === 'select') {
    if (control.multiple) {
      return Array.from(control.selectedOptions).map((o) => o.value);
    }
    return control.value;
  }
  if (type === 'checkboxes') {
    return Array.from(control.querySelectorAll('input[type="checkbox"]:checked')).map(
      (input) => input.value
    );
  }
  if (type === 'radio' || type === 'button_group') {
    const checked = control.querySelector('input[type="radio"]:checked');
    return checked ? checked.value : '';
  }
  if (type === 'toggle' || type === 'terms') {
    const input = control.tagName === 'INPUT' ? control : control.querySelector('input');
    return input && input.checked ? '1' : '';
  }
  if (type === 'url' && control && 'value' in control) {
    const next = normalizeHttpsUrl(control.value);
    if (next !== '' && next !== control.value) {
      control.value = next;
    }
    return next !== '' ? next : String(control.value || '').trim();
  }
  if (control && 'value' in control) {
    return control.value;
  }
  return '';
}

function createLeafControl(field, values, controls) {
  const type = field.type || 'text';
  const name = field.name || '';
  if (!name) return null;

  const current =
    values[name] !== undefined && values[name] !== null
      ? values[name]
      : field.default_value != null
        ? field.default_value
        : '';

  const row = el('div', {
    className: 'bl-blocks-fields__row',
    dataset: { fieldName: name },
  });
  const id = 'bl-blocks-ui-' + name.replace(/[^a-z0-9_-]/gi, '_') + '-' + Math.random().toString(36).slice(2, 7);

  if (!field.hide_label && type !== 'toggle' && type !== 'terms') {
    const label = el('label', { className: 'bl-blocks-fields__label', text: field.label || name });
    label.setAttribute('for', id);
    if (field.required) {
      label.appendChild(document.createTextNode(' '));
      label.appendChild(el('span', { className: 'required', text: '*' }));
    }
    row.appendChild(label);
  }

  let control = null;
  const options = Array.isArray(field.options) ? field.options : [];

  if (type === 'textarea') {
    control = el('textarea', {
      className: 'widefat',
      id,
      rows: field.rows || 4,
      value: current == null ? '' : String(current),
    });
    if (field.placeholder) control.placeholder = field.placeholder;
  } else if (type === 'select') {
    const multiple = !!field.multiple;
    control = el('select', { className: 'widefat', id });
    if (multiple) control.multiple = true;
    if (!multiple) {
      control.appendChild(el('option', { value: '', text: '—' }));
    }
    const selected = multiple
      ? (Array.isArray(current) ? current : []).map(String)
      : [String(current == null ? '' : current)];
    options.forEach((opt) => {
      const ov = String(opt.value ?? '');
      const option = el('option', { value: ov, text: opt.label || ov });
      if (selected.includes(ov)) option.selected = true;
      control.appendChild(option);
    });
  } else if (type === 'radio' || type === 'button_group') {
    control = el('div', { className: 'bl-blocks-fields__choices' });
    options.forEach((opt, i) => {
      const ov = String(opt.value ?? '');
      const oid = id + '-' + i;
      const input = el('input', {
        type: 'radio',
        name: id,
        id: oid,
        value: ov,
        checked: String(current) === ov,
      });
      control.appendChild(
        el('label', { className: 'bl-blocks-fields__choice' }, [
          input,
          document.createTextNode(' ' + (opt.label || ov)),
        ])
      );
    });
  } else if (type === 'checkboxes') {
    control = el('div', { className: 'bl-blocks-fields__choices' });
    const list = Array.isArray(current) ? current.map(String) : [];
    options.forEach((opt, i) => {
      const ov = String(opt.value ?? '');
      const oid = id + '-' + i;
      const input = el('input', {
        type: 'checkbox',
        id: oid,
        value: ov,
        checked: list.includes(ov),
      });
      control.appendChild(
        el('label', { className: 'bl-blocks-fields__choice' }, [
          input,
          document.createTextNode(' ' + (opt.label || ov)),
        ])
      );
    });
  } else if (type === 'toggle' || type === 'terms') {
    const input = el('input', {
      type: 'checkbox',
      id,
      checked: !!current && current !== '0' && current !== '',
    });
    control = el('label', { className: 'bl-blocks-fields__toggle' }, [
      input,
      document.createTextNode(' ' + (field.label || name)),
    ]);
  } else if (type === 'hidden') {
    control = el('input', {
      type: 'hidden',
      id,
      value: current == null ? '' : String(current),
    });
  } else if (type === 'page') {
    control = createPagePickerControl(field, current);
    if (control) control.id = id;
  } else if (type === 'image' || type === 'file') {
    control = createMediaPickerControl(field, current);
    if (control) control.id = id;
  } else if (type === 'link') {
    control = createLinkControl(field, current);
    if (control) control.id = id;
  } else if (type === 'icon') {
    const hidden = el('input', {
      type: 'hidden',
      id,
      value: current == null ? '' : String(current),
    });
    const preview = el('span', {
      className: 'bl-blocks-fields__icon-preview',
      'aria-hidden': 'true',
    });
    const label = el('span', {
      className: 'description',
      text: current ? String(current) : '—',
    });
    const chooseBtn = el('button', {
      type: 'button',
      className: 'button',
      text: 'Choose icon',
    });
    const clearBtn = el('button', {
      type: 'button',
      className: 'button-link',
      text: 'Clear',
    });
    const syncIconPreview = (slug) => {
      hidden.value = slug || '';
      label.textContent = slug || '—';
      preview.replaceChildren();
      if (slug) {
        preview.appendChild(el('span', { className: 'bl-icon -icon-' + slug, 'aria-hidden': 'true' }));
      }
    };
    syncIconPreview(current == null ? '' : String(current));
    chooseBtn.addEventListener('click', async () => {
      try {
        const { openIconPicker } = await import(
          '../../../../../src/js/editor/icons/icon-picker-service.js'
        );
        openIconPicker({
          currentValue: hidden.value || '',
          returnFocus: chooseBtn,
          onSelect: (iconName) => syncIconPreview(iconName || ''),
        });
      } catch (err) {
        // Icon picker unavailable — leave hidden input editable via clear only.
      }
    });
    clearBtn.addEventListener('click', () => syncIconPreview(''));
    control = el('div', { className: 'bl-blocks-fields__icon' }, [
      preview,
      label,
      el('div', { className: 'bl-blocks-fields__icon-actions' }, [chooseBtn, clearBtn]),
      hidden,
    ]);
    control.getIconValue = () => hidden.value || '';
  } else {
    let inputType = 'text';
    if (type === 'email' || type === 'number' || type === 'date' || type === 'time') {
      inputType = type;
    } else if (type === 'phone') {
      inputType = 'tel';
    } else if (type === 'datetime') {
      inputType = 'datetime-local';
    }
    control = el('input', {
      className: 'widefat',
      type: inputType,
      id,
      value: current == null ? '' : String(current),
    });
    if (field.placeholder) control.placeholder = field.placeholder;
    if (type === 'url') {
      if (!control.placeholder) control.placeholder = 'https://';
      bindHttpsUrlInput(control);
    }
  }

  if (control) {
    row.appendChild(control);
    controls.push({ field, control, type });
  }
  if (field.description) {
    row.appendChild(el('p', { className: 'description', text: field.description }));
  }
  return row;
}

/**
 * Build an editable field form from a definition schema.
 *
 * @param {array} fields
 * @param {object} values
 * @param {{ layout?: 'default'|'compact' }} [options]
 * @returns {{ root: HTMLElement, getValues: () => object }}
 */
export function createFieldForm(fields, values = {}, options = {}) {
  const compact = options && options.layout === 'compact';
  const rootAttrs = {
    className: 'bl-blocks-fields' + (compact ? ' bl-blocks-fields--compact' : ''),
    dataset: { blBlocksFields: '' },
  };
  if (compact) {
    rootAttrs.dataset.layout = 'compact';
  }
  const root = el('div', rootAttrs);
  /** @type {Array<{ kind: 'leaf'|'repeater', field: object, control?: HTMLElement, type?: string, getRows?: Function }>} */
  const entries = [];

  const appendLayoutWrap = (field, type, parent, valueMap) => {
    const design = compact
      ? 'standard'
      : ['standard', 'outline', 'card'].includes(field.design)
        ? field.design
        : 'standard';
    const layoutClass = [
      'bl-blocks-fields__layout',
      'bl-blocks-fields__layout--' + type,
      'bl-blocks-fields__layout--' + design,
    ];
    if (field.css_class) {
      layoutClass.push(String(field.css_class).trim());
    }
    const wrap = el('div', { className: layoutClass.filter(Boolean).join(' ') });
    const showTitle =
      type !== 'section' ||
      (field.show_title !== false && field.show_title !== 0 && field.show_title !== '0');
    if (type === 'section' && showTitle && field.label) {
      wrap.appendChild(el('h3', { className: 'bl-blocks-fields__section-title', text: field.label }));
    }
    parent.appendChild(wrap);
    walk(field.children || [], wrap, valueMap);
  };

  const appendTabGroup = (tabs, parent, valueMap) => {
    const activeTabs = (tabs || []).filter((tab) => tab && tab.active !== false);
    if (!activeTabs.length) return;

    const group = el('div', {
      className: 'bl-blocks-fields__tabs',
      dataset: { blBlocksTabs: '1' },
    });
    const tablist = el('div', {
      className: 'bl-blocks-fields__tablist',
      role: 'tablist',
    });
    const panels = [];

    activeTabs.forEach((tab, index) => {
      const tabId = String(tab.id || 'tab' + index);
      const panelId = 'bl-blocks-tab-panel-' + tabId;
      const btnId = 'bl-blocks-tab-' + tabId;
      const label = String(tab.label || '').trim() || i18n('tabType', 'Tab') + ' ' + (index + 1);
      const btn = el('button', {
        type: 'button',
        className: 'bl-blocks-fields__tab' + (index === 0 ? ' is-active' : ''),
        role: 'tab',
        id: btnId,
        'aria-controls': panelId,
        'aria-selected': index === 0 ? 'true' : 'false',
        tabindex: index === 0 ? '0' : '-1',
        text: label,
        dataset: { blBlocksTab: '1' },
      });
      tablist.appendChild(btn);

      const design = compact
        ? 'standard'
        : ['standard', 'outline', 'card'].includes(tab.design)
          ? tab.design
          : 'standard';
      const panelClass = [
        'bl-blocks-fields__tab-panel',
        'bl-blocks-fields__tab-panel--' + design,
      ];
      if (tab.css_class) {
        panelClass.push(String(tab.css_class).trim());
      }
      const panel = el('div', {
        className: panelClass.filter(Boolean).join(' '),
        role: 'tabpanel',
        id: panelId,
        'aria-labelledby': btnId,
        hidden: index !== 0,
      });
      walk(tab.children || [], panel, valueMap);
      panels.push(panel);
    });

    const activate = (index) => {
      Array.from(tablist.children).forEach((btn, i) => {
        const on = i === index;
        btn.classList.toggle('is-active', on);
        btn.setAttribute('aria-selected', on ? 'true' : 'false');
        btn.tabIndex = on ? 0 : -1;
        if (panels[i]) {
          panels[i].hidden = !on;
        }
      });
    };

    tablist.addEventListener('click', (evt) => {
      const btn = evt.target.closest('[data-bl-blocks-tab]');
      if (!btn || !tablist.contains(btn)) return;
      const index = Array.from(tablist.children).indexOf(btn);
      if (index >= 0) activate(index);
    });

    group.appendChild(tablist);
    panels.forEach((panel) => group.appendChild(panel));
    parent.appendChild(group);
  };

  const walk = (list, parent, valueMap) => {
    const fields = list || [];
    let i = 0;
    while (i < fields.length) {
      const field = fields[i];
      if (!field || field.active === false) {
        i += 1;
        continue;
      }
      const type = field.type || 'text';

      if (type === 'tab') {
        const run = [];
        while (i < fields.length && fields[i] && fields[i].type === 'tab') {
          run.push(fields[i]);
          i += 1;
        }
        appendTabGroup(run, parent, valueMap);
        continue;
      }

      if (isLayout(type)) {
        appendLayoutWrap(field, type, parent, valueMap);
        i += 1;
        continue;
      }

      if (type === 'heading') {
        if (field.label) {
          parent.appendChild(el('h4', { className: 'bl-blocks-fields__heading', text: field.label }));
        }
        i += 1;
        continue;
      }
      if (type === 'text_block' || type === 'html') {
        const content = field.default_value || field.content || field.label || '';
        if (content) {
          parent.appendChild(el('div', { className: 'bl-blocks-fields__static', html: content }));
        }
        i += 1;
        continue;
      }
      if (isStatic(type)) {
        i += 1;
        continue;
      }

      if (type === 'repeater') {
        parent.appendChild(createRepeaterControl(field, valueMap, entries, options));
        i += 1;
        continue;
      }

      const leafControls = [];
      const row = createLeafControl(field, valueMap, leafControls);
      if (row) {
        parent.appendChild(row);
        leafControls.forEach((c) => entries.push({ kind: 'leaf', ...c }));
      }
      i += 1;
    }
  };

  walk(fields, root, values || {});

  const getValues = () => {
    const out = {};
    entries.forEach((entry) => {
      if (entry.kind === 'repeater' && typeof entry.getRows === 'function') {
        if (entry.field.name) {
          out[entry.field.name] = entry.getRows();
        }
        return;
      }
      if (entry.kind === 'leaf') {
        const val = collectLeafValue(entry.field, entry.control, entry.type);
        if (entry.field.name) {
          out[entry.field.name] = val;
        }
      }
    });
    return out;
  };

  return { root, getValues };
}

function createRepeaterControl(field, valueMap, entries, options = {}) {
  const compact = options && options.layout === 'compact';
  const name = field.name || '';
  const children = Array.isArray(field.children) ? field.children : [];
  const minRows = Math.max(0, parseInt(field.min_rows, 10) || 0);
  const maxRows = Math.max(0, parseInt(field.max_rows, 10) || 0);
  const buttonLabel = field.button_label || i18n('addRow', 'Add row');
  const design = compact
    ? 'standard'
    : ['standard', 'outline', 'card'].includes(field.design)
      ? field.design
      : 'standard';
  const showTitle =
    field.show_title !== false && field.show_title !== 0 && field.show_title !== '0';

  let rows = Array.isArray(valueMap[name]) ? valueMap[name].slice() : [];
  while (rows.length < minRows) {
    rows.push({});
  }

  const classNames = ['bl-blocks-fields__repeater', 'bl-blocks-fields__repeater--' + design];
  if (field.css_class) {
    classNames.push(String(field.css_class).trim());
  }

  const wrap = el('div', {
    className: classNames.filter(Boolean).join(' '),
    dataset: { fieldName: name },
  });

  if (showTitle && !field.hide_label && field.label) {
    wrap.appendChild(el('div', { className: 'bl-blocks-fields__label', text: field.label }));
  }
  if (field.description) {
    wrap.appendChild(el('p', { className: 'description', text: field.description }));
  }

  const rowsEl = el('div', { className: 'bl-blocks-fields__repeater-rows' });
  /** @type {Array<{ getValues: Function }>} */
  const rowForms = [];

  const syncRowTitles = () => {
    Array.from(rowsEl.children).forEach((rowEl, i) => {
      const title = rowEl.querySelector('.bl-blocks-fields__repeater-row-title');
      if (title) {
        const template = i18n('rowLabel', 'Row %d');
        title.textContent = template.replace('%d', String(i + 1));
      }
    });
  };

  const canAdd = () => maxRows === 0 || rowForms.length < maxRows;
  const canRemove = () => rowForms.length > minRows;

  const addBtn = el('button', {
    type: 'button',
    className: 'button bl-blocks-fields__repeater-add',
    text: buttonLabel,
  });

  const refreshAddBtn = () => {
    addBtn.disabled = !canAdd();
  };

  const mountRow = (rowValues) => {
    const rowEl = el('div', { className: 'bl-blocks-fields__repeater-row' });
    const header = el('div', { className: 'bl-blocks-fields__repeater-row-header' }, [
      el('span', { className: 'bl-blocks-fields__repeater-row-title', text: '' }),
    ]);
    const removeBtn = el('button', {
      type: 'button',
      className: 'button-link-delete bl-blocks-fields__repeater-remove',
      text: i18n('removeRow', 'Remove row'),
    });
    header.appendChild(removeBtn);
    rowEl.appendChild(header);

    const form = createFieldForm(children, rowValues || {}, options);
    rowEl.appendChild(form.root);
    rowsEl.appendChild(rowEl);

    const entry = { getValues: form.getValues, rowEl, removeBtn };
    rowForms.push(entry);

    removeBtn.addEventListener('click', () => {
      if (!canRemove()) return;
      const idx = rowForms.indexOf(entry);
      if (idx >= 0) rowForms.splice(idx, 1);
      rowEl.remove();
      syncRowTitles();
      refreshAddBtn();
      rowForms.forEach((r) => {
        r.removeBtn.disabled = !canRemove();
      });
    });

    removeBtn.disabled = !canRemove();
    syncRowTitles();
    refreshAddBtn();
  };

  rows.forEach((rowValues) => mountRow(rowValues));
  if (rows.length === 0 && minRows === 0) {
    // Start empty; user adds via button.
  }

  addBtn.addEventListener('click', () => {
    if (!canAdd()) return;
    mountRow({});
    rowForms.forEach((r) => {
      r.removeBtn.disabled = !canRemove();
    });
  });

  wrap.appendChild(rowsEl);
  wrap.appendChild(addBtn);
  refreshAddBtn();

  entries.push({
    kind: 'repeater',
    field,
    getRows: () => rowForms.map((r) => r.getValues()),
  });

  return wrap;
}

/**
 * Open a modal with field form.
 *
 * @param {{ title?: string, fields: array, values?: object, onSave?: (values: object) => void }} opts
 */
export function openFieldsModal(opts) {
  const title = opts.title || i18n('edit', 'Edit');
  const form = createFieldForm(opts.fields || [], opts.values || {});

  const overlay = el('div', { className: 'bl-blocks-modal-overlay', role: 'presentation' });
  const dialog = el('div', {
    className: 'bl-blocks-modal',
    role: 'dialog',
    'aria-modal': 'true',
    'aria-label': title,
  });

  const close = () => {
    document.removeEventListener('keydown', onKey);
    overlay.remove();
  };

  const onKey = (evt) => {
    if (evt.key === 'Escape') {
      evt.preventDefault();
      close();
    }
  };

  const header = el('div', { className: 'bl-blocks-modal__header' }, [
    el('h2', { className: 'bl-blocks-modal__title', text: title }),
    el('button', {
      type: 'button',
      className: 'bl-blocks-modal__close',
      text: '×',
      'aria-label': i18n('close', 'Close'),
      onClick: close,
    }),
  ]);

  const body = el('div', { className: 'bl-blocks-modal__body' }, [form.root]);
  const footer = el('div', { className: 'bl-blocks-modal__footer' }, [
    el('button', {
      type: 'button',
      className: 'button',
      text: i18n('cancel', 'Cancel'),
      onClick: close,
    }),
    el('button', {
      type: 'button',
      className: 'button button-primary',
      text: i18n('save', 'Save'),
      onClick: () => {
        if (typeof opts.onSave === 'function') {
          opts.onSave(form.getValues());
        }
        close();
      },
    }),
  ]);

  dialog.append(header, body, footer);
  overlay.appendChild(dialog);
  overlay.addEventListener('click', (evt) => {
    if (evt.target === overlay) close();
  });
  document.body.appendChild(overlay);
  document.addEventListener('keydown', onKey);

  const first = dialog.querySelector('input, textarea, select, button');
  if (first && typeof first.focus === 'function') {
    setTimeout(() => first.focus(), 0);
  }

  return { close, getValues: form.getValues };
}

/**
 * Activate tab panels for PHP-rendered field UIs (Website Settings).
 *
 * @param {ParentNode} [root=document]
 */
export function bindFieldTabs(root = document) {
  root.querySelectorAll('[data-bl-blocks-tabs]').forEach((group) => {
    if (group.dataset.blBlocksTabsBound === '1') return;
    group.dataset.blBlocksTabsBound = '1';
    const tablist = group.querySelector('.bl-blocks-fields__tablist');
    if (!tablist) return;
    const buttons = Array.from(tablist.querySelectorAll('[data-bl-blocks-tab]'));
    const panels = buttons.map((btn) => {
      const id = btn.getAttribute('aria-controls');
      return id ? group.querySelector('#' + CSS.escape(id)) : null;
    });

    const activate = (index) => {
      buttons.forEach((btn, i) => {
        const on = i === index;
        btn.classList.toggle('is-active', on);
        btn.setAttribute('aria-selected', on ? 'true' : 'false');
        btn.tabIndex = on ? 0 : -1;
        if (panels[i]) {
          panels[i].hidden = !on;
        }
      });
    };

    tablist.addEventListener('click', (evt) => {
      const btn = evt.target.closest('[data-bl-blocks-tab]');
      if (!btn || !tablist.contains(btn)) return;
      const index = buttons.indexOf(btn);
      if (index >= 0) activate(index);
    });
  });
}

// Expose for editor bundle / inline usage.
window.blBlocksFieldUiApi = {
  createFieldForm,
  openFieldsModal,
  bindPagePickers,
  bindLinkFields,
  bindMediaPickers,
  bindHttpsUrlFields,
  bindFieldTabs,
};

if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    bindPagePickers(document);
    bindLinkFields(document);
    bindMediaPickers(document);
    bindHttpsUrlFields(document);
    bindFieldTabs(document);
  });
}
