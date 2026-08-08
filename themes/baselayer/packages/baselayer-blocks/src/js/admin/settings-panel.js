/**
 * Type-aware Settings panel for Blocks / Content Fields / Website Fields definitions.
 */
const { el, t, writeConfig } = window.BlFormBuilder || {};

const MATERIAL_ICONS_URL = 'https://fonts.google.com/icons?icon.style=Rounded';

function fieldRow(label, control, help = '') {
  const children = [el('p', {}, [el('label', { text: label }), control])];
  if (help) {
    children.push(el('p', { className: 'description', text: help }));
  }
  return el('div', { className: 'bl-forms-builder__setting' }, children);
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

function isSvgValue(value) {
  return typeof value === 'string' && value.trim().toLowerCase().includes('<svg');
}

function hasThemeIconPicker() {
  return !!(window.baselayerIcons && window.blBlocksAdmin && window.blBlocksAdmin.hasIconPicker);
}

/** Title → settings slug (hyphenated); empty title → empty slug. */
function slugifyFromTitle(text) {
  return String(text || '')
    .trim()
    .toLowerCase()
    .replace(/ä/g, 'ae')
    .replace(/ö/g, 'oe')
    .replace(/ü/g, 'ue')
    .replace(/ß/g, 'ss')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-+/g, '-');
}

/**
 * Block icon: theme catalog picker + SVG paste + Material Icons link.
 *
 * @param {string} initial
 * @param {(next: string) => void} onChange
 */
