import { el, formRow } from '../dom';

/**
 * @param {HTMLElement} input
 * @param {string} key
 */
function mark(input, key) {
  input.dataset.fsFb = key;
  return input;
}

export default {
  id: 'text',
  group: 'general',
  label: 'Text',
  modes: ['fields'],

  renderOptions(container) {
    container.appendChild(
      formRow(
        'Default value',
        mark(el('input', { type: 'text', className: 'widefat' }), 'default_value')
      )
    );
    container.appendChild(
      formRow(
        'Placeholder',
        mark(el('input', { type: 'text', className: 'widefat' }), 'placeholder')
      )
    );
  },

  serialize(fieldRoot) {
    const out = {};
    const defaultValue = fieldRoot.querySelector('[data-fs-fb="default_value"]');
    const placeholder = fieldRoot.querySelector('[data-fs-fb="placeholder"]');
    if (defaultValue && defaultValue.value !== '') {
      out.default_value = defaultValue.value;
    }
    if (placeholder && placeholder.value !== '') {
      out.placeholder = placeholder.value;
    }
    return out;
  },

  hydrate(fieldRoot, data) {
    const defaultValue = fieldRoot.querySelector('[data-fs-fb="default_value"]');
    const placeholder = fieldRoot.querySelector('[data-fs-fb="placeholder"]');
    if (defaultValue && data.default_value != null) {
      defaultValue.value = String(data.default_value);
    }
    if (placeholder && data.placeholder != null) {
      placeholder.value = String(data.placeholder);
    }
  },
};
