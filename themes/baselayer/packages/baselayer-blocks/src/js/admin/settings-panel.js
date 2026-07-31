/**
 * Type-aware Settings panel for Blocks / Page Settings / Site Settings definitions.
 */
import { el, t, writeConfig } from '../../../../baselayer-forms/src/js/admin/dom.js';

function fieldRow(label, control, help = '') {
  const children = [el('label', {}, [el('strong', { text: label })]), control];
  if (help) {
    children.push(el('span', { className: 'description', text: help }));
  }
  return el('p', { className: 'bl-forms-builder__setting' }, children);
}

function plainSwitch(label, { checked = false, onChange = null } = {}) {
  const input = el('input', { type: 'checkbox', checked: !!checked });
  if (onChange) {
    input.addEventListener('change', () => onChange(input.checked));
  }
  return {
    root: el(
      'div',
      { className: 'bl-forms-builder__switch-setting' },
      [
        el('label', { className: 'bl-forms-builder__switch' }, [
          input,
          el('span', { className: 'bl-forms-builder__switch-ui', 'aria-hidden': 'true' }),
          el('span', { className: 'bl-forms-builder__switch-label', text: label }),
        ]),
      ]
    ),
    input,
  };
}

/**
 * @param {object} initial
 * @param {string} definitionType
 * @param {(next: object) => void} onChange
 */
export function createSettingsPanel(initial, definitionType, onChange) {
  let state = { ...(initial || {}) };
  const notify = () => {
    onChange({ ...state });
    writeConfig({ settings: { ...state } });
  };

  const panel = el('div', {
    className: 'bl-forms-builder__panel bl-blocks-settings-panel',
    dataset: { blFormsPanel: 'settings' },
    hidden: true,
  });

  const { root: activeRow, input: activeInput } = plainSwitch(t('settingsActive', 'Active'), {
    checked: state.active !== false,
    onChange: (checked) => {
      state.active = checked;
      notify();
    },
  });

  const slugInput = el('input', {
    type: 'text',
    className: 'regular-text',
    value: state.slug || '',
    pattern: '[a-z0-9\\-]*',
  });
  slugInput.addEventListener('input', () => {
    state.slug = slugInput.value.trim().toLowerCase().replace(/[^a-z0-9-]/g, '');
    slugInput.value = state.slug;
    notify();
  });

  const descInput = el('textarea', {
    className: 'large-text',
    rows: 3,
    text: state.description || '',
  });
  descInput.addEventListener('input', () => {
    state.description = descInput.value;
    notify();
  });

  const children = [
    el('h3', { className: 'bl-forms-builder__section-title', text: t('tabSettings', 'Settings') }),
    activeRow,
    fieldRow(t('settingsSlug', 'Slug'), slugInput, t('settingsSlugHelp', '')),
    fieldRow(t('settingsDescription', 'Description'), descInput),
  ];

  if (definitionType === 'block') {
    const titleInput = el('input', {
      type: 'text',
      className: 'regular-text',
      value: state.block_title || '',
    });
    titleInput.addEventListener('input', () => {
      state.block_title = titleInput.value;
      notify();
    });

    const iconInput = el('input', {
      type: 'text',
      className: 'regular-text',
      value: state.block_icon || 'block-default',
    });
    iconInput.addEventListener('input', () => {
      state.block_icon = iconInput.value.trim() || 'block-default';
      notify();
    });

    const categoryInput = el('input', {
      type: 'text',
      className: 'regular-text',
      value: state.block_category || 'widgets',
    });
    categoryInput.addEventListener('input', () => {
      state.block_category = categoryInput.value.trim() || 'widgets';
      notify();
    });

    const keywordsInput = el('input', {
      type: 'text',
      className: 'regular-text',
      value: state.block_keywords || '',
    });
    keywordsInput.addEventListener('input', () => {
      state.block_keywords = keywordsInput.value;
      notify();
    });

    children.push(
      fieldRow(t('blockTitle', 'Block title'), titleInput),
      fieldRow(t('blockIcon', 'Block icon'), iconInput),
      fieldRow(t('blockCategory', 'Block category'), categoryInput),
      fieldRow(t('blockKeywords', 'Keywords'), keywordsInput, t('blockKeywordsHelp', ''))
    );
  }

  if (definitionType === 'page_settings') {
    const postTypes = (window.blBlocksAdmin && window.blBlocksAdmin.postTypes) || [];
    const selected = Array.isArray(state.post_types) ? state.post_types.map(String) : [];
    const box = el('div', { className: 'bl-blocks-settings-post-types' });
    postTypes.forEach((pt) => {
      const checked = selected.includes(pt.value);
      const input = el('input', { type: 'checkbox', value: pt.value, checked });
      input.addEventListener('change', () => {
        const next = [];
        box.querySelectorAll('input[type="checkbox"]').forEach((elInput) => {
          if (elInput.checked) next.push(elInput.value);
        });
        state.post_types = next;
        notify();
      });
      box.appendChild(
        el('label', { className: 'bl-blocks-settings-post-types__item' }, [
          input,
          document.createTextNode(' ' + (pt.label || pt.value)),
        ])
      );
    });
    children.push(fieldRow(t('postTypes', 'Post types'), box, t('postTypesHelp', '')));
  }

  if (definitionType === 'site_settings') {
    const labelInput = el('input', {
      type: 'text',
      className: 'regular-text',
      value: state.menu_label || '',
    });
    labelInput.addEventListener('input', () => {
      state.menu_label = labelInput.value;
      notify();
    });
    const orderInput = el('input', {
      type: 'number',
      className: 'small-text',
      value: String(state.menu_order != null ? state.menu_order : 10),
    });
    orderInput.addEventListener('input', () => {
      state.menu_order = parseInt(orderInput.value, 10) || 0;
      notify();
    });
    children.push(
      fieldRow(t('menuLabel', 'Tab label'), labelInput, t('menuLabelHelp', '')),
      fieldRow(t('menuOrder', 'Order'), orderInput)
    );
  }

  panel.append(...children);

  return {
    panel,
    getSettings: () => ({ ...state }),
    setSettings: (next) => {
      state = { ...state, ...(next || {}) };
      activeInput.checked = state.active !== false;
    },
    syncFields: () => {},
  };
}
