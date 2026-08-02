/**
 * Blocks → Block Options — Blocks (BaseLayer / ACF / Core) + Presets.
 */
import { createOptionsPanel } from './shared/options-items-panel.js';

function boot() {
  const root = document.getElementById('bl-block-options-app');
  if (!root) {
    return;
  }

  const cfg = window.blBlockOptionsAdmin || {};
  const i18n = cfg.i18n || {};
  const t = (key, fallback) => i18n[key] || fallback;
  const customs = cfg.customs || {};

  let presets = Array.isArray(cfg.presets)
    ? JSON.parse(JSON.stringify(cfg.presets))
    : [];
  let blocks = Array.isArray(cfg.blocks)
    ? JSON.parse(JSON.stringify(cfg.blocks))
    : [];

  let activeMain = 'blocks'; // 'blocks' | 'presets'
  let activeBlockSource = 'all'; // 'all' | 'baselayer' | 'acf' | 'core'
  let editingPresetSlug = null;
  let editingBlockName = null;
  let saving = false;

  const blockSources = [
    {
      id: 'all',
      label: t('tabAll', 'All'),
      empty: t('emptyAll', 'No blocks with options yet. Import theme defaults, or assign presets from a block.'),
      prefix: null,
    },
  ];
  if (cfg.hasBaselayer) {
    blockSources.push({
      id: 'baselayer',
      label: t('tabBaselayer', 'BaseLayer'),
      empty: t('emptyBaselayer', ''),
      prefix: 'baselayer/',
    });
  }
  if (cfg.hasAcf) {
    blockSources.push({
      id: 'acf',
      label: t('tabAcf', 'ACF'),
      empty: t('emptyAcf', ''),
      prefix: 'acf/',
    });
  }
  blockSources.push({
    id: 'core',
    label: t('tabCore', 'Core'),
    empty: t('emptySystem', ''),
    prefix: 'core/',
  });

  const mainTabs = [
    { id: 'blocks', label: t('tabBlocks', 'Blocks') },
    { id: 'presets', label: t('tabPresets', 'Presets') },
  ];

  function currentBlockSource() {
    return blockSources.find((s) => s.id === activeBlockSource) || blockSources[0];
  }

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
    if (!tab) {
      return [];
    }
    if (!tab.prefix) {
      const prefixes = blockSources.map((s) => s.prefix).filter(Boolean);
      return blocks.filter((b) => {
        const name = String(b.name || '');
        return prefixes.some((prefix) => name.startsWith(prefix));
      });
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

  function renderPresetEditor(preset) {
    const panel = el('div', { className: 'bl-bo-preset-editor' });
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
      el('div', { className: 'bl-bo-field', style: 'margin:16px 0 8px' }, [
        el('label', { text: t('presetLabel', 'Label') }),
        el('input', {
          type: 'text',
          className: 'widefat',
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

    const { panel: optionsPanel } = createOptionsPanel(
      { items: preset.items },
      (next) => {
        preset.items = next.items;
      },
      {
        allowCustoms: true,
        allowPresetRefs: false,
        customs: () => customs,
        presets: () => presets,
        helpText: t(
          'presetItemsHelp',
          'Controls in this preset can be attached to blocks from the Options tab or below.'
        ),
        emptyText: t('presetItemsEmpty', 'No options yet. Add a control.'),
      }
    );
    panel.appendChild(optionsPanel);

    const toolbar = el('div', { className: 'bl-bo-toolbar', style: 'margin-top:16px' });
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
      const summary = summarizeItems(preset.items);
      list.appendChild(
        el('li', {}, [
          el('div', {}, [
            el('button', {
              type: 'button',
              className: 'linkish',
              text: preset.label || preset.slug,
              onClick: () => {
                editingPresetSlug = preset.slug;
                render();
              },
            }),
            el('span', {
              className: 'meta',
              style: 'display:block;margin-top:2px',
              text: summary.counts + (summary.detail ? ` · ${summary.detail}` : ''),
            }),
          ]),
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

  function renderBlockEditor(block) {
    const panel = el('div', { className: 'bl-bo-block-editor' });
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

    const { panel: optionsPanel } = createOptionsPanel(
      { items: block.items },
      (next) => {
        block.items = next.items;
      },
      {
        allowCustoms: false,
        allowPresetRefs: true,
        customs: () => customs,
        presets: () => presets,
        helpText: false,
        emptyText: t(
          'blockOptionsEmpty',
          'No options yet. Add a control or attach a preset.'
        ),
      }
    );
    panel.appendChild(optionsPanel);

    const toolbar = el('div', { className: 'bl-bo-toolbar', style: 'margin-top:16px' });
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
    const rows = blocksForTab(tab);
    if (rows.length === 0) {
      panel.appendChild(el('p', { className: 'bl-bo-empty', text: tab.empty || '' }));
      return panel;
    }

    const list = el('ul', { className: 'bl-bo-preset-list' });
    rows.forEach((block) => {
      const summary = summarizeItems(block.items);
      list.appendChild(
        el('li', {}, [
          el('button', {
            type: 'button',
            className: 'linkish',
            text: block.title || block.name,
            onClick: () => {
              editingBlockName = block.name;
              render();
            },
          }),
          el('span', {
            className: 'meta',
            text: summary.counts + (summary.detail ? ` · ${summary.detail}` : ''),
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
    mainTabs.forEach((tab) => {
      tabBar.appendChild(
        el('button', {
          type: 'button',
          role: 'tab',
          className: 'bl-forms-builder__tab' + (tab.id === activeMain ? ' is-active' : ''),
          text: tab.label,
          'aria-selected': tab.id === activeMain ? 'true' : 'false',
          onClick: () => {
            activeMain = tab.id;
            editingPresetSlug = null;
            editingBlockName = null;
            render();
          },
        })
      );
    });
    root.appendChild(tabBar);

    const panel = el('div', { className: 'bl-bo-panel', role: 'tabpanel' });
    if (activeMain === 'presets') {
      const preset = editingPresetSlug ? findPreset(editingPresetSlug) : null;
      if (preset) {
        panel.appendChild(renderPresetEditor(preset));
      } else {
        panel.appendChild(renderPresetsList());
      }
    } else {
      const block = editingBlockName ? findBlock(editingBlockName) : null;
      if (block) {
        panel.appendChild(renderBlockEditor(block));
      } else {
        if (blockSources.length > 1) {
          const subNav = el('nav', {
            className: 'bl-bo-subtabs',
            role: 'tablist',
            'aria-label': t('tabBlocks', 'Blocks'),
          });
          blockSources.forEach((source) => {
            subNav.appendChild(
              el('button', {
                type: 'button',
                role: 'tab',
                className: 'bl-bo-subtabs__tab' + (source.id === activeBlockSource ? ' is-active' : ''),
                text: source.label,
                'aria-selected': source.id === activeBlockSource ? 'true' : 'false',
                onClick: () => {
                  activeBlockSource = source.id;
                  editingBlockName = null;
                  render();
                },
              })
            );
          });
          panel.appendChild(subNav);
        }
        panel.appendChild(renderBlocksList(currentBlockSource()));
      }
    }
    root.appendChild(panel);
  }

  render();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot);
} else {
  boot();
}
