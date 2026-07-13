import { el, formRow } from '../dom';

function mark(input, key) {
  input.dataset.blFb = key;
  return input;
}

function parseOptionsText(text) {
  return String(text || '')
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const sep = line.indexOf(':');
      if (sep === -1) {
        return { label: line, value: line };
      }
      return {
        label: line.slice(0, sep).trim() || line.slice(sep + 1).trim(),
        value: line.slice(sep + 1).trim(),
      };
    })
    .filter((opt) => opt.value !== '');
}


function optionsToText(options) {
  if (!Array.isArray(options)) {
    return '';
  }
  return options
    .map((opt) => {
      if (!opt || typeof opt !== 'object') {
        return '';
      }
      const label = String(opt.label ?? '');
      const value = String(opt.value ?? '');
      if (label === value) {
        return value;
      }
      return `${label} : ${value}`;
    })
    .filter(Boolean)
    .join('\n');
}

export default {
  id: 'select',
  group: 'choice',
  label: 'Select',
  modes: ['fields', 'options'],

  renderOptions(container) {
    const optionsArea = mark(
      el('textarea', {
        className: 'widefat',
        rows: '5',
        placeholder: 'Label : value (one per line)',
      }),
      'options_text'
    );
    container.appendChild(formRow('Options', optionsArea));
    container.appendChild(
      el('p', {
        className: 'description',
        text: 'One option per line. Use “Label : value” or a single value.',
      })
    );
    container.appendChild(
      formRow(
        'Default value',
        mark(el('input', { type: 'text', className: 'widefat' }), 'default_value')
      )
    );
    const allowMultiple = mark(el('input', { type: 'checkbox' }), 'allow_multiple');
    container.appendChild(
      el('label', { className: 'bl-field-builder__checkbox-label' }, [
        allowMultiple,
        document.createTextNode(' Allow multiple'),
      ])
    );
  },

  serialize(fieldRoot) {
    const out = {};
    const optionsText = fieldRoot.querySelector('[data-bl-fb="options_text"]');
    const defaultValue = fieldRoot.querySelector('[data-bl-fb="default_value"]');
    const allowMultiple = fieldRoot.querySelector('[data-bl-fb="allow_multiple"]');
    const options = parseOptionsText(optionsText ? optionsText.value : '');
    if (options.length) {
      out.options = options;
    }
    if (defaultValue && defaultValue.value !== '') {
      out.default_value = defaultValue.value;
    }
    if (allowMultiple && allowMultiple.checked) {
      out.allow_multiple = true;
    }
    return out;
  },

  hydrate(fieldRoot, data) {
    const optionsText = fieldRoot.querySelector('[data-bl-fb="options_text"]');
    const defaultValue = fieldRoot.querySelector('[data-bl-fb="default_value"]');
    const allowMultiple = fieldRoot.querySelector('[data-bl-fb="allow_multiple"]');
    if (optionsText) {
      optionsText.value = optionsToText(data.options);
    }
    if (defaultValue && data.default_value != null) {
      defaultValue.value = String(data.default_value);
    }
    if (allowMultiple) {
      allowMultiple.checked = Boolean(data.allow_multiple);
    }
  },
};
