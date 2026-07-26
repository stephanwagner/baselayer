import { el, formRow } from '../dom';

function mark(input, key) {
  input.dataset.blFb = key;
  return input;
}

function simpleTextType(id, label, inputType = 'text') {
  return {
    id,
    group: 'general',
    label,
    modes: ['fields', 'event-meta'],

    renderOptions(container) {
      container.appendChild(
        formRow(
          'Placeholder',
          mark(el('input', { type: 'text', className: 'widefat' }), 'placeholder')
        )
      );
      if (inputType === 'text' || inputType === 'email' || inputType === 'url' || inputType === 'tel') {
        container.appendChild(
          formRow(
            'Default value',
            mark(el('input', { type: inputType === 'tel' ? 'text' : inputType, className: 'widefat' }), 'default_value')
          )
        );
      }
    },

    serialize(fieldRoot) {
      const out = {};
      const defaultValue = fieldRoot.querySelector('[data-bl-fb="default_value"]');
      const placeholder = fieldRoot.querySelector('[data-bl-fb="placeholder"]');
      if (defaultValue && defaultValue.value !== '') {
        out.default_value = defaultValue.value;
      }
      if (placeholder && placeholder.value !== '') {
        out.placeholder = placeholder.value;
      }
      return out;
    },

    hydrate(fieldRoot, data) {
      const defaultValue = fieldRoot.querySelector('[data-bl-fb="default_value"]');
      const placeholder = fieldRoot.querySelector('[data-bl-fb="placeholder"]');
      if (defaultValue && data.default_value != null) {
        defaultValue.value = String(data.default_value);
      }
      if (placeholder && data.placeholder != null) {
        placeholder.value = String(data.placeholder);
      }
    },
  };
}

export default simpleTextType('text', 'Text', 'text');
