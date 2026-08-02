/**
 * Options tab — sidebar options for this BaseLayer block (toggle, select, button group).
 * Persisted via config.blockOptions → bl_block_options store on save.
 */
const { el, t } = window.BlFormBuilder || {};

const OPTION_TYPES = [
  { id: 'boolean', labelKey: 'optionTypeToggle', labelFallback: 'Toggle' },
  { id: 'select', labelKey: 'optionTypeSelect', labelFallback: 'Select' },
  { id: 'button-group', labelKey: 'optionTypeButtonGroup', labelFallback: 'Button group' },
];

function newId(prefix) {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
}

function slugifyAttr(text) {
  const base = String(text || '')
    .trim()
    .toLowerCase()
    .replace(/ä/g, 'ae')
    .replace(/ö/g, 'oe')
    .replace(/ü/g, 'ue')
    .replace(/ß/g, 'ss')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .replace(/_+/g, '_');
  if (!base) {
    return 'blockOption';
  }
  const parts = base.split('_').filter(Boolean);
  return parts[0] + parts.slice(1).map((p) => p.charAt(0).toUpperCase() + p.slice(1)).join('');
}

function defaultItem(type) {
  if (type === 'boolean') {
    return {
      id: newId('c'),
      kind: 'control',
      type: 'boolean',
      label: 'Option',
      toggleLabel: 'Enable',
      attributeName: 'customOption',
      className: '',
      default: false,
    };
  }
  return {
    id: newId('c'),
    kind: 'control',
    type,
    label: type === 'button-group' ? 'Choice' : 'Select',
    attributeName: type === 'button-group' ? 'customChoice' : 'customSelect',
    default: '',
    options: [
      { label: 'A', value: '' },
      { label: 'B', value: '-option-b' },
    ],
  };
}

function typeLabel(type) {
  const row = OPTION_TYPES.find((o) => o.id === type);
  return row ? t(row.labelKey, row.labelFallback) : type;
}

/**
 * @param {object} initial — { items?: array }
 * @param {(next: { items: array }) => void} onChange
 */
