import { el, formRow } from './dom';

const WIDTH_OPTIONS = ['25', '50', '75', '100', 'custom'];

function mark(input, key) {
  input.dataset.fsFb = key;
  return input;
}

/**
 * Shared Presentation tab controls (all field types).
 *
 * @param {HTMLElement} container
 * @param {object} [data]
 */
export function renderPresentation(container, data = {}) {
  const presentation = data.presentation && typeof data.presentation === 'object' ? data.presentation : {};
  const width = WIDTH_OPTIONS.includes(String(presentation.width || ''))
    ? String(presentation.width)
    : '100';

  const widthSelect = mark(el('select', { className: 'widefat' }), 'presentation_width');
  [
    ['25', '25%'],
    ['50', '50%'],
    ['75', '75%'],
    ['100', '100%'],
    ['custom', 'Custom'],
  ].forEach(([value, label]) => {
    widthSelect.appendChild(
      el('option', {
        value,
        text: label,
        selected: value === width ? true : undefined,
      })
    );
  });

  const customWrap = el('div', {
    className: 'fs-field-builder__width-custom-wrap',
    hidden: width !== 'custom' ? true : undefined,
  });
  const customInput = mark(
    el('input', {
      type: 'text',
      className: 'widefat',
      placeholder: 'e.g. 200px, 50%',
      value: presentation.width_custom != null ? String(presentation.width_custom) : '',
    }),
    'presentation_width_custom'
  );
  customWrap.appendChild(customInput);

  widthSelect.addEventListener('change', () => {
    customWrap.hidden = widthSelect.value !== 'custom';
  });

  container.appendChild(formRow('Width', widthSelect));
  container.appendChild(customWrap);

  const description = mark(
    el('textarea', {
      className: 'widefat',
      rows: '2',
      placeholder: 'Shown under the field in the form',
    }),
    'presentation_description'
  );
  if (presentation.description != null) {
    description.value = String(presentation.description);
  }
  container.appendChild(formRow('Description', description));
}

/**
 * @param {HTMLElement} fieldRoot
 * @returns {object|null}
 */
export function serializePresentation(fieldRoot) {
  const widthEl = fieldRoot.querySelector('[data-fs-fb="presentation_width"]');
  const customEl = fieldRoot.querySelector('[data-fs-fb="presentation_width_custom"]');
  const descEl = fieldRoot.querySelector('[data-fs-fb="presentation_description"]');
  const presentation = {};

  const widthVal = widthEl ? widthEl.value : '';
  if (WIDTH_OPTIONS.includes(widthVal)) {
    presentation.width = widthVal;
    if (widthVal === 'custom' && customEl && customEl.value.trim() !== '') {
      presentation.width_custom = customEl.value.trim();
    }
  }

  if (descEl && descEl.value.trim() !== '') {
    presentation.description = descEl.value.trim();
  }

  return Object.keys(presentation).length ? presentation : null;
}
