/**
 * Blocks → Block Options — System / BaseLayer / ACF lists + Presets editor.
 */
function boot() {
  const root = document.getElementById('bl-block-options-app');
  if (!root) {
    return;
  }

  const cfg = window.blBlockOptionsAdmin || {};
  const i18n = cfg.i18n || {};
  const t = (key, fallback) => i18n[key] || fallback;
  const customs = cfg.customs || {};

  const SPACING_SIZE_CHOICES = [
    ['', '—'],
    ['none', '0'],
    ['xs', 'XS'],
    ['s', 'S'],
    ['m', 'M'],
    ['l', 'L'],
    ['xl', 'XL'],
  ];

  const sizeChoicesForParam = (paramDef) => {
    const choices = paramDef?.choices;
    if (choices && typeof choices === 'object' && !Array.isArray(choices)) {
      return Object.entries(choices).map(([value, label]) => [value, String(label)]);
    }
    return SPACING_SIZE_CHOICES;
  };

  let presets = Array.isArray(cfg.presets)
    ? JSON.parse(JSON.stringify(cfg.presets))
    : [];
  let blocks = Array.isArray(cfg.blocks)
    ? JSON.parse(JSON.stringify(cfg.blocks))
    : [];

  let active = 'system';
  let editingPresetSlug = null;
  let editingBlockName = null;
  let saving = false;

  const tabs = [];
  if (cfg.hasBaselayer) {
    tabs.push({
      id: 'baselayer',
      label: t('tabBaselayer', 'BaseLayer blocks'),
      empty: t('emptyBaselayer', ''),
      prefix: 'baselayer/',
    });
  }
  if (cfg.hasAcf) {
    tabs.push({
      id: 'acf',
      label: t('tabAcf', 'ACF blocks'),
      empty: t('emptyAcf', ''),
      prefix: 'acf/',
    });
  }
  tabs.push({
    id: 'system',
    label: t('tabSystem', 'System blocks'),
    empty: t('emptySystem', ''),
    prefix: 'core/',
  });
  tabs.push({ id: 'presets', label: t('tabPresets', 'Presets'), empty: t('emptyPresets', '') });

  const systemTab = tabs.find((tab) => tab.id === 'system');
  const systemCount = blocks.filter((b) => String(b.name || '').startsWith('core/')).length;
  active = systemCount > 0 ? 'system' : tabs[0]?.id || 'presets';

  function el(tag, attrs = {}, children = []) {
    const node = document.createElement(tag);
    Object.entries(attrs || {}).forEach(([key, value]) => {
      if (value == null || value === false) {
        return;
      }
      if (key === 'className') {
        node.className = value;
      } else if (key === 'text') {
        node.textContent = value;
      } else if (key === 'style' && typeof value === 'string') {
        node.setAttribute('style', value);
      } else if (key.startsWith('on') && typeof value === 'function') {
        node.addEventListener(key.slice(2).toLowerCase(), value);
      } else {
        node.setAttribute(key, value === true ? '' : String(value));
      }
    });
    (Array.isArray(children) ? children : [children]).forEach((child) => {
      if (child == null || child === false) {
        return;
      }
      node.appendChild(typeof child === 'string' ? document.createTextNode(child) : child);
    });
    return node;
  }

  function newId(prefix) {
    return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
  }

  function slugify(text) {
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

  function defaultCustom(type) {
    const def = customs[type] || {};
    return {
      id: newId('c'),
      kind: 'control',
      type,
      ...(def.defaults ? JSON.parse(JSON.stringify(def.defaults)) : {}),
    };
  }

  function defaultToggle() {
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

  function defaultPresetRef(slug) {
    return {
      id: newId('p'),
      kind: 'preset',
      slug: slug || '',
      defaults: {},
    };
  }

  function uniqueSlug(base) {
    let slug = slugify(base) || 'preset';
    const used = new Set(presets.map((p) => p.slug));
    if (!used.has(slug)) {
      return slug;
    }
    let i = 2;
    while (used.has(`${slug}-${i}`)) {
      i += 1;
    }
    return `${slug}-${i}`;
  }

  function findPreset(slug) {
    return presets.find((p) => p.slug === slug);
  }

  function findBlock(name) {
    return blocks.find((b) => b.name === name);
  }

  function blocksForTab(tab) {
    if (!tab?.prefix) {
      return [];
    }
    return blocks.filter((b) => String(b.name || '').startsWith(tab.prefix));
  }

  function summarizeItems(items) {
    const list = Array.isArray(items) ? items : [];
    const presetCount = list.filter((i) => i?.kind === 'preset').length;
    const controlCount = list.filter((i) => i?.kind === 'control').length;
    const parts = [];
    if (presetCount) {
      parts.push(`${presetCount} ${t('summaryPresets', 'presets')}`);
    }
    if (controlCount) {
      parts.push(`${controlCount} ${t('summaryControls', 'controls')}`);
    }
    if (!parts.length) {
      parts.push(`0 ${t('items', 'items')}`);
    }
    const slugs = list
      .filter((i) => i?.kind === 'preset')
      .map((i) => findPreset(i.slug)?.label || i.slug)
      .filter(Boolean);
    return {
      counts: parts.join(', '),
      detail: slugs.length ? slugs.join(', ') : '',
    };
  }

  async function postAjax(action, fields) {
    const body = new URLSearchParams();
    body.set('action', action);
    body.set('nonce', cfg.nonce || '');
    Object.entries(fields || {}).forEach(([key, value]) => {
      body.set(key, value);
    });
    const res = await fetch(cfg.ajaxUrl || ajaxurl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8' },
      body: body.toString(),
      credentials: 'same-origin',
    });
    return res.json();
  }

  async function savePresets() {
    if (saving) {
      return;
    }
    saving = true;
    render();
    try {
      const data = await postAjax('bl_block_options_save_presets', {
        presets: JSON.stringify(presets),
      });
      if (!data?.success) {
        window.alert(data?.data?.message || t('saveFailed', 'Could not save.'));
        return;
      }
      if (Array.isArray(data.data?.presets)) {
        presets = data.data.presets;
      }
      if (Array.isArray(data.data?.blocks)) {
        blocks = data.data.blocks;
      }
      window.alert(t('saved', 'Saved.'));
    } catch (e) {
      window.alert(t('saveFailed', 'Could not save.'));
    } finally {
      saving = false;
      render();
    }
  }

  async function saveBlock(block) {
    if (saving || !block?.name) {
      return;
    }
    saving = true;
    render();
    try {
      const data = await postAjax('bl_block_options_save_blocks', {
        block: block.name,
        items: JSON.stringify(block.items || []),
      });
      if (!data?.success) {
        window.alert(data?.data?.message || t('saveFailed', 'Could not save.'));
        return;
      }
      if (Array.isArray(data.data?.blocks)) {
        blocks = data.data.blocks;
      }
      if (Array.isArray(data.data?.presets)) {
        presets = data.data.presets;
      }
      window.alert(t('saved', 'Saved.'));
    } catch (e) {
      window.alert(t('saveFailed', 'Could not save.'));
    } finally {
      saving = false;
      render();
    }
  }

  function renderParamEditors(item, onPatch, { presetDefaults = false } = {}) {
    const wrap = el('div');
    const def = customs[item.type];
    if (!def?.params) {
      return wrap;
    }
    Object.entries(def.params).forEach(([key, paramDef]) => {
      if (presetDefaults) {
        // Label is edited via the universal field; skip catalog duplicate.
        if (key === 'label') {
          return;
        }
      }
      const row = el('div', { className: 'row' });
      const label = paramDef.label || key;
      if (paramDef.type === 'boolean') {
        const check = el('input', { type: 'checkbox', checked: !!item[key] });
        check.addEventListener('change', () => onPatch({ [key]: check.checked }));
        row.appendChild(el('label', {}, [check, document.createTextNode(' ' + label)]));
      } else if (paramDef.type === 'size' || paramDef.type === 'align') {
        row.appendChild(el('label', { text: label }));
        const select = el('select');
        const opts =
          paramDef.type === 'size'
            ? sizeChoicesForParam(paramDef)
            : [
                ['left', 'Left'],
                ['center', 'Center'],
                ['right', 'Right'],
              ];
        opts.forEach(([value, text]) => {
          select.appendChild(el('option', { value, text, selected: item[key] === value }));
        });
        select.value = item[key] ?? (paramDef.type === 'align' ? 'center' : '');
        select.addEventListener('change', () => onPatch({ [key]: select.value }));
        row.appendChild(select);
      } else {
        row.appendChild(el('label', { text: label }));
        row.appendChild(
          el('input', {
            type: 'text',
            value: item[key] ?? '',
            onInput: (e) => onPatch({ [key]: e.target.value }),
          })
        );
      }
      wrap.appendChild(row);
    });
    return wrap;
  }

  function renderDescriptionRow(value, onUpdate) {
    const textarea = el('textarea', {
      className: 'widefat',
      rows: 2,
      text: value || '',
    });
    textarea.addEventListener('input', () => onUpdate(textarea.value));
    return el('div', { className: 'row' }, [
      el('label', { text: t('optionDescription', 'Description') }),
      textarea,
    ]);
  }

  function renderControlCard(item, index, items, onChange) {
    const card = el('div', { className: 'bl-bo-edit-card' });
    const isCustom = !!customs[item.type];
    card.appendChild(
      el('span', {
        className: 'bl-bo-card-badge',
        text: isCustom ? customs[item.type]?.label || item.type : 'Toggle',
      })
    );

    const typeRow = el('div', { className: 'row' });
    typeRow.appendChild(el('label', { text: t('optionType', 'Type') }));
    const typeSelect = el('select');

    const defaultGroup = el('optgroup', { label: t('optionGroupDefault', 'Default') });
    defaultGroup.appendChild(
      el('option', {
        value: 'boolean',
        text: t('addToggle', 'Toggle'),
        selected: item.type === 'boolean' ? true : undefined,
      })
    );
    typeSelect.appendChild(defaultGroup);

    const customEntries = Object.entries(customs);
    if (customEntries.length > 0) {
      const customGroup = el('optgroup', { label: t('optionGroupCustom', 'Custom') });
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

    typeSelect.value = item.type;
    typeSelect.addEventListener('change', () => {
      const type = typeSelect.value;
      if (customs[type]) {
        items[index] = defaultCustom(type);
      } else {
        items[index] = defaultToggle();
      }
      onChange();
    });
    typeRow.appendChild(typeSelect);
    card.appendChild(typeRow);

    if (isCustom) {
      card.appendChild(
        renderParamEditors(item, (patch) => {
          Object.assign(item, patch);
        })
      );
    } else {
      ['label', 'toggleLabel', 'attributeName', 'className'].forEach((key) => {
        card.appendChild(
          el('div', { className: 'row' }, [
            el('label', { text: key }),
            el('input', {
              type: 'text',
              value: item[key] || '',
              onInput: (e) => {
                item[key] = e.target.value;
              },
            }),
          ])
        );
      });
    }

    card.appendChild(
      renderDescriptionRow(item.description || '', (nextVal) => {
        item.description = nextVal;
      })
    );

    card.appendChild(
      el('button', {
        type: 'button',
        className: 'button-link-delete',
        text: t('remove', 'Remove'),
        onClick: () => {
          items.splice(index, 1);
          onChange();
        },
      })
    );
    return card;
  }

  function renderPresetRefCard(item, index, items, onChange) {
    const card = el('div', { className: 'bl-bo-edit-card' });
    card.appendChild(
      el('span', { className: 'bl-bo-card-badge is-preset', text: t('addPresetRef', 'Preset') })
    );

    const slugSelect = el('select');
    if (presets.length === 0) {
      slugSelect.appendChild(el('option', { value: '', text: t('emptyPresets', 'No presets') }));
    } else {
      presets.forEach((preset) => {
        slugSelect.appendChild(
          el('option', {
            value: preset.slug,
            text: preset.label || preset.slug,
            selected: item.slug === preset.slug,
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
      items[index] = { ...item, slug: slugSelect.value, defaults: {} };
      onChange();
    });
    card.appendChild(
      el('div', { className: 'row' }, [el('label', { text: t('choosePreset', 'Preset') }), slugSelect])
    );

    const selected = findPreset(slugSelect.value || item.slug);
    const controls = Array.isArray(selected?.items)
      ? selected.items.filter((c) => c && c.kind === 'control')
      : [];

    if (controls.length > 0) {
      card.appendChild(
        el('p', {
          className: 'description',
          text: t('presetDefaultsHelp', 'Optional default overrides for this block:'),
        })
      );
      controls.forEach((control) => {
        const section = el('div', { className: 'row' });
        const title =
          control.label || customs[control.type]?.label || control.type || control.id;
        section.appendChild(el('strong', { text: title }));

        const controlId = control.id;
        const patchDefault = (patch) => {
          item.defaults = item.defaults || {};
          item.defaults[controlId] = {
            ...(item.defaults[controlId] || {}),
            ...patch,
          };
        };

        const overrideLabel =
          item.defaults?.[controlId]?.label !== undefined
            ? item.defaults[controlId].label
            : control.label || '';
        const overrideDescription =
          item.defaults?.[controlId]?.description !== undefined
            ? item.defaults[controlId].description
            : control.description || '';

        section.appendChild(
          el('div', { className: 'row' }, [
            el('label', { text: t('optionLabel', 'Label') }),
            el('input', {
              type: 'text',
              value: overrideLabel,
              onInput: (e) => patchDefault({ label: e.target.value }),
            }),
          ])
        );
        section.appendChild(
          renderDescriptionRow(overrideDescription, (nextVal) =>
            patchDefault({ description: nextVal })
          )
        );

        if (customs[control.type]) {
          section.appendChild(
            renderParamEditors(
              {
                ...control,
                ...(item.defaults?.[control.id] || {}),
              },
              (patch) => patchDefault(patch),
              { presetDefaults: true }
            )
          );
        } else if (control.type === 'boolean') {
          const check = el('input', {
            type: 'checkbox',
            checked: !!(item.defaults?.[control.id]?.default ?? control.default),
          });
          check.addEventListener('change', () => patchDefault({ default: check.checked }));
          section.appendChild(
            el('label', {}, [check, document.createTextNode(' ' + t('defaultOn', 'On by default'))])
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
          select.addEventListener('change', () => patchDefault({ default: select.value }));
          section.appendChild(
            el('div', { className: 'row' }, [
              el('label', { text: t('defaultValue', 'Default') }),
              select,
            ])
          );
        }

        card.appendChild(section);
      });
    }

    card.appendChild(
      el('button', {
        type: 'button',
        className: 'button-link-delete',
        text: t('remove', 'Remove'),
        onClick: () => {
          items.splice(index, 1);
          onChange();
        },
      })
    );
    return card;
  }

  function renderBlockEditor(block) {
    const panel = el('div');
    panel.appendChild(
      el('button', {
        type: 'button',
        className: 'button-link',
        text: t('backToList', '← All blocks'),
        onClick: () => {
          editingBlockName = null;
          render();
        },
      })
    );
    panel.appendChild(el('h2', { text: block.name, style: 'margin:12px 0 16px;font-size:16px' }));

    if (!Array.isArray(block.items)) {
      block.items = [];
    }

    const itemsWrap = el('div');
    const refresh = () => render();

    block.items.forEach((item, index) => {
      if (item?.kind === 'preset') {
        itemsWrap.appendChild(renderPresetRefCard(item, index, block.items, refresh));
      } else {
        itemsWrap.appendChild(renderControlCard(item, index, block.items, refresh));
      }
    });
    panel.appendChild(itemsWrap);

    const toolbar = el('div', { className: 'bl-bo-toolbar' });
    toolbar.appendChild(
      el('button', {
        type: 'button',
        className: 'button',
        text: '+ ' + t('addOption', 'Add option'),
        onClick: () => {
          block.items.push(defaultToggle());
          render();
        },
      })
    );
    toolbar.appendChild(
      el('button', {
        type: 'button',
        className: 'button button-primary',
        text: '+ ' + t('addPresetRef', 'Preset'),
        onClick: () => {
          if (presets.length === 0) {
            window.alert(t('emptyPresets', 'No presets yet.'));
            return;
          }
          block.items.push(defaultPresetRef(presets[0].slug));
          render();
        },
      })
    );
    toolbar.appendChild(
      el('button', {
        type: 'button',
        className: 'button button-primary',
        text: saving ? '…' : t('saveBlocks', 'Save block'),
        disabled: saving ? true : undefined,
        onClick: () => saveBlock(block),
      })
    );
    panel.appendChild(toolbar);
    return panel;
  }

  function renderBlocksList(tab) {
    const panel = el('div');
    const listBlocks = blocksForTab(tab);
    if (listBlocks.length === 0) {
      panel.appendChild(el('p', { className: 'bl-bo-empty', text: tab.empty || '' }));
      return panel;
    }

    const list = el('ul', { className: 'bl-bo-preset-list' });
    listBlocks.forEach((block) => {
      const summary = summarizeItems(block.items);
      list.appendChild(
        el('li', {}, [
          el('button', {
            type: 'button',
            className: 'linkish',
            onClick: () => {
              editingBlockName = block.name;
              render();
            },
          }, [
            document.createTextNode(block.name),
            el('div', { className: 'meta', text: summary.detail || summary.counts }),
          ]),
          el('span', { className: 'meta', text: summary.counts }),
        ])
      );
    });
    panel.appendChild(list);
    return panel;
  }

  function renderPresetEditor(preset) {
    const panel = el('div');
    panel.appendChild(
      el('button', {
        type: 'button',
        className: 'button-link',
        text: t('backToPresets', '← All presets'),
        onClick: () => {
          editingPresetSlug = null;
          render();
        },
      })
    );

    panel.appendChild(
      el('div', { className: 'row', style: 'margin:16px 0' }, [
        el('label', { text: t('presetLabel', 'Label') }),
        el('input', {
          type: 'text',
          value: preset.label || '',
          onInput: (e) => {
            preset.label = e.target.value;
          },
        }),
      ])
    );
    panel.appendChild(
      el('p', {
        className: 'description',
        text: `${t('presetSlug', 'Slug')}: ${preset.slug}`,
      })
    );

    if (!Array.isArray(preset.items)) {
      preset.items = [];
    }

    const itemsWrap = el('div');
    const refresh = () => render();
    preset.items.forEach((item, index) => {
      itemsWrap.appendChild(renderControlCard(item, index, preset.items, refresh));
    });
    panel.appendChild(itemsWrap);

    const toolbar = el('div', { className: 'bl-bo-toolbar' });
    toolbar.appendChild(
      el('button', {
        type: 'button',
        className: 'button',
        text: '+ ' + t('addOption', 'Add option'),
        onClick: () => {
          preset.items.push(defaultToggle());
          render();
        },
      })
    );
    toolbar.appendChild(
      el('button', {
        type: 'button',
        className: 'button button-primary',
        text: saving ? '…' : t('savePresets', 'Save presets'),
        disabled: saving ? true : undefined,
        onClick: () => savePresets(),
      })
    );
    panel.appendChild(toolbar);
    return panel;
  }

  function renderPresetsList() {
    const panel = el('div');
    const toolbar = el('div', { className: 'bl-bo-toolbar' });
    toolbar.appendChild(
      el('button', {
        type: 'button',
        className: 'button button-primary',
        text: t('addPreset', 'Add preset'),
        onClick: () => {
          const label = window.prompt(t('presetLabel', 'Label'), 'New preset');
          if (label == null || !String(label).trim()) {
            return;
          }
          const slug = uniqueSlug(label);
          presets.push({ slug, label: String(label).trim(), items: [] });
          editingPresetSlug = slug;
          render();
        },
      })
    );
    toolbar.appendChild(
      el('button', {
        type: 'button',
        className: 'button',
        text: saving ? '…' : t('savePresets', 'Save presets'),
        disabled: saving ? true : undefined,
        onClick: () => savePresets(),
      })
    );
    panel.appendChild(toolbar);

    if (presets.length === 0) {
      panel.appendChild(el('p', { className: 'bl-bo-empty', text: t('emptyPresets', '') }));
      return panel;
    }

    const list = el('ul', { className: 'bl-bo-preset-list' });
    presets.forEach((preset) => {
      const count = Array.isArray(preset.items) ? preset.items.length : 0;
      list.appendChild(
        el('li', {}, [
          el('button', {
            type: 'button',
            className: 'linkish',
            text: `${preset.label || preset.slug} (${count} ${t('summaryControls', 'controls')})`,
            onClick: () => {
              editingPresetSlug = preset.slug;
              render();
            },
          }),
          el('button', {
            type: 'button',
            className: 'button-link-delete',
            text: t('deletePreset', 'Delete'),
            onClick: () => {
              if (!window.confirm(`Delete preset “${preset.label || preset.slug}”?`)) {
                return;
              }
              presets = presets.filter((p) => p.slug !== preset.slug);
              if (editingPresetSlug === preset.slug) {
                editingPresetSlug = null;
              }
              render();
            },
          }),
        ])
      );
    });
    panel.appendChild(list);
    return panel;
  }

  function render() {
    root.replaceChildren();
    root.appendChild(el('p', { className: 'bl-bo-intro', text: t('intro', '') }));

    const tabBar = el('nav', { className: 'bl-forms-builder__tabs', role: 'tablist' });
    tabs.forEach((tab) => {
      tabBar.appendChild(
        el('button', {
          type: 'button',
          role: 'tab',
          className: 'bl-forms-builder__tab' + (tab.id === active ? ' is-active' : ''),
          text: tab.label,
          'aria-selected': tab.id === active ? 'true' : 'false',
          onClick: () => {
            active = tab.id;
            editingPresetSlug = null;
            editingBlockName = null;
            render();
          },
        })
      );
    });
    root.appendChild(tabBar);

    const panel = el('div', { className: 'bl-bo-panel', role: 'tabpanel' });
    if (active === 'presets') {
      const preset = editingPresetSlug ? findPreset(editingPresetSlug) : null;
      if (preset) {
        panel.appendChild(renderPresetEditor(preset));
      } else {
        panel.appendChild(renderPresetsList());
      }
    } else {
      const tab = tabs.find((row) => row.id === active) || tabs[0];
      const block = editingBlockName ? findBlock(editingBlockName) : null;
      if (block) {
        panel.appendChild(renderBlockEditor(block));
      } else {
        panel.appendChild(renderBlocksList(tab));
      }
    }
    root.appendChild(panel);
  }

  // Avoid unused lint for systemTab in some builds.
  void systemTab;

  render();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot);
} else {
  boot();
}
