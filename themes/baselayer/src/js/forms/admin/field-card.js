import { TYPE_KEYS, TYPE_SELECT_SECTIONS, el, t, typeLabel, defaultField, uid, iconEl } from './dom.js';

const WIDTH_PRESETS = [
  { value: '100', label: '100%' },
  { value: '75', label: '75%' },
  { value: '66', label: '66%' },
  { value: '50', label: '50%' },
  { value: '33', label: '33%' },
  { value: '25', label: '25%' },
  { value: 'custom', labelKey: 'widthCustom' },
];

const CONTENT_TYPES = ['heading', 'text_block', 'html', 'divider', 'spacer', 'captcha'];
const OPTION_TYPES = ['radio', 'checkboxes', 'select', 'button_group'];
const MULTIPLE_TYPES = ['select', 'button_group', 'file', 'image'];
const DESCRIPTION_TYPES = [
  'text',
  'email',
  'url',
  'number',
  'password',
  'phone',
  'textarea',
  'date',
  'time',
  'datetime',
  'file',
  'image',
  'toggle',
];
const NO_PLACEHOLDER = [
  'terms',
  'radio',
  'checkboxes',
  'button_group',
  'toggle',
  'file',
  'image',
  'hidden',
  'honeypot',
  'captcha',
];
const NO_REQUIRED = ['hidden', 'honeypot', 'captcha', 'divider', 'spacer', 'heading', 'text_block', 'html'];

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
  wrap.append(el('label', { text: t('width', 'Width') }), group, customInput);
  return wrap;
}

function createCheckboxSetting(key, label, checked, onChange) {
  const input = el('input', {
    type: 'checkbox',
    dataset: { [key]: '1' },
    checked: !!checked,
  });
  input.addEventListener('change', () => onChange(input.checked));
  return el('p', {}, [el('label', {}, [input, ' ' + label])]);
}

