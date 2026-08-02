/**
 * Shared options items editor — used by block Options tab and Block Options → Presets.
 *
 * @param {object} initial
 * @param {(next: { items: array }) => void} onChange
 * @param {object} [options]
 * @param {boolean} [options.allowCustoms=false] — type picker includes custom controls (preset editor)
 * @param {boolean} [options.allowPresetRefs=true] — allow attaching presets (block Options)
 * @param {object|Function} [options.customs] — customs catalog (or getter)
 * @param {array|Function} [options.presets] — presets catalog (or getter)
 * @param {string|false|null} [options.helpText] — help copy; false/null hides
 * @param {string} [options.emptyText] — empty canvas message
 */
function fb() {
  return window.BlFormBuilder || {};
}

function canvasApi() {
  return window.BlCanvasBuilder || {};
}

function el(...args) {
  return fb().el(...args);
}

function t(key, fallback) {
  return typeof fb().t === 'function' ? fb().t(key, fallback) : fallback || key;
}

function iconEl(...args) {
  return typeof fb().iconEl === 'function' ? fb().iconEl(...args) : el('span');
}

const GENERIC_TYPES = [
  { id: 'boolean', labelKey: 'optionTypeToggle', labelFallback: 'Toggle' },
  { id: 'select', labelKey: 'optionTypeSelect', labelFallback: 'Select' },
  { id: 'button-group', labelKey: 'optionTypeButtonGroup', labelFallback: 'Button group' },
  { id: 'icon', labelKey: 'optionTypeIcon', labelFallback: 'Icon' },
];

