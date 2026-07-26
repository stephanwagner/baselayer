import { el, formRow } from '../dom';

function mark(input, key) {
  input.dataset.blFb = key;
  return input;
}

export default {
  id: 'email',
  group: 'general',
  label: 'Email',
  modes: ['event-meta'],

  renderOptions(container) {
    container.appendChild(
      formRow(
        'Placeholder',
        mark(el('input', { type: 'text', className: 'widefat' }), 'placeholder')
      )
    );
  },

  serialize(fieldRoot) {
    const out = {};
    const placeholder = fieldRoot.querySelector('[data-bl-fb="placeholder"]');
    if (placeholder && placeholder.value !== '') {
      out.placeholder = placeholder.value;
    }
    return out;
  },

  hydrate(fieldRoot, data) {
    const placeholder = fieldRoot.querySelector('[data-bl-fb="placeholder"]');
    if (placeholder && data.placeholder != null) {
      placeholder.value = String(data.placeholder);
    }
  },
};
