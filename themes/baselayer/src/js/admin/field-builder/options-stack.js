import Sortable from 'sortablejs';
import { el, empty } from './dom';
import { createFieldRow, serializeFieldRow } from './field-row';

/**
 * Combined Options stack: shared presets + custom option fields, one sortable list.
 *
 * @param {HTMLElement} root
 * @param {object} options
 * @param {Array<{slug: string, label: string}>} options.presets
 * @param {Array<object>} options.initialStack
 * @param {object} options.i18n
 */
export function mountOptionsStack(root, options = {}) {
  const library = Array.isArray(options.presets) ? options.presets : [];
  const labelBySlug = {};
  library.forEach((item) => {
    if (item && item.slug) {
      labelBySlug[item.slug] = item.label || item.slug;
    }
  });

  const i18n = options.i18n || {};
  empty(root);
  root.classList.add('bl-field-builder', 'bl-options-stack');

  const list = el('div', {
    className: 'bl-field-builder__list bl-options-stack__list',
  });
  const emptyState = el('p', {
    className: 'bl-field-builder__empty description',
    text: i18n.empty || 'No options yet. Add a preset or a custom option.',
  });

  const addRow = el('div', { className: 'bl-options-stack__add-row' });
  const select = el('select', { className: 'bl-options-stack__select' });
  select.appendChild(el('option', { value: '', text: '—' }));
  library.forEach((item) => {
    select.appendChild(
      el('option', {
        value: item.slug,
        text: item.label || item.slug,
      })
    );
  });
  const addPresetBtn = el('button', {
    type: 'button',
    className: 'button button-secondary',
    text: i18n.addPreset || 'Add preset',
  });
  const addOptionBtn = el('button', {
    type: 'button',
    className: 'button button-secondary',
    text: i18n.addOption || 'Add option',
  });
  addRow.appendChild(select);
  addRow.appendChild(addPresetBtn);
  addRow.appendChild(addOptionBtn);

  root.appendChild(list);
  root.appendChild(emptyState);
  root.appendChild(addRow);

  const syncEmpty = () => {
    const has = list.querySelector('.bl-options-stack__item') != null;
    emptyState.hidden = has;
    root.classList.toggle('has-fields', has);
  };

  const syncSelectOptions = () => {
    const used = new Set(
      Array.from(list.querySelectorAll('[data-bl-op-slug]')).map((row) => row.dataset.blOpSlug)
    );
    Array.from(select.options).forEach((opt) => {
      if (!opt.value) {
        return;
      }
      opt.disabled = used.has(opt.value);
    });
    if (select.value && select.options[select.selectedIndex]?.disabled) {
      select.value = '';
    }
  };

  const addPreset = (slug, open = false) => {
    if (!slug || !labelBySlug[slug] || list.querySelector(`[data-bl-op-slug="${slug}"]`)) {
      return null;
    }
    const row = el('div', {
      className: 'bl-option-presets__row bl-options-stack__item',
      dataset: { blOpSlug: slug },
    });
    row.appendChild(
      el('span', {
        className: 'bl-option-presets__handle bl-field-builder__field-handle',
        title: 'Drag to reorder',
        text: '⋮⋮',
      })
    );
    row.appendChild(
      el('span', {
        className: 'bl-option-presets__badge',
        text: i18n.presetBadge || 'Preset',
      })
    );
    row.appendChild(
      el('span', {
        className: 'bl-option-presets__label',
        text: labelBySlug[slug],
      })
    );
    row.appendChild(
      el('code', {
        className: 'bl-option-presets__slug',
        text: slug,
      })
    );
    const removeBtn = el('button', {
      type: 'button',
      className: 'button-link-delete bl-option-presets__remove',
      text: i18n.removePreset || 'Remove',
    });
    removeBtn.addEventListener('click', () => {
      row.remove();
      syncEmpty();
      syncSelectOptions();
    });
    row.appendChild(removeBtn);
    list.appendChild(row);
    syncEmpty();
    syncSelectOptions();
    if (open) {
      row.scrollIntoView({ block: 'nearest' });
    }
    return row;
  };

  const addCustom = (data = {}, open = true) => {
    const row = createFieldRow({ mode: 'options', data, open });
    row.classList.add('bl-options-stack__item');
    list.appendChild(row);
    syncEmpty();
    return row;
  };

  addPresetBtn.addEventListener('click', () => {
    if (!select.value) {
      return;
    }
    addPreset(select.value, true);
    select.value = '';
  });

  addOptionBtn.addEventListener('click', () => {
    addCustom({}, true);
  });

  list.addEventListener('bl-fb-delete', (event) => {
    const row = event.target.closest('[data-bl-fb-field]');
    if (row) {
      row.remove();
      syncEmpty();
    }
  });

  Sortable.create(list, {
    handle: '.bl-field-builder__field-handle',
    animation: 150,
    draggable: '.bl-options-stack__item',
  });

  (Array.isArray(options.initialStack) ? options.initialStack : []).forEach((item) => {
    if (!item || typeof item !== 'object') {
      return;
    }
    if (item.kind === 'preset' && item.slug) {
      addPreset(String(item.slug), false);
      return;
    }
    if (item.kind === 'custom') {
      const { kind, ...field } = item;
      addCustom(field, false);
      return;
    }
    // Legacy plain field row without kind.
    if (item.type && item.slug) {
      addCustom(item, false);
    }
  });

  syncEmpty();
  syncSelectOptions();

  return {
    getStack() {
      return Array.from(list.children)
        .filter((row) => row.classList.contains('bl-options-stack__item'))
        .map((row) => {
          if (row.dataset.blOpSlug) {
            return { kind: 'preset', slug: row.dataset.blOpSlug };
          }
          if (row.dataset.blFbField) {
            return { kind: 'custom', ...serializeFieldRow(row) };
          }
          return null;
        })
        .filter(Boolean);
    },
  };
}