const SIZE_TOKENS = [
  { value: '', label: '—' },
  { value: 'none', label: '0' },
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

function sizeTokensFromParam(paramDef) {
  const choices = paramDef?.choices;
  if (choices && typeof choices === 'object' && !Array.isArray(choices)) {
    return Object.entries(choices).map(([value, label]) => ({
      value,
      label: String(label),
    }));
  }
  return SIZE_TOKENS;
}

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

/** @type {{ allowCustoms: boolean, allowPresetRefs: boolean, customs: *, presets: *, helpText: *, emptyText: * }} */
let panelOptions = {
  allowCustoms: false,
  allowPresetRefs: true,
  customs: null,
  presets: null,
  helpText: undefined,
  emptyText: null,
};

function customsCatalog() {
  const raw =
    typeof panelOptions.customs === 'function'
      ? panelOptions.customs()
      : panelOptions.customs;
  if (raw && typeof raw === 'object') {
    return raw;
  }
  return window.blBlocksAdmin?.blockOptionCustoms || {};
}

function presetsCatalog() {
  const raw =
    typeof panelOptions.presets === 'function'
      ? panelOptions.presets()
      : panelOptions.presets;
  if (Array.isArray(raw)) {
    return raw;
  }
  return Array.isArray(window.blBlocksAdmin?.blockOptionPresets)
    ? window.blBlocksAdmin.blockOptionPresets
    : [];
}

function isCustomType(type) {
  return !!customsCatalog()[type];
}

function defaultCustom(type) {
  const def = customsCatalog()[type] || {};
  return {
    id: newId('c'),
    kind: 'control',
    type,
    ...(def.defaults ? JSON.parse(JSON.stringify(def.defaults)) : {}),
  };
}

/**
 * Which custom params may be overridden when a preset is attached to a block.
 * Label is shown via a universal field (skip catalog `label` to avoid duplicates).
 */
function canOverridePresetParam(controlType, key) {
  if (key === 'label') {
    return false;
  }
  return true;
}

function optionIconKey(item) {
  if (item?.kind === 'preset') {
    return 'box';
  }
  const type = item?.type || '';
  if (isCustomType(type)) {
    return 'extensions';
  }
  if (type === 'boolean') {
    return 'toggle';
  }
  if (type === 'button-group') {
    return 'button_group';
  }
  return type || 'text';
}

function optionPreviewTitle(item) {
  if (item?.kind === 'preset') {
    const preset = presetsCatalog().find((p) => p.slug === item.slug);
    return (preset?.label || item.slug || '').trim();
  }
  return String(item?.label || '').trim();
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
    options:
      type === 'button-group'
        ? [
            { label: 'A', value: '', icon: '' },
            { label: 'B', value: '-option-b', icon: '' },
          ]
        : [
            { label: 'A', value: '' },
            { label: 'B', value: '-option-b' },
          ],
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
 * @param {object} [options]
 */
export function createOptionsPanel(initial, onChange, options = {}) {
  panelOptions = {
    allowCustoms: !!options.allowCustoms,
    allowPresetRefs: options.allowPresetRefs !== false,
    customs: options.customs ?? null,
    presets: options.presets ?? null,
    helpText: options.helpText,
    emptyText: options.emptyText || null,
  };

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

  const canvas = el('div', { className: 'bl-forms-builder__canvas bl-bo-canvas' });
  const list = el('div', { className: 'bl-forms-builder__list bl-bo-stack' });
  const emptyMessage =
    panelOptions.emptyText ||
    (panelOptions.allowPresetRefs
      ? t('blockOptionsEmpty', 'No options yet. Add a control or attach a preset.')
      : t('presetItemsEmpty', 'No options yet. Add a control.'));
  const empty = el('p', {
    className: 'bl-forms-builder__empty bl-bo-stack__empty',
    text: emptyMessage,
  });
  canvas.append(list, empty);

  /** @type {string|null} */
  let openItemId = null;
  /** @type {{ destroy?: Function }|null} */
  let sortable = null;

  const sync = () => {
    onChange({ items: JSON.parse(JSON.stringify(items)) });
  };

  const indexOf = (id) => items.findIndex((row) => row.id === id);

  const removeById = (id) => {
    const index = indexOf(id);
    if (index < 0) {
      return;
    }
    items.splice(index, 1);
    if (openItemId === id) {
      openItemId = null;
    }
    sync();
    render();
  };

  const patchById = (id, next) => {
    const index = indexOf(id);
    if (index < 0) {
      return;
    }
    items[index] = next;
    sync();
  };

  const replaceById = (id, next) => {
    const index = indexOf(id);
    if (index < 0) {
      return;
    }
    items[index] = next;
    openItemId = next.id || id;
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
      const tokens = ptype === 'size' ? sizeTokensFromParam(paramDef) : ALIGN_TOKENS;
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

  function patchPresetDefault(item, controlId, patch) {
    const defaults = { ...(item.defaults || {}) };
    defaults[controlId] = { ...(defaults[controlId] || {}), ...patch };
    const next = { ...item, defaults };
    patchById(item.id, next);
    Object.assign(item, next);
  }

  function renderCustomParams(item) {
    const wrap = el('div', { className: 'bl-bo-custom-params' });
    const def = customsCatalog()[item.type];
    if (!def?.params) {
      return wrap;
    }
    Object.entries(def.params).forEach(([key, paramDef]) => {
      wrap.appendChild(
        renderParamField(key, paramDef, item[key], (nextVal) => {
          const next = { ...item, [key]: nextVal };
          patchById(item.id, next);
          Object.assign(item, next);
          if (key === 'label') {
            list.querySelector(`[data-option-id="${CSS.escape(item.id)}"]`)?._blUpdatePreview?.();
          }
        })
      );
    });
    return wrap;
  }

  function renderChoices(item) {
    const wrap = el('div', { className: 'bl-bo-choices' });
    const showIconPicker = item.type === 'button-group';

    (item.options || []).forEach((opt, oi) => {
      const children = [
        el('input', {
          type: 'text',
          className: 'bl-bo-choice__label',
          value: opt.label || '',
          placeholder: t('choiceLabel', 'Label'),
          onInput: (e) => {
            const options = JSON.parse(JSON.stringify(item.options || []));
            options[oi] = { ...options[oi], label: e.target.value };
            patchById(item.id, { ...item, options });
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
            patchById(item.id, { ...item, options });
            item.options = options;
          },
        }),
      ];

      if (showIconPicker) {
        let currentIcon = String(opt.icon || '');
        const pickBtn = el('button', {
          type: 'button',
          className: 'bl-bo-choice__icon-btn',
          title: t('chooseIcon', 'Choose icon'),
          'aria-label': t('chooseIcon', 'Choose icon'),
        });
        const clearBtn = el('button', {
          type: 'button',
          className: 'bl-bo-choice__icon-clear',
          title: t('clearIcon', 'Clear icon'),
          'aria-label': t('clearIcon', 'Clear icon'),
        });
        const clearIcon = typeof iconEl === 'function' ? iconEl('close') : null;
        if (clearIcon?.innerHTML) {
          clearBtn.appendChild(clearIcon);
        } else {
          clearBtn.textContent = '×';
        }
        const iconUnit = el('div', { className: 'bl-bo-choice__icon' }, [pickBtn, clearBtn]);

        const syncIconPreview = (slug) => {
          currentIcon = slug || '';
          iconUnit.classList.toggle('has-icon', !!currentIcon);
          pickBtn.replaceChildren();
          if (currentIcon) {
            pickBtn.appendChild(
              el('span', { className: 'bl-icon -icon-' + currentIcon, 'aria-hidden': 'true' })
            );
          } else {
            pickBtn.appendChild(
              el('span', {
                className: 'bl-bo-choice__icon-label',
                text: t('icon', 'Icon'),
              })
            );
          }
        };

        const commitIcon = (slug) => {
          syncIconPreview(slug);
          const options = JSON.parse(JSON.stringify(item.options || []));
          options[oi] = { ...options[oi], icon: slug || '' };
          patchById(item.id, { ...item, options });
          item.options = options;
        };

        syncIconPreview(currentIcon);

        pickBtn.addEventListener('click', async (evt) => {
          evt.preventDefault();
          evt.stopPropagation();
          try {
            const { openIconPicker } = await import(
              '../../../../../../src/js/editor/icons/icon-picker-service.js'
            );
            openIconPicker({
              currentValue: currentIcon || '',
              returnFocus: pickBtn,
              onSelect: (iconName) => commitIcon(iconName || ''),
            });
          } catch (err) {
            // Icon picker unavailable.
          }
        });

        clearBtn.addEventListener('click', (evt) => {
          evt.preventDefault();
          evt.stopPropagation();
          commitIcon('');
        });

        children.push(iconUnit);
      }

      const deleteBtn = el('button', {
        type: 'button',
        className: 'bl-bo-choice__remove',
        title: t('delete', 'Delete'),
        'aria-label': t('delete', 'Delete'),
        onClick: () => {
          const options = JSON.parse(JSON.stringify(item.options || []));
          options.splice(oi, 1);
          replaceById(item.id, { ...item, options });
        },
      });
      const removeIcon = typeof iconEl === 'function' ? iconEl('close') : null;
      if (removeIcon?.innerHTML) {
        deleteBtn.appendChild(removeIcon);
      } else {
        deleteBtn.textContent = '×';
      }
      children.push(deleteBtn);

      wrap.appendChild(el('div', { className: 'bl-bo-choice' }, children));
    });

    wrap.appendChild(
      el('button', {
        type: 'button',
        className: 'button button-small bl-bo-choices__add',
        text: t('addChoice', 'Add choice'),
        onClick: () => {
          const options = JSON.parse(JSON.stringify(item.options || []));
          const next =
            item.type === 'button-group'
              ? { label: 'Option', value: '', icon: '' }
              : { label: 'Option', value: '' };
          options.push(next);
          replaceById(item.id, { ...item, options });
        },
      })
    );
    return wrap;
  }

  function setOpen(row, header, nextOpen) {
    if (nextOpen) {
      list.querySelectorAll(':scope > .bl-forms-builder__field.is-open').forEach((other) => {
        if (other === row) {
          return;
        }
        other.classList.remove('is-open');
        const otherHeader = other.querySelector(':scope > .bl-forms-builder__field-header');
        if (otherHeader) {
          otherHeader.setAttribute('aria-expanded', 'false');
          otherHeader.setAttribute('aria-label', t('expandField', 'Expand field'));
        }
      });
      openItemId = row.dataset.optionId || null;
    } else if (openItemId === row.dataset.optionId) {
      openItemId = null;
    }

    row.classList.toggle('is-open', nextOpen);
    header.setAttribute('aria-expanded', nextOpen ? 'true' : 'false');
    header.setAttribute(
      'aria-label',
      nextOpen ? t('collapseField', 'Collapse field') : t('expandField', 'Expand field')
    );
  }

  function wrapOptionCard(item, editor) {
    const open = openItemId === item.id;
    const row = el('div', {
      className:
        'bl-forms-builder__field bl-bo-option' +
        (item.kind === 'preset' ? ' bl-bo-option--preset' : '') +
        (open ? ' is-open' : ''),
      dataset: { optionId: item.id },
    });

    const preview = el('span', { className: 'bl-forms-builder__preview' });
    const updatePreview = () => {
      const title = optionPreviewTitle(item);
      preview.textContent = title;
      preview.hidden = title === '';
    };
    updatePreview();
    row._blUpdatePreview = updatePreview;

    const typeChip = el('span', { className: 'bl-forms-builder__field-type' }, [
      iconEl(optionIconKey(item), 'bl-forms-builder__field-type-icon'),
      el('span', {
        className: 'bl-forms-builder__field-type-label',
        text: typeLabel(item),
      }),
    ]);

    const deleteBtn = el('button', {
      type: 'button',
      className: 'bl-forms-builder__icon-btn bl-forms-builder__icon-btn--danger',
      title: t('delete', 'Delete'),
      'aria-label': t('delete', 'Delete'),
      onClick: (evt) => {
        evt.preventDefault();
        evt.stopPropagation();
        removeById(item.id);
      },
    });
    const trashIcon = typeof iconEl === 'function' ? iconEl('trash') : el('span');
    if (trashIcon.innerHTML) {
      deleteBtn.appendChild(trashIcon);
    } else {
      deleteBtn.textContent = '×';
    }

    const handle = el('span', {
      className: 'bl-forms-builder__handle',
      title: t('dragField', 'Drag to reorder'),
      'aria-hidden': 'true',
    });
    const dragIcon = typeof iconEl === 'function' ? iconEl('drag') : el('span');
    if (dragIcon.innerHTML) {
      handle.appendChild(dragIcon);
    } else {
      handle.textContent = '⋮⋮';
    }
    handle.addEventListener('click', (evt) => {
      evt.stopPropagation();
    });

    const header = el(
      'div',
      {
        className: 'bl-forms-builder__field-header bl-forms-builder__field-header--expandable',
        role: 'button',
        tabindex: '0',
        'aria-expanded': open ? 'true' : 'false',
        'aria-label': open
          ? t('collapseField', 'Collapse field')
          : t('expandField', 'Expand field'),
      },
      [
        handle,
        preview,
        el('div', { className: 'bl-forms-builder__field-meta' }, [typeChip]),
        el('div', { className: 'bl-forms-builder__field-actions' }, [deleteBtn]),
      ]
    );

    header.addEventListener('click', (evt) => {
      if (evt.target.closest('.bl-forms-builder__icon-btn, .bl-forms-builder__handle')) {
        return;
      }
      setOpen(row, header, !row.classList.contains('is-open'));
    });
    header.addEventListener('keydown', (evt) => {
      if (evt.target !== header || (evt.key !== 'Enter' && evt.key !== ' ')) {
        return;
      }
      evt.preventDefault();
      setOpen(row, header, !row.classList.contains('is-open'));
    });

    const body = el('div', { className: 'bl-forms-builder__field-body' }, [
      el('div', { className: 'bl-bo-option__editor' }, [editor]),
    ]);

    row.append(header, body);
    return row;
  }

  function renderPresetEditor(item) {
    const editor = el('div', { className: 'bl-bo-option__fields' });
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
      replaceById(item.id, { ...item, slug: slugSelect.value, defaults: {} });
    });

    editor.appendChild(
      el('div', { className: 'bl-bo-field' }, [
        el('label', { text: t('choosePreset', 'Preset') }),
        slugSelect,
      ])
    );

    const selected = presets.find((p) => p.slug === (slugSelect.value || item.slug));
    const controls = Array.isArray(selected?.items)
      ? selected.items.filter((c) => c && c.kind === 'control')
      : [];

    if (controls.length > 0) {
      editor.appendChild(
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
              onInput: (e) => patchPresetDefault(item, controlId, { label: e.target.value }),
            }),
          ])
        );
        section.appendChild(
          renderDescriptionField(overrideDescription, (nextVal) =>
            patchPresetDefault(item, controlId, { description: nextVal })
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
                patchPresetDefault(item, control.id, { [key]: nextVal });
              })
            );
          });
        } else if (control.type === 'boolean') {
          const check = el('input', {
            type: 'checkbox',
            checked: !!(item.defaults?.[control.id]?.default ?? control.default),
          });
          check.addEventListener('change', () => {
            patchPresetDefault(item, control.id, { default: check.checked });
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
            patchPresetDefault(item, control.id, { default: select.value });
          });
          section.appendChild(
            el('div', { className: 'bl-bo-field' }, [
              el('label', { text: t('defaultValue', 'Default') }),
              select,
            ])
          );
        }

        editor.appendChild(section);
      });
    }

    return editor;
  }

  function buildTypeSelect(item) {
    // On block Options, customs are attach-only via presets — read-only if present.
    if (!panelOptions.allowCustoms && isCustomType(item.type)) {
      return el('input', {
        type: 'text',
        value: customsCatalog()[item.type]?.label || item.type,
        readOnly: true,
        disabled: true,
      });
    }

    const typeSelect = el('select', { className: 'bl-bo-card__type' });

    if (panelOptions.allowCustoms) {
      const defaultGroup = el('optgroup', {
        label: t('optionGroupDefault', 'Default'),
      });
      GENERIC_TYPES.forEach((row) => {
        defaultGroup.appendChild(
          el('option', {
            value: row.id,
            text: t(row.labelKey, row.labelFallback),
            selected: item.type === row.id ? true : undefined,
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
              text: def.label || type,
              selected: item.type === type ? true : undefined,
            })
          );
        });
        typeSelect.appendChild(customGroup);
      }
    } else {
      GENERIC_TYPES.forEach((row) => {
        typeSelect.appendChild(
          el('option', {
            value: row.id,
            text: t(row.labelKey, row.labelFallback),
            selected: item.type === row.id ? true : undefined,
          })
        );
      });
    }

    typeSelect.value = item.type;
    typeSelect.addEventListener('change', () => {
      const type = typeSelect.value;
      const next =
        panelOptions.allowCustoms && isCustomType(type)
          ? defaultCustom(type)
          : defaultGeneric(type);
      next.id = item.id;
      replaceById(item.id, next);
    });
    return typeSelect;
  }

  function renderControlEditor(item) {
    const editor = el('div', { className: 'bl-bo-option__fields' });
    const custom = isCustomType(item.type);

    editor.appendChild(
      el('div', { className: 'bl-bo-field' }, [
        el('label', { text: t('optionType', 'Type') }),
        buildTypeSelect(item),
      ])
    );

    if (custom) {
      editor.appendChild(renderCustomParams(item));
      editor.appendChild(
        renderDescriptionField(item.description || '', (nextVal) => {
          const next = { ...item, description: nextVal };
          patchById(item.id, next);
          Object.assign(item, next);
        })
      );
      return editor;
    }

    const attrInput = el('input', {
      type: 'text',
      value: item.attributeName || '',
      onInput: (e) => {
        manualAttr.add(item.id);
        const next = { ...item, attributeName: e.target.value };
        patchById(item.id, next);
        Object.assign(item, next);
      },
    });

    editor.appendChild(
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
            patchById(item.id, next);
            Object.assign(item, next);
            if (!manualAttr.has(item.id)) {
              attrInput.value = next.attributeName;
            }
            const row = list.querySelector(`[data-option-id="${item.id}"]`);
            row?._blUpdatePreview?.();
          },
        }),
      ])
    );

    editor.appendChild(
      renderDescriptionField(item.description || '', (nextVal) => {
        const next = { ...item, description: nextVal };
        patchById(item.id, next);
        Object.assign(item, next);
      })
    );

    editor.appendChild(
      el('div', { className: 'bl-bo-field' }, [
        el('label', { text: t('attributeName', 'Attribute name') }),
        attrInput,
      ])
    );

    if (item.type === 'boolean') {
      editor.appendChild(
        el('div', { className: 'bl-bo-field' }, [
          el('label', { text: t('toggleLabel', 'Toggle label') }),
          el('input', {
            type: 'text',
            value: item.toggleLabel || '',
            onInput: (e) => {
              const next = { ...item, toggleLabel: e.target.value };
              patchById(item.id, next);
              Object.assign(item, next);
            },
          }),
        ])
      );
      editor.appendChild(
        el('div', { className: 'bl-bo-field' }, [
          el('label', { text: t('classWhenOn', 'CSS class when on') }),
          el('input', {
            type: 'text',
            value: item.className || '',
            onInput: (e) => {
              const next = { ...item, className: e.target.value };
              patchById(item.id, next);
              Object.assign(item, next);
            },
          }),
        ])
      );
      const defCheck = el('input', { type: 'checkbox', checked: !!item.default });
      defCheck.addEventListener('change', () => {
        const next = { ...item, default: defCheck.checked };
        patchById(item.id, next);
        Object.assign(item, next);
      });
      editor.appendChild(
        el('label', { className: 'bl-bo-check' }, [
          defCheck,
          document.createTextNode(' ' + t('defaultOn', 'On by default')),
        ])
      );
    }

    if (item.type === 'select' || item.type === 'button-group') {
      editor.appendChild(
        el('div', { className: 'bl-bo-field' }, [
          el('label', { text: t('choices', 'Choices') }),
          renderChoices(item),
        ])
      );
    }

    return editor;
  }

  function renderCard(item) {
    if (item?.kind === 'preset') {
      return wrapOptionCard(item, renderPresetEditor(item));
    }
    return wrapOptionCard(item, renderControlEditor(item));
  }

  function bindSortable() {
    const Canvas = canvasApi();
    if (sortable && typeof sortable.destroy === 'function') {
      sortable.destroy();
      sortable = null;
    }
    if (typeof Canvas.createSortable !== 'function' || items.length === 0) {
      return;
    }
    sortable = Canvas.createSortable(list, {
      handle: '.bl-forms-builder__handle',
      draggable: '.bl-forms-builder__field',
      animation: 150,
      onStart: () => {
        if (typeof Canvas.dragStart === 'function') {
          Canvas.dragStart();
        }
      },
      onEnd: () => {
        if (typeof Canvas.dragEnd === 'function') {
          Canvas.dragEnd();
        }
        const ordered = [];
        list.querySelectorAll(':scope > [data-option-id]').forEach((row) => {
          const found = items.find((i) => i.id === row.dataset.optionId);
          if (found) {
            ordered.push(found);
          }
        });
        if (ordered.length === items.length) {
          items = ordered;
          sync();
        }
      },
    });
  }

  function render() {
    list.replaceChildren();
    empty.hidden = items.length > 0;
    items.forEach((item) => {
      list.appendChild(renderCard(item));
    });
    bindSortable();
  }

  const addRow = el('div', { className: 'bl-bo-add' });

  const makeAddButton = (label, onClick) => {
    const btn = el('button', {
      type: 'button',
      className: 'button button-secondary bl-button-small bl-bo-add__btn',
      onClick,
    });
    const icon = typeof iconEl === 'function' ? iconEl('plus', 'bl-bo-add__icon') : null;
    if (icon?.innerHTML) {
      btn.appendChild(icon);
    }
    btn.appendChild(document.createTextNode(label));
    return btn;
  };

  addRow.appendChild(
    makeAddButton(t('addOption', 'Add option'), () => {
      const next = defaultGeneric('boolean');
      items.push(next);
      openItemId = next.id;
      sync();
      render();
    })
  );
  if (panelOptions.allowPresetRefs) {
    addRow.appendChild(
      makeAddButton(t('addPresetRef', t('addPreset', 'Preset')), () => {
        const presets = presetsCatalog();
        if (presets.length === 0) {
          window.alert(
            t('noPresetsYet', 'No presets yet — create some under Block Options → Presets')
          );
          return;
        }
        const next = defaultPresetRef(presets[0].slug);
        items.push(next);
        openItemId = next.id;
        sync();
        render();
      })
    );
  }

  const helpText =
    panelOptions.helpText === false || panelOptions.helpText === null
      ? null
      : panelOptions.helpText !== undefined
        ? panelOptions.helpText
        : t(
            'blockOptionsHelp',
            'These controls appear in the block sidebar in the editor.'
          );

  if (helpText) {
    panel.appendChild(el('p', { className: 'description', text: helpText }));
  }
  panel.append(canvas, addRow);

  render();

  return {
    panel,
    getBlockOptions: () => ({ items: JSON.parse(JSON.stringify(items)) }),
  };
}
