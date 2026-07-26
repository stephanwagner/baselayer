import { el } from './dom';

/**
 * Toggle switch control (Forms-like, kit BEM).
 *
 * @param {object} options
 * @param {string} options.label
 * @param {boolean} [options.checked]
 * @param {string} [options.datasetKey] data-bl-fb value on the checkbox
 * @param {(checked: boolean) => void} [options.onChange]
 */
export function createSwitch({ label, checked = false, datasetKey = '', onChange = null } = {}) {
  const inputAttrs = {
    type: 'checkbox',
    checked: checked ? true : undefined,
  };
  if (datasetKey) {
    inputAttrs.dataset = { blFb: datasetKey };
  }
  const input = el('input', inputAttrs);
  if (typeof onChange === 'function') {
    input.addEventListener('change', () => onChange(input.checked));
  }
  return el('div', { className: 'bl-field-builder__switch-setting' }, [
    el('label', { className: 'bl-field-builder__switch' }, [
      input,
      el('span', { className: 'bl-field-builder__switch-ui', 'aria-hidden': 'true' }),
      el('span', { className: 'bl-field-builder__switch-label', text: label }),
    ]),
  ]);
}

/**
 * Segmented button group.
 *
 * @param {Array<{value: string, label: string, title?: string}>} options
 * @param {string} active
 * @param {(value: string) => void} onSelect
 * @param {string} [datasetKey]
 */
export function createSegmented(options, active, onSelect, datasetKey = '') {
  const group = el('div', {
    className: 'bl-field-builder__segmented',
    role: 'group',
  });
  if (datasetKey) {
    group.dataset[datasetKey] = '1';
  }

  const sync = (value) => {
    group.querySelectorAll('button').forEach((btn) => {
      const on = btn.dataset.value === value;
      btn.classList.toggle('is-active', on);
      btn.setAttribute('aria-pressed', on ? 'true' : 'false');
    });
  };

  (options || []).forEach((opt) => {
    const label = opt.label || '';
    group.appendChild(
      el('button', {
        type: 'button',
        className: 'bl-field-builder__segmented-btn',
        dataset: { value: opt.value },
        title: opt.title || label,
        'aria-label': label,
        text: label,
        onClick: () => {
          sync(opt.value);
          if (typeof onSelect === 'function') {
            onSelect(opt.value);
          }
        },
      })
    );
  });

  sync(active);
  return group;
}

/**
 * Simple modal shell (backdrop + dialog). Returns { close }.
 *
 * @param {object} options
 * @param {string} options.title
 * @param {HTMLElement|HTMLElement[]} options.body
 * @param {HTMLElement|HTMLElement[]} [options.footer]
 * @param {() => void} [options.onClose]
 */
export function openModal({ title = '', body = null, footer = null, onClose = null } = {}) {
  const close = () => {
    overlay.remove();
    document.removeEventListener('keydown', onKey);
    if (typeof onClose === 'function') {
      onClose();
    }
  };

  const onKey = (event) => {
    if (event.key === 'Escape') {
      close();
    }
  };

  const dialog = el('div', { className: 'bl-field-builder__modal-dialog', role: 'dialog', 'aria-modal': 'true' }, [
    el('div', { className: 'bl-field-builder__modal-header' }, [
      el('h2', { className: 'bl-field-builder__modal-title', text: title }),
      el('button', {
        type: 'button',
        className: 'bl-field-builder__modal-close',
        'aria-label': 'Close',
        text: '×',
        onClick: close,
      }),
    ]),
    el('div', { className: 'bl-field-builder__modal-body' }, Array.isArray(body) ? body : [body]),
    footer
      ? el('div', { className: 'bl-field-builder__modal-footer' }, Array.isArray(footer) ? footer : [footer])
      : null,
  ]);

  const overlay = el('div', { className: 'bl-field-builder__modal' }, [
    el('div', {
      className: 'bl-field-builder__modal-backdrop',
      onClick: close,
    }),
    dialog,
  ]);

  document.body.appendChild(overlay);
  document.addEventListener('keydown', onKey);

  return { close, overlay, dialog };
}
