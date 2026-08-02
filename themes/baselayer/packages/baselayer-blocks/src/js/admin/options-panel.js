/**
 * Options tab — block sidebar options (generics, customs, preset refs).
 * Persisted via config.blockOptions → bl_block_options store on save.
 */
const { el, t } = window.BlFormBuilder || {};

const GENERIC_TYPES = [
  { id: 'boolean', labelKey: 'optionTypeToggle', labelFallback: 'Toggle' },
  { id: 'select', labelKey: 'optionTypeSelect', labelFallback: 'Select' },
  { id: 'button-group', labelKey: 'optionTypeButtonGroup', labelFallback: 'Button group' },
  { id: 'icon', labelKey: 'optionTypeIcon', labelFallback: 'Icon' },
];

const SIZE_TOKENS = [
  { value: '', label: '—' },
  { value: 'none', label: 'None' },
  { value: 'xs', label: 'XS' },
  { value: 's', label: 'S' },
  { value: 'm', label: 'M' },
  { value: 'l', label: 'L' },
  { value: 'xl', label: 'XL' },
];

const ALIGN_TOKENS = [
  { value: 'left', label: 'Left' },
  { value: 'center', label: 'Center' },
  { value: 'right', label: 'Right' },
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

function customsCatalog() {
  return window.blBlocksAdmin?.blockOptionCustoms || {};
}

function presetsCatalog() {
  return Array.isArray(window.blBlocksAdmin?.blockOptionPresets)
    ? window.blBlocksAdmin.blockOptionPresets
    : [];
}

function isCustomType(type) {
  return !!customsCatalog()[type];
}

/**
 * Which custom params may be overridden when a preset is attached to a block.
 * Label is shown via a universal field (skip catalog `label` to avoid duplicates).
 * allowUnset is locked for Abstände (container-margin).
 */
function canOverridePresetParam(controlType, key) {
  if (key === 'label') {
    return false;
  }
  if (key === 'allowUnset' && controlType === 'container-margin') {
    return false;
  }
  return true;
}

function defaultGeneric(type) {
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
  if (type === 'icon') {
    return {
      id: newId('c'),
      kind: 'control',
      type: 'icon',
      label: 'Icon',
      attributeName: 'customIcon',
      default: '',
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

function defaultCustom(type) {
  const def = customsCatalog()[type];
  const defaults = def?.defaults || {};
  return {
    id: newId('c'),
    kind: 'control',
    type,
    ...JSON.parse(JSON.stringify(defaults)),
  };
}

function defaultPresetRef(slug) {
  return {
    id: newId('p'),
    kind: 'preset',
    slug: slug || '',
    defaults: {},
  };
}

function typeLabel(item) {
  if (item?.kind === 'preset') {
    return t('optionTypePreset', 'Preset');
  }
  if (isCustomType(item?.type)) {
    return customsCatalog()[item.type]?.label || item.type;
  }
  const row = GENERIC_TYPES.find((o) => o.id === item?.type);
  return row ? t(row.labelKey, row.labelFallback) : item?.type || '';
}

/**
 * @param {object} initial — { items?: array }
 * @param {(next: { items: array }) => void} onChange
 */
export function createOptionsPanel(initial, onChange) {
  let items = Array.isArray(initial?.items)
    ? JSON.parse(JSON.stringify(initial.items))
    : [];

  const manualAttr = new Set();
  items.forEach((item) => {
    if (item && item.kind === 'control' && item.attributeName && !isCustomType(item.type)) {
      manualAttr.add(item.id);
    }
  });

  const panel = el('div', {
    className: 'bl-blocks-options-panel',
    dataset: { blFormsPanel: 'options' },
  });

  const list = el('div', { className: 'bl-bo-stack' });
  const empty = el('p', {
    className: 'description bl-bo-stack__empty',
    text: t(
      'blockOptionsEmpty',
      'No options yet. Add a control or attach a preset.'
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

  function renderParamField(paramKey, paramDef, value, onUpdate) {
    const ptype = paramDef?.type || 'text';
    const label = paramDef?.label || paramKey;

    if (ptype === 'boolean') {
      const check = el('input', { type: 'checkbox', checked: !!value });
      check.addEventListener('change', () => onUpdate(check.checked));
      return el('label', { className: 'bl-bo-check' }, [
        check,
        document.createTextNode(' ' + label),
      ]);
    }

    if (ptype === 'size' || ptype === 'align') {
      const tokens = ptype === 'size' ? SIZE_TOKENS : ALIGN_TOKENS;
      const select = el('select');
      tokens.forEach((tok) => {
        select.appendChild(
          el('option', {
            value: tok.value,
            text: tok.label,
            selected: value === tok.value ? true : undefined,
          })
        );
      });
      select.value = value ?? (ptype === 'align' ? 'center' : '');
      select.addEventListener('change', () => onUpdate(select.value));
      return el('div', { className: 'bl-bo-field' }, [el('label', { text: label }), select]);
    }

    return el('div', { className: 'bl-bo-field' }, [
      el('label', { text: label }),
      el('input', {
        type: 'text',
        value: value ?? '',
        onInput: (e) => onUpdate(e.target.value),
      }),
    ]);
  }

  function renderDescriptionField(value, onUpdate) {
    const textarea = el('textarea', {
      className: 'widefat',
      rows: 2,
      text: value || '',
    });
    textarea.addEventListener('input', () => onUpdate(textarea.value));
    return el('div', { className: 'bl-bo-field' }, [
      el('label', { text: t('optionDescription', 'Description') }),
      textarea,
    ]);
  }

  function patchPresetDefault(item, index, controlId, patch) {
    const defaults = { ...(item.defaults || {}) };
    defaults[controlId] = { ...(defaults[controlId] || {}), ...patch };
    const next = { ...item, defaults };
    patchAt(index, next);
    Object.assign(item, next);
  }

  function renderCustomParams(item, index) {
    const wrap = el('div', { className: 'bl-bo-custom-params' });
    const def = customsCatalog()[item.type];
    if (!def?.params) {
      return wrap;
    }
    Object.entries(def.params).forEach(([key, paramDef]) => {
      wrap.appendChild(
        renderParamField(key, paramDef, item[key], (nextVal) => {
          const next = { ...item, [key]: nextVal };
          patchAt(index, next);
          Object.assign(item, next);
        })
      );
    });
    return wrap;
  }

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

  function renderCardActions(index) {
    return el('div', { className: 'bl-bo-card__actions' }, [
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
    ]);
  }

  function renderPresetCard(item, index) {
    const card = el('div', { className: 'bl-bo-card bl-bo-card--preset' });
    const presets = presetsCatalog();

    const slugSelect = el('select', { className: 'bl-bo-card__type' });
    if (presets.length === 0) {
      slugSelect.appendChild(
        el('option', {
          value: '',
          text: t('noPresetsYet', 'No presets yet — create some under Block Options → Presets'),
        })
      );
    } else {
      presets.forEach((preset) => {
        slugSelect.appendChild(
          el('option', {
            value: preset.slug,
            text: preset.label || preset.slug,
            selected: item.slug === preset.slug ? true : undefined,
          })
        );
      });
      if (item.slug && !presets.some((p) => p.slug === item.slug)) {
        slugSelect.appendChild(
          el('option', { value: item.slug, text: item.slug + ' (missing)', selected: true })
        );
      }
      slugSelect.value = item.slug || presets[0].slug;
    }
    slugSelect.addEventListener('change', () => {
      replaceAt(index, { ...item, slug: slugSelect.value, defaults: {} });
    });

    const head = el('div', { className: 'bl-bo-card__head' }, [
      el('span', { className: 'bl-bo-card__badge', text: t('optionTypePreset', 'Preset') }),
      renderCardActions(index),
    ]);

    const body = el('div', { className: 'bl-bo-card__body' }, [
      el('div', { className: 'bl-bo-field' }, [
        el('label', { text: t('choosePreset', 'Preset') }),
        slugSelect,
      ]),
    ]);

    const selected = presets.find((p) => p.slug === (slugSelect.value || item.slug));
    const controls = Array.isArray(selected?.items)
      ? selected.items.filter((c) => c && c.kind === 'control')
      : [];

    if (controls.length > 0) {
      body.appendChild(
        el('p', {
          className: 'description',
          text: t('presetDefaultsHelp', 'Optional default overrides for this block:'),
        })
      );
      controls.forEach((control) => {
        const section = el('div', { className: 'bl-bo-preset-defaults' });
        const title =
          control.label ||
          customsCatalog()[control.type]?.label ||
          control.type ||
          control.id;
        section.appendChild(el('strong', { text: title }));

        const controlId = control.id;
        const overrideLabel =
          item.defaults?.[controlId]?.label !== undefined
            ? item.defaults[controlId].label
            : control.label || '';
        const overrideDescription =
          item.defaults?.[controlId]?.description !== undefined
            ? item.defaults[controlId].description
            : control.description || '';

        section.appendChild(
          el('div', { className: 'bl-bo-field' }, [
            el('label', { text: t('optionLabel', 'Label') }),
            el('input', {
              type: 'text',
              value: overrideLabel,
              onInput: (e) => patchPresetDefault(item, index, controlId, { label: e.target.value }),
            }),
          ])
        );
        section.appendChild(
          renderDescriptionField(overrideDescription, (nextVal) =>
            patchPresetDefault(item, index, controlId, { description: nextVal })
          )
        );

        if (isCustomType(control.type)) {
          const def = customsCatalog()[control.type];
          Object.entries(def?.params || {}).forEach(([key, paramDef]) => {
            if (!canOverridePresetParam(control.type, key)) {
              return;
            }
            const current =
              item.defaults?.[control.id]?.[key] !== undefined
                ? item.defaults[control.id][key]
                : control[key];
            section.appendChild(
              renderParamField(key, paramDef, current, (nextVal) => {
                patchPresetDefault(item, index, control.id, { [key]: nextVal });
              })
            );
          });
        } else if (control.type === 'boolean') {
          const check = el('input', {
            type: 'checkbox',
            checked: !!(item.defaults?.[control.id]?.default ?? control.default),
          });
          check.addEventListener('change', () => {
            patchPresetDefault(item, index, control.id, { default: check.checked });
          });
          section.appendChild(
            el('label', { className: 'bl-bo-check' }, [
              check,
              document.createTextNode(' ' + t('defaultOn', 'On by default')),
            ])
          );
        } else if (control.type === 'select' || control.type === 'button-group') {
          const select = el('select');
          (control.options || []).forEach((opt) => {
            select.appendChild(
              el('option', {
                value: opt.value ?? '',
                text: opt.label || opt.value || '—',
              })
            );
          });
          select.value = item.defaults?.[control.id]?.default ?? control.default ?? '';
          select.addEventListener('change', () => {
            patchPresetDefault(item, index, control.id, { default: select.value });
          });
          section.appendChild(
            el('div', { className: 'bl-bo-field' }, [
              el('label', { text: t('defaultValue', 'Default') }),
              select,
            ])
          );
        }

        body.appendChild(section);
      });
    }

    card.append(head, body);
    return card;
  }

  function buildTypeSelect(item, index) {
    const typeSelect = el('select', { className: 'bl-bo-card__type' });

    const defaultGroup = el('optgroup', {
      label: t('optionGroupDefault', 'Default'),
    });
    GENERIC_TYPES.forEach((row) => {
      defaultGroup.appendChild(
        el('option', {
          value: row.id,
          text: t(row.labelKey, row.labelFallback),
          selected: !isCustomType(item.type) && item.type === row.id ? true : undefined,
        })
      );
    });
    typeSelect.appendChild(defaultGroup);

    const customEntries = Object.entries(customsCatalog());
    if (customEntries.length > 0) {
      const customGroup = el('optgroup', {
        label: t('optionGroupCustom', 'Custom'),
      });
      customEntries.forEach(([type, def]) => {
        customGroup.appendChild(
          el('option', {
            value: type,
            text: def?.label || type,
            selected: item.type === type ? true : undefined,
          })
        );
      });
      typeSelect.appendChild(customGroup);
    }

    typeSelect.value = item.type;
    typeSelect.addEventListener('change', () => {
      const type = typeSelect.value;
      if (isCustomType(type)) {
        const next = defaultCustom(type);
        next.id = item.id;
        replaceAt(index, next);
        return;
      }
      const next = defaultGeneric(type);
      next.id = item.id;
      replaceAt(index, next);
    });
    return typeSelect;
  }

  function renderControlCard(item, index) {
    const card = el('div', { className: 'bl-bo-card' });
    const custom = isCustomType(item.type);

    const head = el('div', { className: 'bl-bo-card__head' }, [
      el('span', { className: 'bl-bo-card__badge', text: typeLabel(item) }),
      renderCardActions(index),
    ]);

    const body = el('div', { className: 'bl-bo-card__body' });
    body.appendChild(
      el('div', { className: 'bl-bo-field' }, [
        el('label', { text: t('optionType', 'Type') }),
        buildTypeSelect(item, index),
      ])
    );

    if (custom) {
      body.appendChild(renderCustomParams(item, index));
      body.appendChild(
        renderDescriptionField(item.description || '', (nextVal) => {
          const next = { ...item, description: nextVal };
          patchAt(index, next);
          Object.assign(item, next);
        })
      );
      card.append(head, body);
      return card;
    }

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

    body.appendChild(
      renderDescriptionField(item.description || '', (nextVal) => {
        const next = { ...item, description: nextVal };
        patchAt(index, next);
        Object.assign(item, next);
      })
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

  function renderCard(item, index) {
    if (item?.kind === 'preset') {
      return renderPresetCard(item, index);
    }
    return renderControlCard(item, index);
  }

  function render() {
    list.replaceChildren();
    empty.hidden = items.length > 0;
    items.forEach((item, index) => {
      list.appendChild(renderCard(item, index));
    });
  }

  const addRow = el('div', { className: 'bl-bo-add' });
  addRow.appendChild(
    el('button', {
      type: 'button',
      className: 'button button-secondary',
      text: '+ ' + t('addOption', 'Add option'),
      onClick: () => {
        items.push(defaultGeneric('boolean'));
        sync();
        render();
      },
    })
  );
  addRow.appendChild(
    el('button', {
      type: 'button',
      className: 'button button-secondary',
      text: '+ ' + t('addPreset', 'Preset'),
      onClick: () => {
        const presets = presetsCatalog();
        if (presets.length === 0) {
          window.alert(
            t('noPresetsYet', 'No presets yet — create some under Block Options → Presets')
          );
          return;
        }
        items.push(defaultPresetRef(presets[0].slug));
        sync();
        render();
      },
    })
  );

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
