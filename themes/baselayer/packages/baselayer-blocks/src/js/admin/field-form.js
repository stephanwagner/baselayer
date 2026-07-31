/**
 * Shared admin field form renderer + modal shell for Blocks runtimes.
 */

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
  return type === 'column' || type === 'section' || type === 'group';
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

function collectLeafValue(field, control, type) {
  const name = field.name;
  if (!name) return null;
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
  } else {
    let inputType = 'text';
    if (type === 'email' || type === 'url' || type === 'number' || type === 'date' || type === 'time') {
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
 * @returns {{ root: HTMLElement, getValues: () => object }}
 */
export function createFieldForm(fields, values = {}) {
  const root = el('div', { className: 'bl-blocks-fields', dataset: { blBlocksFields: '' } });
  /** @type {Array<{ kind: 'leaf'|'repeater', field: object, control?: HTMLElement, type?: string, getRows?: Function }>} */
  const entries = [];

  const walk = (list, parent, valueMap) => {
    (list || []).forEach((field) => {
      if (!field || field.active === false) return;
      const type = field.type || 'text';

      if (isLayout(type)) {
        const wrap = el('div', {
          className: 'bl-blocks-fields__layout bl-blocks-fields__layout--' + type,
        });
        if (type === 'section' && field.label) {
          wrap.appendChild(el('h3', { className: 'bl-blocks-fields__section-title', text: field.label }));
        }
        parent.appendChild(wrap);
        walk(field.children || [], wrap, valueMap);
        return;
      }

      if (type === 'heading') {
        if (field.label) {
          parent.appendChild(el('h4', { className: 'bl-blocks-fields__heading', text: field.label }));
        }
        return;
      }
      if (type === 'text_block' || type === 'html') {
        const content = field.default_value || field.content || field.label || '';
        if (content) {
          parent.appendChild(el('div', { className: 'bl-blocks-fields__static', html: content }));
        }
        return;
      }
      if (isStatic(type)) return;

      if (type === 'repeater') {
        parent.appendChild(createRepeaterControl(field, valueMap, entries));
        return;
      }

      const leafControls = [];
      const row = createLeafControl(field, valueMap, leafControls);
      if (row) {
        parent.appendChild(row);
        leafControls.forEach((c) => entries.push({ kind: 'leaf', ...c }));
      }
    });
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

function createRepeaterControl(field, valueMap, entries) {
  const name = field.name || '';
  const children = Array.isArray(field.children) ? field.children : [];
  const minRows = Math.max(0, parseInt(field.min_rows, 10) || 0);
  const maxRows = Math.max(0, parseInt(field.max_rows, 10) || 0);
  const buttonLabel = field.button_label || i18n('addRow', 'Add row');

  let rows = Array.isArray(valueMap[name]) ? valueMap[name].slice() : [];
  while (rows.length < minRows) {
    rows.push({});
  }

  const wrap = el('div', {
    className: 'bl-blocks-fields__repeater',
    dataset: { fieldName: name },
  });

  if (!field.hide_label && field.label) {
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

    const form = createFieldForm(children, rowValues || {});
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

// Expose for editor bundle / inline usage.
window.blBlocksFieldUiApi = {
  createFieldForm,
  openFieldsModal,
};