function createBlockIconField(initial, onChange) {
  let value = initial || 'block-default';
  const usePicker = hasThemeIconPicker();

  const preview = el('div', {
    className: 'bl-blocks-icon-field__preview',
    dataset: { blBlocksIconPreview: '' },
  });
  const empty = el('span', {
    className: 'bl-blocks-icon-field__empty description',
    text: t('blockIconEmpty', 'No icon selected'),
    dataset: { blBlocksIconEmpty: '' },
  });

  const hidden = el('input', {
    type: 'hidden',
    value,
    dataset: { blBlocksIconValue: '' },
  });

  const textarea = el('textarea', {
    className: 'large-text code',
    rows: 4,
    placeholder: '<svg …>',
    dataset: { blBlocksIconSvg: '' },
  });
  if (isSvgValue(value)) {
    textarea.value = value;
  }

  const svgPanel = el(
    'div',
    {
      className: 'bl-blocks-icon-field__svg-panel',
      dataset: { blBlocksIconSvgPanel: '' },
      hidden: true,
    },
    [
      el('label', {}, [
        el('strong', { text: t('blockIconSvg', 'SVG code') }),
      ]),
      textarea,
      el('p', { className: 'description' }, [
        document.createTextNode(t('blockIconMaterialHelp', 'Browse Material Icons, copy SVG, and paste here: ')),
        el('a', {
          href: MATERIAL_ICONS_URL,
          target: '_blank',
          rel: 'noopener noreferrer',
          text: t('blockIconMaterialLink', 'fonts.google.com/icons'),
        }),
      ]),
    ]
  );

  const chooseBtn = usePicker
    ? el('button', {
        type: 'button',
        className: 'button',
        text: t('blockIconChoose', 'Choose icon'),
        dataset: { blBlocksIconChoose: '' },
      })
    : null;

  const svgToggle = el('button', {
    type: 'button',
    className: 'button',
    text: t('blockIconSvgToggle', 'SVG code'),
    'aria-expanded': 'false',
    dataset: { blBlocksIconSvgToggle: '' },
  });

  const clearBtn = el('button', {
    type: 'button',
    className: 'button-link',
    text: t('blockIconClear', 'Clear'),
    dataset: { blBlocksIconClear: '' },
  });

  const actions = el('div', { className: 'bl-blocks-icon-field__actions' }, [
    chooseBtn,
    svgToggle,
    clearBtn,
  ].filter(Boolean));

  const root = el('div', { className: 'bl-blocks-icon-field', dataset: { blBlocksIconField: '' } }, [
    el('div', { className: 'bl-blocks-icon-field__row' }, [preview, empty, actions]),
    hidden,
    svgPanel,
  ]);

  const setSvgOpen = (open) => {
    svgPanel.hidden = !open;
    svgToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    svgToggle.classList.toggle('is-active', open);
  };

  const syncPreview = () => {
    const trimmed = (value || '').trim();
    preview.replaceChildren();
    preview.hidden = trimmed === '';
    empty.hidden = trimmed !== '';
    if (trimmed === '') {
      return;
    }
    if (isSvgValue(trimmed)) {
      const wrap = el('span', { className: 'bl-blocks-icon-field__svg' });
      wrap.innerHTML = trimmed;
      preview.appendChild(wrap);
      return;
    }
    if (trimmed.indexOf('dashicons-') === 0 || trimmed === 'block-default') {
      const dash = trimmed.indexOf('dashicons-') === 0 ? trimmed : 'dashicons-' + trimmed;
      preview.appendChild(el('span', { className: 'dashicons ' + dash, 'aria-hidden': 'true' }));
      return;
    }
    preview.appendChild(
      el('span', {
        className: 'bl-icon -icon-' + trimmed.replace(/[^a-z0-9_-]/gi, ''),
        'aria-hidden': 'true',
      })
    );
  };

  const commit = (next, { openSvg = false } = {}) => {
    value = next == null ? '' : String(next);
    hidden.value = value;
    if (isSvgValue(value) || openSvg) {
      textarea.value = isSvgValue(value) ? value : textarea.value;
    } else if (!openSvg) {
      textarea.value = '';
    }
    syncPreview();
    onChange(value || 'block-default');
    if (openSvg) {
      setSvgOpen(true);
    }
  };

  if (chooseBtn) {
    chooseBtn.addEventListener('click', async () => {
      try {
        const { openIconPicker } = await import(
          '../../../../../src/js/editor/icons/icon-picker-service.js'
        );
        openIconPicker({
          currentValue: isSvgValue(value) ? '' : value,
          returnFocus: chooseBtn,
          onSelect: (iconName) => {
            commit(iconName);
            setSvgOpen(false);
          },
        });
      } catch (err) {
        setSvgOpen(true);
        textarea.focus();
      }
    });
  }

  svgToggle.addEventListener('click', () => {
    const willOpen = svgPanel.hidden;
    setSvgOpen(willOpen);
    if (willOpen) {
      textarea.focus();
    }
  });

  textarea.addEventListener('input', () => {
    commit(textarea.value, { openSvg: true });
  });

  clearBtn.addEventListener('click', () => {
    commit('block-default');
    setSvgOpen(false);
    textarea.value = '';
  });

  syncPreview();

  return root;
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

  const { root: sidebarEditingRow } = plainSwitch(
    t('settingsSidebarEditing', 'Allow editing directly in sidebar'),
    {
      checked: !!state.sidebar_editing,
      onChange: (checked) => {
        state.sidebar_editing = checked;
        notify();
      },
    }
  );

  const { root: innerBlocksRow } = plainSwitch(
    t('settingsSupportsInnerBlocks', 'Allow nested blocks'),
    {
      checked: !!state.supports_inner_blocks,
      onChange: (checked) => {
        state.supports_inner_blocks = checked;
        syncInnerBlocksOptionsVisibility();
        notify();
      },
    }
  );

  const allowedInput = el('input', {
    type: 'text',
    className: 'widefat',
    value: state.inner_blocks_allowed || '',
    placeholder: 'core/heading, core/paragraph',
  });
  allowedInput.addEventListener('input', () => {
    state.inner_blocks_allowed = allowedInput.value;
    notify();
  });

  const templateInput = el('textarea', {
    className: 'widefat code',
    rows: 3,
    text: state.inner_blocks_template || '',
    placeholder: '[["core/paragraph",{}]]',
  });
  templateInput.addEventListener('input', () => {
    state.inner_blocks_template = templateInput.value;
    notify();
  });

  const innerBlocksAllowedRow = fieldRow(
    t('settingsInnerBlocksAllowed', 'Allowed nested blocks'),
    allowedInput,
    t(
      'settingsInnerBlocksAllowedHelp',
      'Comma-separated block names (e.g. core/heading, core/paragraph). Used when generating the starter template; you can also set allowedBlocks on the InnerBlocks tag in the PHP file. Leave empty to allow all blocks.'
    )
  );
  const innerBlocksTemplateRow = fieldRow(
    t('settingsInnerBlocksTemplate', 'Default nested template'),
    templateInput,
    t(
      'settingsInnerBlocksTemplateHelp',
      'Optional JSON array of [blockName, attributes] pairs for the starter template, e.g. [["core/paragraph",{}]]. Prefer the template attribute on the InnerBlocks tag in PHP for the live block. Leave empty for no default.'
    )
  );

  const syncInnerBlocksOptionsVisibility = () => {
    const show = !!state.supports_inner_blocks;
    innerBlocksAllowedRow.hidden = !show;
    innerBlocksTemplateRow.hidden = !show;
  };
  syncInnerBlocksOptionsVisibility();

  const parentInput = el('input', {
    type: 'text',
    className: 'widefat',
    value: state.parent || '',
    placeholder: 'baselayer/slider',
  });
  parentInput.addEventListener('input', () => {
    state.parent = parentInput.value;
    notify();
  });
  const parentHelp = t(
    'settingsParentHelp',
    'Comma-separated block names this block may be inserted into (e.g. baselayer/slider). Registration only — not part of the PHP markup. Leave empty for top-level.'
  );
  const parentRow = el('div', { className: 'bl-forms-builder__setting' }, [
    el('p', {}, [parentInput]),
    el('p', { className: 'description', text: parentHelp }),
  ]);

  const ALIGN_SUPPORT_OPTIONS = [
    { value: 'wide', labelKey: 'settingsAlignWide', fallback: 'Wide (alignwide)' },
    { value: 'full', labelKey: 'settingsAlignFull', fallback: 'Full (alignfull)' },
    { value: 'left', labelKey: 'settingsAlignLeft', fallback: 'Left' },
    { value: 'center', labelKey: 'settingsAlignCenter', fallback: 'Center' },
    { value: 'right', labelKey: 'settingsAlignRight', fallback: 'Right' },
  ];

  const parseAlignSupports = (raw) => {
    const allowed = new Set(ALIGN_SUPPORT_OPTIONS.map((o) => o.value));
    return String(raw || '')
      .split(/[\s,]+/)
      .map((p) => p.trim().toLowerCase())
      .filter((p) => p !== '' && allowed.has(p));
  };

  let selectedAlign = parseAlignSupports(state.align);

  const syncAlignState = () => {
    state.align = selectedAlign.join(', ');
    notify();
  };

  const syncAlignButtons = () => {
    alignGroup.querySelectorAll('button[data-value]').forEach((node) => {
      const on = selectedAlign.includes(node.dataset.value);
      node.classList.toggle('is-active', on);
      node.setAttribute('aria-pressed', on ? 'true' : 'false');
    });
  };

  const alignGroup = el('div', {
    className: 'bl-blocks-align-supports',
    role: 'group',
    'aria-label': t('settingsAlign', 'Alignment supports'),
  });

  const appendAlignBtn = (opt) => {
    const label = t(opt.labelKey, opt.fallback);
    const btn = el('button', {
      type: 'button',
      className:
        'button bl-button-small bl-blocks-align-supports__btn' +
        (selectedAlign.includes(opt.value) ? ' is-active' : ''),
      text: label,
      dataset: { value: opt.value },
      'aria-pressed': selectedAlign.includes(opt.value) ? 'true' : 'false',
      onClick: () => {
        if (selectedAlign.includes(opt.value)) {
          selectedAlign = selectedAlign.filter((v) => v !== opt.value);
        } else {
          selectedAlign = [...selectedAlign, opt.value];
        }
        // Keep a stable option order in storage.
        const order = ALIGN_SUPPORT_OPTIONS.map((o) => o.value);
        selectedAlign = order.filter((v) => selectedAlign.includes(v));
        syncAlignButtons();
        syncAlignState();
      },
    });
    alignGroup.appendChild(btn);
  };

  // Wide / full first, then left / center / right — separator between groups.
  ALIGN_SUPPORT_OPTIONS.slice(0, 2).forEach(appendAlignBtn);
  alignGroup.appendChild(
    el('span', {
      className: 'bl-blocks-align-supports__sep',
      'aria-hidden': 'true',
    })
  );
  ALIGN_SUPPORT_OPTIONS.slice(2).forEach(appendAlignBtn);

  const alignRow = fieldRow(
    t('settingsAlign', 'Alignment supports'),
    alignGroup,
    t(
      'settingsAlignHelp',
      'Select which alignments this block offers in the editor. Leave none selected for no alignment options.'
    )
  );

  const slugInput = el('input', {
    type: 'text',
    className: 'widefat',
    value: state.slug || '',
    pattern: '[a-z0-9\\-]*',
  });

  // Auto-fill slug from the WP title on new definitions until the user edits slug.
  const allowAutoSlug =
    document.body.classList.contains('post-new-php') && !(state.slug || '').trim();
  let slugManual = !allowAutoSlug;

  const applySlug = (next, { manual = false } = {}) => {
    const cleaned = String(next || '')
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, '');
    if (manual) {
      slugManual = true;
    }
    state.slug = cleaned;
    slugInput.value = cleaned;
    notify();
  };

  slugInput.addEventListener('input', () => {
    applySlug(slugInput.value, { manual: true });
  });

  if (allowAutoSlug) {
    const titleInput = document.getElementById('title');
    if (titleInput) {
      const syncFromTitle = () => {
        if (slugManual) {
          return;
        }
        applySlug(slugifyFromTitle(titleInput.value));
      };
      titleInput.addEventListener('input', syncFromTitle);
      titleInput.addEventListener('change', syncFromTitle);
      if (titleInput.value.trim()) {
        syncFromTitle();
      }
    }
  }

  const descInput = el('textarea', {
    className: 'widefat',
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
  ];

  if (definitionType === 'block' || definitionType === 'page_settings') {
    children.push(sidebarEditingRow);
  }

  children.push(
    fieldRow(t('settingsSlug', 'Slug'), slugInput, t('settingsSlugHelp', '')),
    fieldRow(t('settingsDescription', 'Description'), descInput)
  );

  if (definitionType === 'block') {
    const iconField = createBlockIconField(state.block_icon || 'block-default', (next) => {
      state.block_icon = next;
      notify();
    });

    const categories = (window.blBlocksAdmin && window.blBlocksAdmin.blockCategories) || [];
    const categorySelect = el('select', { className: 'widefat' });
    const currentCat = state.block_category || 'widgets';
    let hasCurrent = false;
    categories.forEach((cat) => {
      const opt = el('option', {
        value: cat.slug,
        text: cat.title || cat.slug,
      });
      if (cat.slug === currentCat) {
        opt.selected = true;
        hasCurrent = true;
      }
      categorySelect.appendChild(opt);
    });
    if (!hasCurrent && currentCat) {
      categorySelect.appendChild(
        el('option', { value: currentCat, text: currentCat, selected: true })
      );
    }
    if (categories.length === 0) {
      ['text', 'media', 'design', 'widgets', 'theme', 'embed'].forEach((slug) => {
        const opt = el('option', { value: slug, text: slug });
        if (slug === currentCat) opt.selected = true;
        categorySelect.appendChild(opt);
      });
    }
    categorySelect.addEventListener('change', () => {
      state.block_category = categorySelect.value || 'widgets';
      notify();
    });

    const keywordsInput = el('input', {
      type: 'text',
      className: 'widefat',
      value: state.block_keywords || '',
    });
    keywordsInput.addEventListener('input', () => {
      state.block_keywords = keywordsInput.value;
      notify();
    });

    // Prefer post title; drop legacy block_title from saved settings.
    delete state.block_title;

    children.push(
      fieldRow(t('blockIcon', 'Block icon'), iconField),
      fieldRow(t('blockCategory', 'Block category'), categorySelect),
      fieldRow(t('blockKeywords', 'Keywords'), keywordsInput, t('blockKeywordsHelp', '')),
      alignRow,
      el('h3', {
        className: 'bl-forms-builder__section-title',
        text: t('settingsInnerBlocksSection', 'InnerBlocks'),
      }),
      innerBlocksRow,
      innerBlocksAllowedRow,
      innerBlocksTemplateRow,
      el('h3', {
        className: 'bl-forms-builder__section-title',
        text: t('settingsParent', 'Parent blocks'),
      }),
      parentRow
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
      className: 'widefat',
      value: state.menu_label || '',
    });
    labelInput.addEventListener('input', () => {
      state.menu_label = labelInput.value;
      notify();
    });
    children.push(fieldRow(t('menuLabel', 'Tab label'), labelInput, t('menuLabelHelp', '')));
  }

  if (definitionType === 'page_settings' || definitionType === 'site_settings') {
    const orderInput = el('input', {
      type: 'number',
      className: 'small-text',
      value: String(state.menu_order != null ? state.menu_order : 1),
    });
    orderInput.addEventListener('input', () => {
      state.menu_order = parseInt(orderInput.value, 10) || 0;
      notify();
    });
    children.push(fieldRow(t('menuOrder', 'Order'), orderInput));
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
