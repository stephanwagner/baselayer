import { TYPE_KEYS, el, t, typeLabel, defaultField, uid } from './dom.js';

const WIDTH_PRESETS = [
  { value: '100', label: '100%' },
  { value: '75', label: '75%' },
  { value: '66', label: '66%' },
  { value: '50', label: '50%' },
  { value: '33', label: '33%' },
  { value: '25', label: '25%' },
  { value: 'custom', labelKey: 'widthCustom' },
];

function createOptionsEditor(options) {
  const wrap = el('div', { className: 'bl-forms-builder__options' });
  const list = el('div', { className: 'bl-forms-builder__options-list' });

  const addOption = (opt = { label: '', value: '' }) => {
    const row = el('div', { className: 'bl-forms-builder__option', dataset: { blOption: '1' } }, [
      el('input', {
        type: 'text',
        className: 'widefat',
        dataset: { blOptLabel: '1' },
        value: opt.label || '',
        placeholder: t('optionLabel', 'Label'),
      }),
      el('input', {
        type: 'text',
        className: 'widefat',
        dataset: { blOptValue: '1' },
        value: opt.value || '',
        placeholder: t('optionValue', 'Value'),
      }),
      el('button', {
        type: 'button',
        className: 'button-link-delete',
        text: t('delete', 'Delete'),
        onClick: () => {
          row.remove();
          document.dispatchEvent(new CustomEvent('bl-forms-builder-changed'));
        },
      }),
    ]);
    list.appendChild(row);
  };

  (options || []).forEach((opt) => addOption(opt));
  wrap.appendChild(list);
  wrap.appendChild(
    el('button', {
      type: 'button',
      className: 'button button-small',
      text: t('addOption', 'Add option'),
      onClick: () => addOption(),
    })
  );
  return wrap;
}

function createWidthControl(field) {
  const wrap = el('div', { className: 'bl-forms-builder__width' });
  const group = el('div', {
    className: 'bl-forms-builder__width-group',
    role: 'group',
    dataset: { blWidthGroup: '1' },
  });
  const customInput = el('input', {
    type: 'text',
    className: 'widefat bl-forms-builder__width-custom',
    dataset: { blWidthCustom: '1' },
    placeholder: t('widthCustomPlaceholder', 'e.g. 40% or 280px'),
    value: field.width_custom || '',
  });
  customInput.hidden = (field.width || '100') !== 'custom';

  const syncButtons = (active) => {
    group.querySelectorAll('[data-bl-width]').forEach((btn) => {
      const on = btn.dataset.blWidth === active;
      btn.classList.toggle('is-active', on);
      btn.setAttribute('aria-pressed', on ? 'true' : 'false');
    });
    customInput.hidden = active !== 'custom';
  };

  WIDTH_PRESETS.forEach((preset) => {
    const btn = el('button', {
      type: 'button',
      className: 'bl-forms-builder__width-btn',
      dataset: { blWidth: preset.value },
      text: preset.label || t(preset.labelKey, 'Custom'),
      onClick: () => {
        field.width = preset.value;
        syncButtons(preset.value);
        document.dispatchEvent(new CustomEvent('bl-forms-builder-changed'));
      },
    });
    group.appendChild(btn);
  });

  customInput.addEventListener('input', () => {
    field.width_custom = customInput.value;
    field.width = 'custom';
    syncButtons('custom');
  });

  syncButtons(field.width || '100');
  wrap.append(
    el('label', { text: t('width', 'Width') }),
    group,
    customInput
  );
  return wrap;
}

export function serializeRow(row) {
  const type = row.querySelector('[data-bl-type]')?.value || row.dataset.fieldType || 'text';
  const id = row.dataset.fieldId || uid();
  const widthBtn = row.querySelector('[data-bl-width].is-active');
  const width = widthBtn?.dataset.blWidth || row.dataset.fieldWidth || '100';
  const widthCustom = row.querySelector('[data-bl-width-custom]')?.value || '';

  if (type === 'heading' || type === 'text_block') {
    return {
      id,
      type,
      content: row.querySelector('[data-bl-content]')?.value || '',
      width,
      width_custom: width === 'custom' ? widthCustom : '',
    };
  }
  const data = {
    id,
    type,
    label: row.querySelector('[data-bl-label]')?.value || '',
    name: row.querySelector('[data-bl-name]')?.value || id,
    required: Boolean(row.querySelector('[data-bl-required]')?.checked),
    placeholder: row.querySelector('[data-bl-placeholder]')?.value || '',
    width,
    width_custom: width === 'custom' ? widthCustom : '',
  };
  if (['text', 'email', 'textarea'].includes(type)) {
    data.description = row.querySelector('[data-bl-description]')?.value || '';
  }
  if (type === 'radio' || type === 'checkboxes') {
    data.options = Array.from(row.querySelectorAll('[data-bl-option]')).map((opt) => ({
      label: opt.querySelector('[data-bl-opt-label]')?.value || '',
      value: opt.querySelector('[data-bl-opt-value]')?.value || '',
    }));
  }
  return data;
}

