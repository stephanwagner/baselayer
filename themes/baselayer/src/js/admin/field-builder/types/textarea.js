import { el, formRow } from '../dom';

function mark(input, key) {
  input.dataset.blFb = key;
  return input;
}

export default {
  id: 'textarea',
  group: 'general',
  label: 'Textarea',
  modes: ['fields'],

  renderOptions(container) {
    container.appendChild(
      formRow(
        'Default value',
        mark(el('textarea', { className: 'widefat', rows: '3' }), 'default_value')
      )
    );
    container.appendChild(
      formRow(
        'Placeholder',
        mark(el('input', { type: 'text', className: 'widefat' }), 'placeholder')
      )
    );
    container.appendChild(
      formRow(
        'Rows',
        mark(el('input', { type: 'number', className: 'small-text', min: '2', max: '50', value: '4' }), 'rows')
      )
    );
  },

  serialize(fieldRoot) {
    const out = {};
    const defaultValue = fieldRoot.querySelector('[data-bl-fb="default_value"]');
    const placeholder = fieldRoot.querySelector('[data-bl-fb="placeholder"]');
    const rows = fieldRoot.querySelector('[data-bl-fb="rows"]');
    if (defaultValue && defaultValue.value !== '') {
      out.default_value = defaultValue.value;
    }
    if (placeholder && placeholder.value !== '') {
      out.placeholder = placeholder.value;
    }
    if (rows) {
      const n = parseInt(rows.value, 10);
      if (!Number.isNaN(n) && n >= 2 && n <= 50) {
        out.rows = n;
      }
    }
    return out;
  },

  hydrate(fieldRoot, data) {
    const defaultValue = fieldRoot.querySelector('[data-bl-fb="default_value"]');
    const placeholder = fieldRoot.querySelector('[data-bl-fb="placeholder"]');
    const rows = fieldRoot.querySelector('[data-bl-fb="rows"]');
    if (defaultValue && data.default_value != null) {
      defaultValue.value = String(data.default_value);
    }
    if (placeholder && data.placeholder != null) {
      placeholder.value = String(data.placeholder);
    }
    if (rows && data.rows != null) {
      rows.value = String(data.rows);
    }
  },
};
