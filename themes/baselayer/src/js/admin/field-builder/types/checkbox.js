import { el, formRow } from '../dom';
import { t } from '../i18n';

function mark(input, key) {
  input.dataset.blFb = key;
  return input;
}

export default {
  id: 'checkbox',
  group: 'choice',
  label: 'Checkbox',
  modes: ['fields', 'options'],

  renderOptions(container) {
    const defaultSelect = mark(el('select', { className: 'widefat' }), 'default_value');
    defaultSelect.appendChild(el('option', { value: '0', text: t('no', 'No') }));
    defaultSelect.appendChild(el('option', { value: '1', text: t('yes', 'Yes') }));
    container.appendChild(formRow(t('defaultValue', 'Default value'), defaultSelect));

    container.appendChild(
      formRow(
        t('cssClassWhenChecked', 'CSS class when checked'),
        mark(
          el('input', {
            type: 'text',
            className: 'widefat',
            placeholder: t('cssClassPlaceholder', 'e.g. -is-active'),
          }),
          'class_name'
        )
      )
    );
  },

  serialize(fieldRoot) {
    const out = {};
    const defaultValue = fieldRoot.querySelector('[data-bl-fb="default_value"]');
    const className = fieldRoot.querySelector('[data-bl-fb="class_name"]');
    if (defaultValue) {
      out.default_value = defaultValue.value === '1';
    }
    if (className && className.value !== '') {
      out.class_name = className.value;
    }
    return out;
  },

  hydrate(fieldRoot, data) {
    const defaultValue = fieldRoot.querySelector('[data-bl-fb="default_value"]');
    const className = fieldRoot.querySelector('[data-bl-fb="class_name"]');
    if (defaultValue) {
      defaultValue.value = data.default_value ? '1' : '0';
    }
    if (className && data.class_name != null) {
      className.value = String(data.class_name);
    }
  },
};