export function createFieldCard(initial, open = false) {
  let field = {
    width: '100',
    width_custom: '',
    ...initial,
    id: initial.id || uid(),
  };
  const row = el('div', {
    className: 'bl-forms-builder__field' + (open ? ' is-open' : ''),
    dataset: {
      blFormsField: '1',
      fieldId: field.id,
      fieldType: field.type,
      fieldWidth: field.width || '100',
    },
  });

  const preview = el('span', { className: 'bl-forms-builder__preview' });
  const badge = el('span', { className: 'bl-forms-builder__type-badge' });
  const body = el('div', { className: 'bl-forms-builder__field-body' });

  const updatePreview = () => {
    preview.textContent = field.label || field.content || typeLabel(field.type);
    badge.textContent = typeLabel(field.type);
    row.dataset.fieldType = field.type;
    row.dataset.fieldWidth = field.width || '100';
  };

  const renderBody = () => {
    body.replaceChildren();

    const typeSelect = el('select', { className: 'widefat', dataset: { blType: '1' } });
    TYPE_KEYS.forEach((key) => {
      const opt = document.createElement('option');
      opt.value = key;
      opt.textContent = typeLabel(key);
      if (key === field.type) opt.selected = true;
      typeSelect.appendChild(opt);
    });
    typeSelect.addEventListener('change', () => {
      const next = defaultField(typeSelect.value);
      next.id = field.id;
      next.width = field.width || '100';
      next.width_custom = field.width_custom || '';
      field = next;
      updatePreview();
      renderBody();
      document.dispatchEvent(new CustomEvent('bl-forms-builder-changed'));
    });
    body.appendChild(el('p', {}, [el('label', { text: t('type', 'Type') }), typeSelect]));
    body.appendChild(createWidthControl(field));

    if (field.type === 'heading' || field.type === 'text_block') {
      const ta = el('textarea', { className: 'widefat', rows: '3', dataset: { blContent: '1' } });
      ta.value = field.content || '';
      ta.addEventListener('input', () => {
        field.content = ta.value;
        updatePreview();
      });
      body.appendChild(el('p', {}, [el('label', { text: t('content', 'Content') }), ta]));
      return;
    }

    const labelInput = el('input', { type: 'text', className: 'widefat', dataset: { blLabel: '1' } });
    labelInput.value = field.label || '';
    labelInput.addEventListener('input', () => {
      field.label = labelInput.value;
      updatePreview();
    });
    body.appendChild(el('p', {}, [el('label', { text: t('label', 'Label') }), labelInput]));

    const nameInput = el('input', { type: 'text', className: 'widefat', dataset: { blName: '1' } });
    nameInput.value = field.name || field.id;
    body.appendChild(el('p', {}, [el('label', { text: t('name', 'Name') }), nameInput]));

    if (!['terms', 'radio', 'checkboxes'].includes(field.type)) {
      const ph = el('input', { type: 'text', className: 'widefat', dataset: { blPlaceholder: '1' } });
      ph.value = field.placeholder || '';
      body.appendChild(el('p', {}, [el('label', { text: t('placeholder', 'Placeholder') }), ph]));
    }

    if (['text', 'email', 'textarea'].includes(field.type)) {
      const desc = el('textarea', {
        className: 'widefat',
        rows: '2',
        dataset: { blDescription: '1' },
      });
      desc.value = field.description || '';
      desc.addEventListener('input', () => {
        field.description = desc.value;
      });
      body.appendChild(el('p', {}, [el('label', { text: t('description', 'Description') }), desc]));
    }

    const req = el('input', { type: 'checkbox', dataset: { blRequired: '1' }, checked: !!field.required });
    body.appendChild(el('p', {}, [el('label', {}, [req, ' ' + t('required', 'Required')])]));

    if (field.type === 'radio' || field.type === 'checkboxes') {
      body.appendChild(el('p', { text: t('options', 'Options') }));
      body.appendChild(createOptionsEditor(field.options || []));
    }
  };

  const header = el('div', { className: 'bl-forms-builder__field-header' }, [
    el('button', {
      type: 'button',
      className: 'bl-forms-builder__toggle',
      text: '▾',
      onClick: () => row.classList.toggle('is-open'),
    }),
    preview,
    badge,
    el('span', { className: 'bl-forms-builder__handle', text: '⋮⋮' }),
    el('button', {
      type: 'button',
      className: 'button-link-delete',
      text: t('delete', 'Delete'),
      onClick: () => {
        row.remove();
        document.dispatchEvent(new CustomEvent('bl-forms-builder-changed'));
      },
    }),
  ]);

  updatePreview();
  renderBody();
  row.appendChild(header);
  row.appendChild(body);
  return row;
}
