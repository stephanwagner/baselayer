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

/**
 * Build an editable field form from a definition schema.
 *
 * @param {array} fields
 * @param {object} values
 * @returns {{ root: HTMLElement, getValues: () => object }}
 */
export function createFieldForm(fields, values = {}) {
  const root = el('div', { className: 'bl-blocks-fields', dataset: { blBlocksFields: '' } });
  const controls = [];

  const walk = (list, parent) => {
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
        walk(field.children || [], wrap);
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

      const name = field.name || '';
      if (!name) return;

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
      const id = 'bl-blocks-ui-' + name.replace(/[^a-z0-9_-]/gi, '_');

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
      parent.appendChild(row);
    });
  };

  walk(fields, root);

  const getValues = () => {
    const out = {};
    controls.forEach(({ field, control, type }) => {
      const name = field.name;
      if (!name) return;
      if (type === 'textarea' || type === 'hidden' || control.tagName === 'INPUT' && control.type !== 'checkbox' && control.type !== 'radio') {
        if (control.tagName === 'INPUT' || control.tagName === 'TEXTAREA') {
          if (control.type === 'checkbox') {
            out[name] = control.checked ? '1' : '';
            return;
          }
          out[name] = control.value;
          return;
        }
      }
      if (type === 'select') {
        if (control.multiple) {
          out[name] = Array.from(control.selectedOptions).map((o) => o.value);
        } else {
          out[name] = control.value;
        }
        return;
      }
      if (type === 'checkboxes') {
        out[name] = Array.from(control.querySelectorAll('input[type="checkbox"]:checked')).map(
          (input) => input.value
        );
        return;
      }
      if (type === 'radio' || type === 'button_group') {
        const checked = control.querySelector('input[type="radio"]:checked');
        out[name] = checked ? checked.value : '';
        return;
      }
      if (type === 'toggle' || type === 'terms') {
        const input = control.tagName === 'INPUT' ? control : control.querySelector('input');
        out[name] = input && input.checked ? '1' : '';
        return;
      }
      if (control && 'value' in control) {
        out[name] = control.value;
      }
    });
    return out;
  };

  return { root, getValues };
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