export function createOptionsPanel(initial, onChange) {
  let items = Array.isArray(initial?.items)
    ? JSON.parse(JSON.stringify(initial.items))
    : [];

  /** Track which attributes were auto-derived so we don't overwrite manual edits. */
  const manualAttr = new Set();
  items.forEach((item) => {
    if (item && item.attributeName) {
      manualAttr.add(item.id);
    }
  });

  const panel = el('div', {
    className: 'bl-forms-builder__panel bl-blocks-options-panel',
    dataset: { blFormsPanel: 'options' },
  });

  const list = el('div', { className: 'bl-bo-stack' });
  const empty = el('p', {
    className: 'description bl-bo-stack__empty',
    text: t(
      'blockOptionsEmpty',
      'No options yet. Add a toggle, select, or button group for the block sidebar.'
    ),
  });

  const sync = () => {
    onChange({ items: JSON.parse(JSON.stringify(items)) });
  };

  const move = (from, to) => {
    if (to < 0 || to >= items.length) {
      return;
    }
    const [row] = items.splice(from, 1);
    items.splice(to, 0, row);
    sync();
    render();
  };

  const removeAt = (index) => {
    items.splice(index, 1);
    sync();
    render();
  };

  const patchAt = (index, next) => {
    items[index] = next;
    sync();
  };

  const replaceAt = (index, next) => {
    items[index] = next;
    sync();
    render();
  };

  function renderChoices(item, index) {
    const wrap = el('div', { className: 'bl-bo-choices' });
    (item.options || []).forEach((opt, oi) => {
      wrap.appendChild(
        el('div', { className: 'bl-bo-choice' }, [
          el('input', {
            type: 'text',
            className: 'bl-bo-choice__label',
            value: opt.label || '',
            placeholder: t('choiceLabel', 'Label'),
            onInput: (e) => {
              const options = JSON.parse(JSON.stringify(item.options || []));
              options[oi] = { ...options[oi], label: e.target.value };
              patchAt(index, { ...item, options });
              item.options = options;
            },
          }),
          el('input', {
            type: 'text',
            className: 'bl-bo-choice__value',
            value: opt.value || '',
            placeholder: t('choiceValue', 'Value / class'),
            onInput: (e) => {
              const options = JSON.parse(JSON.stringify(item.options || []));
              options[oi] = { ...options[oi], value: e.target.value };
              patchAt(index, { ...item, options });
              item.options = options;
            },
          }),
          el('button', {
            type: 'button',
            className: 'button-link-delete',
            text: '×',
            onClick: () => {
              const options = JSON.parse(JSON.stringify(item.options || []));
              options.splice(oi, 1);
              replaceAt(index, { ...item, options });
            },
          }),
        ])
      );
    });
    wrap.appendChild(
      el('button', {
        type: 'button',
        className: 'button button-small',
        text: t('addChoice', 'Add choice'),
        onClick: () => {
          const options = JSON.parse(JSON.stringify(item.options || []));
          options.push({ label: 'Option', value: '' });
          replaceAt(index, { ...item, options });
        },
      })
    );
    return wrap;
  }

  function renderCard(item, index) {
    const card = el('div', { className: 'bl-bo-card' });

    const typeSelect = el('select', { className: 'bl-bo-card__type' });
    OPTION_TYPES.forEach((row) => {
      typeSelect.appendChild(
        el('option', {
          value: row.id,
          text: t(row.labelKey, row.labelFallback),
          selected: item.type === row.id ? true : undefined,
        })
      );
    });
    typeSelect.value = item.type;
    typeSelect.addEventListener('change', () => {
      const next = defaultItem(typeSelect.value);
      next.id = item.id;
      replaceAt(index, next);
    });

    const head = el('div', { className: 'bl-bo-card__head' }, [
      el('span', { className: 'bl-bo-card__badge', text: typeLabel(item.type) }),
      el('div', { className: 'bl-bo-card__actions' }, [
        el('button', {
          type: 'button',
          className: 'button-link',
          text: '↑',
          onClick: () => move(index, index - 1),
        }),
        el('button', {
          type: 'button',
          className: 'button-link',
          text: '↓',
          onClick: () => move(index, index + 1),
        }),
        el('button', {
          type: 'button',
          className: 'button-link-delete',
          text: t('remove', 'Remove'),
          onClick: () => removeAt(index),
        }),
      ]),
    ]);

    const body = el('div', { className: 'bl-bo-card__body' });

    body.appendChild(
      el('div', { className: 'bl-bo-field' }, [
        el('label', { text: t('optionLabel', 'Label') }),
        el('input', {
          type: 'text',
          value: item.label || '',
          onInput: (e) => {
            const label = e.target.value;
            const next = { ...item, label };
            if (!manualAttr.has(item.id)) {
              next.attributeName = slugifyAttr(label);
            }
            patchAt(index, next);
            Object.assign(item, next);
            if (!manualAttr.has(item.id) && attrInput) {
              attrInput.value = next.attributeName;
            }
          },
        }),
      ])
    );

    const attrInput = el('input', {
      type: 'text',
      value: item.attributeName || '',
      onInput: (e) => {
        manualAttr.add(item.id);
        const next = { ...item, attributeName: e.target.value };
        patchAt(index, next);
        Object.assign(item, next);
      },
    });
    body.appendChild(
      el('div', { className: 'bl-bo-field' }, [
        el('label', { text: t('attributeName', 'Attribute name') }),
        attrInput,
      ])
    );

    body.appendChild(
      el('div', { className: 'bl-bo-field' }, [
        el('label', { text: t('optionType', 'Type') }),
        typeSelect,
      ])
    );

    if (item.type === 'boolean') {
      body.appendChild(
        el('div', { className: 'bl-bo-field' }, [
          el('label', { text: t('toggleLabel', 'Toggle label') }),
          el('input', {
            type: 'text',
            value: item.toggleLabel || '',
            onInput: (e) => {
              const next = { ...item, toggleLabel: e.target.value };
              patchAt(index, next);
              Object.assign(item, next);
            },
          }),
        ])
      );
      body.appendChild(
        el('div', { className: 'bl-bo-field' }, [
          el('label', { text: t('classWhenOn', 'CSS class when on') }),
          el('input', {
            type: 'text',
            value: item.className || '',
            onInput: (e) => {
              const next = { ...item, className: e.target.value };
              patchAt(index, next);
              Object.assign(item, next);
            },
          }),
        ])
      );
      const defCheck = el('input', { type: 'checkbox', checked: !!item.default });
      defCheck.addEventListener('change', () => {
        const next = { ...item, default: defCheck.checked };
        patchAt(index, next);
        Object.assign(item, next);
      });
      body.appendChild(
        el('label', { className: 'bl-bo-check' }, [
          defCheck,
          document.createTextNode(' ' + t('defaultOn', 'On by default')),
        ])
      );
    }

    if (item.type === 'select' || item.type === 'button-group') {
      body.appendChild(
        el('div', { className: 'bl-bo-field' }, [
          el('label', { text: t('choices', 'Choices') }),
          renderChoices(item, index),
        ])
      );
    }

    card.append(head, body);
    return card;
  }

  function render() {
    list.replaceChildren();
    empty.hidden = items.length > 0;
    items.forEach((item, index) => {
      list.appendChild(renderCard(item, index));
    });
  }

  const addRow = el('div', { className: 'bl-bo-add' });
  OPTION_TYPES.forEach((row) => {
    addRow.appendChild(
      el('button', {
        type: 'button',
        className: 'button button-secondary',
        text: '+ ' + t(row.labelKey, row.labelFallback),
        onClick: () => {
          items.push(defaultItem(row.id));
          sync();
          render();
        },
      })
    );
  });

  panel.append(
    el('p', {
      className: 'description',
      text: t(
        'blockOptionsHelp',
        'These controls appear in the block sidebar in the editor.'
      ),
    }),
    list,
    empty,
    addRow
  );

  render();

  return {
    panel,
    getBlockOptions: () => ({ items: JSON.parse(JSON.stringify(items)) }),
  };
}