export function serializeRow(row) {
  const type = row.querySelector('[data-bl-type]')?.value || row.dataset.fieldType || 'text';
  const id = row.dataset.fieldId || uid();
  const widthBtn = row.querySelector('[data-bl-width].is-active');
  const width = widthBtn?.dataset.blWidth || row.dataset.fieldWidth || '100';
  const widthCustom = row.querySelector('[data-bl-width-custom]')?.value || '';

  if (type === 'divider' || type === 'captcha') {
    return { id, type, width, width_custom: width === 'custom' ? widthCustom : '' };
  }

  if (type === 'spacer') {
    return {
      id,
      type,
      height: row.querySelector('[data-bl-height]')?.value || '24px',
      width,
      width_custom: width === 'custom' ? widthCustom : '',
    };
  }

  if (type === 'heading' || type === 'text_block' || type === 'html') {
    return {
      id,
      type,
      content: row.querySelector('[data-bl-content]')?.value || '',
      width,
      width_custom: width === 'custom' ? widthCustom : '',
    };
  }

  if (type === 'honeypot') {
    return {
      id,
      type,
      label: row.querySelector('[data-bl-label]')?.value || '',
      name: row.querySelector('[data-bl-name]')?.value || id,
      width,
      width_custom: width === 'custom' ? widthCustom : '',
    };
  }

  if (type === 'hidden') {
    return {
      id,
      type,
      label: row.querySelector('[data-bl-label]')?.value || '',
      name: row.querySelector('[data-bl-name]')?.value || id,
      default_value: row.querySelector('[data-bl-default]')?.value || '',
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

  if (DESCRIPTION_TYPES.includes(type)) {
    data.description = row.querySelector('[data-bl-description]')?.value || '';
  }
  if (type === 'terms') {
    data.content = row.querySelector('[data-bl-content]')?.value || '';
  }
  if (OPTION_TYPES.includes(type)) {
    data.options = Array.from(row.querySelectorAll('[data-bl-option]')).map((opt) => ({
      label: opt.querySelector('[data-bl-opt-label]')?.value || '',
      value: opt.querySelector('[data-bl-opt-value]')?.value || '',
    }));
  }
  if (MULTIPLE_TYPES.includes(type)) {
    data.multiple = Boolean(row.querySelector('[data-bl-multiple]')?.checked);
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
  if (field.type === 'terms' && field.content == null && field.label) {
    field = { ...field, content: field.label, label: '' };
  }
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
  const typeChip = el('span', { className: 'bl-forms-builder__field-type' });
  const body = el('div', { className: 'bl-forms-builder__field-body' });

  const updatePreview = () => {
    const title = (field.label || field.content || '').trim();
    preview.textContent = title;
    preview.hidden = title === '';
    typeChip.replaceChildren(
      iconEl(field.type, 'bl-forms-builder__field-type-icon'),
      el('span', { className: 'bl-forms-builder__field-type-label', text: typeLabel(field.type) })
    );
    row.dataset.fieldType = field.type;
    row.dataset.fieldWidth = field.width || '100';
  };

  const setOpen = (open) => {
    row.classList.toggle('is-open', open);
    toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    toggle.setAttribute(
      'aria-label',
      open ? t('collapseField', 'Collapse field') : t('expandField', 'Expand field')
    );
  };

  const toggle = el('button', {
    type: 'button',
    className: 'bl-forms-builder__icon-btn bl-forms-builder__field-toggle',
    'aria-expanded': open ? 'true' : 'false',
    'aria-label': open ? t('collapseField', 'Collapse field') : t('expandField', 'Expand field'),
    onClick: () => setOpen(!row.classList.contains('is-open')),
  });
  const caretIcon = iconEl('caret', 'bl-forms-builder__field-toggle-icon');
  if (caretIcon.innerHTML) {
    toggle.appendChild(caretIcon);
  } else {
    toggle.textContent = '▾';
  }

  const editBtn = el('button', {
    type: 'button',
    className: 'bl-forms-builder__icon-btn bl-forms-builder__field-edit',
    title: t('editField', 'Edit field'),
    'aria-label': t('editField', 'Edit field'),
    onClick: () => setOpen(true),
  });
  const editIcon = iconEl('edit');
  if (editIcon.innerHTML) {
    editBtn.appendChild(editIcon);
  } else {
    editBtn.textContent = '✎';
  }

  const deleteBtn = el('button', {
    type: 'button',
    className: 'bl-forms-builder__icon-btn bl-forms-builder__icon-btn--danger',
    title: t('delete', 'Delete'),
    'aria-label': t('delete', 'Delete'),
    onClick: () => {
      row.remove();
      document.dispatchEvent(new CustomEvent('bl-forms-builder-changed'));
    },
  });
  const trashIcon = iconEl('trash');
  if (trashIcon.innerHTML) {
    deleteBtn.appendChild(trashIcon);
  } else {
    deleteBtn.textContent = '×';
  }

  const renderBody = () => {
    body.replaceChildren();

    const typeSelect = el('select', { className: 'widefat', dataset: { blType: '1' } });
    TYPE_SELECT_SECTIONS.forEach((section) => {
      const group = document.createElement('optgroup');
      group.label = t(section.headingKey, section.headingFallback);
      section.types.forEach((key) => {
        const opt = document.createElement('option');
        opt.value = key;
        opt.textContent = typeLabel(key);
        if (key === field.type) opt.selected = true;
        group.appendChild(opt);
      });
      typeSelect.appendChild(group);
    });
    // Keep any unknown legacy type selectable.
    if (field.type && !TYPE_KEYS.includes(field.type)) {
      const opt = document.createElement('option');
      opt.value = field.type;
      opt.textContent = typeLabel(field.type);
      opt.selected = true;
      typeSelect.appendChild(opt);
    }
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

    if (field.type === 'divider' || field.type === 'captcha') {
      if (field.type === 'captcha') {
        body.appendChild(
          el('p', {
            className: 'description',
            text: t('captchaHelp', 'CAPTCHA will be wired up later. This is a placeholder field.'),
          })
        );
      }
      return;
    }

    if (field.type === 'spacer') {
      const heightInput = el('input', {
        type: 'text',
        className: 'widefat',
        dataset: { blHeight: '1' },
        value: field.height || '24px',
        placeholder: '24px',
      });
      heightInput.addEventListener('input', () => {
        field.height = heightInput.value;
      });
      body.appendChild(el('p', {}, [el('label', { text: t('spacerHeight', 'Height') }), heightInput]));
      return;
    }

    if (['heading', 'text_block', 'html'].includes(field.type)) {
      const ta = el('textarea', {
        className: 'widefat',
        rows: field.type === 'html' ? '6' : '3',
        dataset: { blContent: '1' },
      });
      ta.value = field.content || '';
      ta.addEventListener('input', () => {
        field.content = ta.value;
        updatePreview();
      });
      const contentLabel =
        field.type === 'html' ? t('htmlContent', 'HTML') : t('content', 'Content');
      body.appendChild(el('p', {}, [el('label', { text: contentLabel }), ta]));
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

    if (field.type === 'terms') {
      const consentText = el('textarea', {
        className: 'widefat',
        rows: '3',
        dataset: { blContent: '1' },
      });
      consentText.value = field.content || '';
      consentText.addEventListener('input', () => {
        field.content = consentText.value;
        updatePreview();
      });
      body.appendChild(
        el('p', {}, [el('label', { text: t('checkboxText', 'Checkbox text') }), consentText])
      );
      body.appendChild(
        el('p', {
          className: 'description',
          text: t(
            'checkboxTextHelp',
            'Links: [Privacy Policy](page:privacy) (site privacy page), [Privacy Policy](/privacy-policy), or [Privacy Policy](page:234). Unresolved page links show as plain text.'
          ),
        })
      );
    }

    if (field.type === 'hidden') {
      const def = el('input', {
        type: 'text',
        className: 'widefat',
        dataset: { blDefault: '1' },
        value: field.default_value || '',
      });
      body.appendChild(el('p', {}, [el('label', { text: t('defaultValue', 'Default value') }), def]));
      return;
    }

    if (field.type === 'honeypot') {
      body.appendChild(
        el('p', {
          className: 'description',
          text: t('honeypotHelp', 'Hidden from visitors. If filled, the submission is treated as spam.'),
        })
      );
      return;
    }

    if (!NO_PLACEHOLDER.includes(field.type)) {
      const ph = el('input', { type: 'text', className: 'widefat', dataset: { blPlaceholder: '1' } });
      ph.value = field.placeholder || '';
      body.appendChild(el('p', {}, [el('label', { text: t('placeholder', 'Placeholder') }), ph]));
    }

    if (DESCRIPTION_TYPES.includes(field.type)) {
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

    if (!NO_REQUIRED.includes(field.type)) {
      const req = el('input', {
        type: 'checkbox',
        dataset: { blRequired: '1' },
        checked: !!field.required,
      });
      body.appendChild(el('p', {}, [el('label', {}, [req, ' ' + t('required', 'Required')])]));
    }

    if (MULTIPLE_TYPES.includes(field.type)) {
      let multipleLabel = t('allowMultiple', 'Allow multiple');
      if (field.type === 'button_group') {
        multipleLabel = t('buttonGroupMultiple', 'Allow multiple selection');
      } else if (field.type === 'select') {
        multipleLabel = t('selectMultiple', 'Allow multiple selection');
      }
      body.appendChild(
        createCheckboxSetting('blMultiple', multipleLabel, !!field.multiple, (checked) => {
          field.multiple = checked;
          document.dispatchEvent(new CustomEvent('bl-forms-builder-changed'));
        })
      );
    }

    if (OPTION_TYPES.includes(field.type)) {
      body.appendChild(el('p', { text: t('options', 'Options') }));
      body.appendChild(createOptionsEditor(field.options || []));
    }
  };

  const header = el('div', { className: 'bl-forms-builder__field-header' }, [
    toggle,
    typeChip,
    preview,
    editBtn,
    deleteBtn,
    el('span', {
      className: 'bl-forms-builder__handle',
      title: t('dragField', 'Drag to reorder'),
      'aria-hidden': 'true',
      text: '⋮⋮',
    }),
  ]);

  updatePreview();
  renderBody();
  row.appendChild(header);
  row.appendChild(body);
  return row;
}
