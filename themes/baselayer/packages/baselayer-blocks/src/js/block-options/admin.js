/**
 * Blocks → Block Options — Blocks (BaseLayer / ACF / Core) + Presets.
 */
import { createOptionsPanel } from './shared/options-items-panel.js';
import {
  createBlockTypeIconEl,
  whenBlockTypesReady,
} from '../../../../../src/js/admin/utils/block-type-icon.js';

function boot() {
  const root = document.getElementById('bl-block-options-app');
  if (!root) {
    return;
  }

  const cfg = window.blBlockOptionsAdmin || {};
  const i18n = cfg.i18n || {};
  const t = (key, fallback) => i18n[key] || fallback;
  const customs = cfg.customs || {};
  const iconEl =
    typeof window.BlFormBuilder?.iconEl === 'function' ? window.BlFormBuilder.iconEl : null;

  let presets = Array.isArray(cfg.presets)
    ? JSON.parse(JSON.stringify(cfg.presets))
    : [];
  let blocks = Array.isArray(cfg.blocks)
    ? JSON.parse(JSON.stringify(cfg.blocks))
    : [];
  let availableBlocks = Array.isArray(cfg.availableBlocks)
    ? JSON.parse(JSON.stringify(cfg.availableBlocks))
    : [];

  let activeMain = 'blocks'; // 'blocks' | 'presets'
  let activeBlockSource = 'all'; // 'all' | 'baselayer' | 'acf' | 'core'
  /** @type {object|null} preset object currently open in the editor */
  let editingPreset = null;
  /** @type {Set<string>} presets whose slug was manually edited (or loaded from store) */
  const slugManual = new Set(presets.map((p) => p.slug).filter(Boolean));
  let editingBlockName = null;
  let savingBlock = false;
  let savingPreset = false;
  let addingBlock = false;
  let selectedAddBlock = '';
  /** Block assignments changed by a preset slug rename — persisted with the next preset save. */
  let blocksDirty = false;
  /** @type {{ type: 'success'|'error'|'muted', text: string }|null} */
  let statusMessage = null;

  const blockSources = [
    {
      id: 'all',
      label: t('tabAll', 'All'),
      empty: t(
        'emptyAll',
        'No blocks with options yet. Add a block below.'
      ),
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
      } else if (key === 'dataset' && value && typeof value === 'object') {
        Object.entries(value).forEach(([dataKey, dataValue]) => {
          if (dataValue != null && dataValue !== false) {
            node.dataset[dataKey] = String(dataValue);
          }
        });
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

  function uniqueSlug(base, excludeSlug = null) {
    let slug = slugify(base) || 'preset';
    const used = new Set(
      presets.map((p) => p.slug).filter((s) => s && s !== excludeSlug)
    );
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

  function matchesSource(name, tab) {
    const blockName = String(name || '');
    if (!tab) {
      return false;
    }
    if (!tab.prefix) {
      const prefixes = blockSources.map((s) => s.prefix).filter(Boolean);
      return prefixes.some((prefix) => blockName.startsWith(prefix));
    }
    return blockName.startsWith(tab.prefix);
  }

  function blocksForTab(tab) {
    return blocks.filter((b) => matchesSource(b.name, tab));
  }

  function availableBlocksForTab(tab) {
    return availableBlocks.filter((b) => matchesSource(b.name, tab));
  }

  function blockTitle(block) {
    return (block && block.title) || (block && block.name) || '';
  }

  function formatCount(n, oneKey, manyKey, oneFallback, manyFallback) {
    const label = n === 1 ? t(oneKey, oneFallback) : t(manyKey, manyFallback);
    return `${n} ${label}`;
  }

  function summarizeItems(items) {
    const list = Array.isArray(items) ? items : [];
    const presetCount = list.filter((i) => i?.kind === 'preset').length;
    const controlCount = list.filter((i) => i?.kind === 'control').length;
    const parts = [];
    if (presetCount) {
      parts.push(
        formatCount(
          presetCount,
          'summaryPresetOne',
          'summaryPresetMany',
          'preset',
          'presets'
        )
      );
    }
    if (controlCount) {
      parts.push(
        formatCount(
          controlCount,
          'summaryControlOne',
          'summaryControlMany',
          'control',
          'controls'
        )
      );
    }
    if (!parts.length) {
      parts.push(`0 ${t('items', 'items')}`);
    }
    return { counts: parts.join(' · ') };
  }

  function setStatus(type, text) {
    statusMessage = text ? { type, text } : null;
  }

  function renderStatus() {
    if (!statusMessage) {
      return null;
    }
    return el('span', {
      className: 'bl-bo-status bl-bo-status--' + statusMessage.type,
      text: statusMessage.text,
      role: 'status',
      dataset: { blBoStatus: '1' },
    });
  }

  function paintStatus() {
    root.querySelectorAll('[data-bl-bo-status-host]').forEach((host) => {
      host.replaceChildren();
      const node = renderStatus();
      if (node) {
        host.appendChild(node);
      }
    });
  }

  function statusHost() {
    return el('div', { className: 'bl-bo-status-host', dataset: { blBoStatusHost: '1' } }, [
      renderStatus(),
    ]);
  }

  function makeBackButton(label, onClick) {
    return el('button', {
      type: 'button',
      className: 'button button-secondary bl-button -has-icon -icon-arrow-left bl-bo-back',
      onClick,
    }, [label]);
  }

  function openConfirmModal({ title, message, confirmLabel, onConfirm }) {
    const overlay = el('div', {
      className: 'bl-blocks-modal-overlay',
      role: 'presentation',
    });
    const dialog = el('div', {
      className: 'bl-blocks-modal bl-bo-confirm-modal',
      role: 'dialog',
      'aria-modal': 'true',
      'aria-label': title || '',
    });

    const close = () => {
      document.removeEventListener('keydown', onKey);
      overlay.remove();
    };

    const onKey = (evt) => {
      if (evt.key === 'Escape') {
        evt.preventDefault();
        close();
      }
    };

    const confirmBtn = el('button', {
      type: 'button',
      className: 'button button-primary',
      text: confirmLabel || t('delete', 'Delete'),
      onClick: () => {
        close();
        if (typeof onConfirm === 'function') {
          onConfirm();
        }
      },
    });

    dialog.append(
      el('div', { className: 'bl-blocks-modal__header' }, [
        el('h2', { className: 'bl-blocks-modal__title', text: title || '' }),
        el('button', {
          type: 'button',
          className: 'bl-blocks-modal__close',
          text: '×',
          'aria-label': t('close', 'Close'),
          onClick: close,
        }),
      ]),
      el('div', { className: 'bl-blocks-modal__body' }, [
        el('p', { className: 'bl-bo-confirm-modal__message', text: message || '' }),
      ]),
      el('div', { className: 'bl-blocks-modal__footer' }, [
        el('button', {
          type: 'button',
          className: 'button',
          text: t('cancel', 'Cancel'),
          onClick: close,
        }),
        confirmBtn,
      ])
    );

    overlay.appendChild(dialog);
    overlay.addEventListener('click', (evt) => {
      if (evt.target === overlay) {
        close();
      }
    });
    document.body.appendChild(overlay);
    document.addEventListener('keydown', onKey);
    setTimeout(() => confirmBtn.focus(), 0);
  }

  function deletePreset(preset) {
    if (!preset || savingPreset) {
      return;
    }
    if (preset.slug) {
      slugManual.delete(preset.slug);
    }
    presets = presets.filter((p) => p !== preset);
    if (editingPreset === preset) {
      editingPreset = null;
    }
    setStatus(null, null);
    render();
    void persistPresets({ keepEditing: false });
  }

  function confirmDeletePreset(preset) {
    const name =
      (preset && (preset.label || preset.slug)) || t('untitledPreset', 'Untitled');
    openConfirmModal({
      title: t('deletePresetTitle', 'Delete preset?'),
      message: t(
        'deletePresetConfirm',
        'Delete “%s”? This cannot be undone.'
      ).replace('%s', name),
      confirmLabel: t('deletePreset', 'Delete'),
      onConfirm: () => deletePreset(preset),
    });
  }

  async function deleteBlock(block) {
    if (!block?.name || savingBlock) {
      return;
    }
    const name = block.name;
    blocks = blocks.filter((row) => row.name !== name);
    if (editingBlockName === name) {
      editingBlockName = null;
    }
    savingBlock = true;
    setStatus(null, null);
    render();
    try {
      const data = await postAjax('bl_block_options_save_blocks', {
        blocks: JSON.stringify(blocks),
      });
      if (!data?.success) {
        setStatus('error', data?.data?.message || t('saveFailed', 'Could not save.'));
        return;
      }
      if (Array.isArray(data.data?.blocks)) {
        blocks = data.data.blocks;
      }
      if (Array.isArray(data.data?.availableBlocks)) {
        availableBlocks = data.data.availableBlocks;
      }
      setStatus('success', t('saved', 'Saved.'));
    } catch (e) {
      setStatus('error', t('saveFailed', 'Could not save.'));
    } finally {
      savingBlock = false;
      render();
    }
  }

  function confirmDeleteBlock(block) {
    const name = blockTitle(block);
    openConfirmModal({
      title: t('deleteBlockTitle', 'Remove block options?'),
      message: t(
        'deleteBlockConfirm',
        'Remove options for “%s”? This cannot be undone.'
      ).replace('%s', name),
      confirmLabel: t('delete', 'Delete'),
      onConfirm: () => deleteBlock(block),
    });
  }

  function makeRowDeleteButton({ title, onClick }) {
    const deleteBtn = el('button', {
      type: 'button',
      className:
        'bl-forms-builder__icon-btn bl-forms-builder__icon-btn--danger bl-bo-row-delete',
      title,
      'aria-label': title,
      onClick: (evt) => {
        evt.preventDefault();
        evt.stopPropagation();
        onClick();
      },
    });
    const trashIcon = typeof iconEl === 'function' ? iconEl('trash') : null;
    if (trashIcon?.innerHTML) {
      deleteBtn.appendChild(trashIcon);
    } else {
      deleteBtn.textContent = '×';
    }
    return deleteBtn;
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

  function retargetPresetSlug(fromSlug, toSlug) {
    if (!fromSlug || !toSlug || fromSlug === toSlug) {
      return;
    }
    blocks.forEach((block) => {
      (block.items || []).forEach((item) => {
        if (item?.kind === 'preset' && item.slug === fromSlug) {
          item.slug = toSlug;
          blocksDirty = true;
        }
      });
    });
  }

  /**
   * Persist the in-memory presets map (and block refs if a slug was renamed).
   * Keeps local preset object identity stable so an open editor is not remounted.
   *
   * @param {{ keepEditing?: boolean }} [opts]
   * @returns {Promise<boolean>}
   */
  async function persistPresets({ keepEditing = true } = {}) {
    if (savingPreset) {
      return false;
    }
    savingPreset = true;
    const presetsPayload = JSON.stringify(presets);
    const saveBlocksToo = blocksDirty;
    const blocksPayload = saveBlocksToo ? JSON.stringify(blocks) : null;
    const openPreset = keepEditing ? editingPreset : null;

    setStatus('muted', t('saving', 'Saving…'));
    if (keepEditing) {
      render();
    } else {
      paintStatus();
    }

    try {
      const data = await postAjax('bl_block_options_save_presets', {
        presets: presetsPayload,
      });
      if (!data?.success) {
        setStatus('error', data?.data?.message || t('saveFailed', 'Could not save.'));
        return false;
      }

      if (saveBlocksToo && blocksPayload) {
        const blockData = await postAjax('bl_block_options_save_blocks', {
          blocks: blocksPayload,
        });
        if (!blockData?.success) {
          setStatus('error', blockData?.data?.message || t('saveFailed', 'Could not save.'));
          return false;
        }
        if (JSON.stringify(blocks) === blocksPayload) {
          blocksDirty = false;
        }
      } else {
        blocksDirty = false;
      }

      // Keep editing the same object; do not replace `presets` from the response.
      if (openPreset && presets.includes(openPreset)) {
        editingPreset = openPreset;
      }
      setStatus('success', t('saved', 'Saved.'));
      return true;
    } catch (e) {
      setStatus('error', t('saveFailed', 'Could not save.'));
      return false;
    } finally {
      savingPreset = false;
      render();
    }
  }

  async function savePreset(preset) {
    if (savingPreset || !preset) {
      return;
    }
    const slug = String(preset.slug || '').trim();
    if (!slug) {
      setStatus('error', t('presetSlugRequired', 'Add a slug before saving.'));
      render();
      return;
    }
    await persistPresets({ keepEditing: true });
  }

  async function saveBlock(block) {
    if (savingBlock || !block?.name) {
      return;
    }
    savingBlock = true;
    setStatus(null, null);
    render();
    try {
      const data = await postAjax('bl_block_options_save_blocks', {
        block: block.name,
        items: JSON.stringify(block.items || []),
      });
      if (!data?.success) {
        setStatus('error', data?.data?.message || t('saveFailed', 'Could not save.'));
        return;
      }
      if (Array.isArray(data.data?.blocks)) {
        blocks = data.data.blocks;
      }
      if (Array.isArray(data.data?.availableBlocks)) {
        availableBlocks = data.data.availableBlocks;
      }
      if (Array.isArray(data.data?.presets)) {
        presets = data.data.presets;
      }
      setStatus('success', t('saved', 'Saved.'));
    } catch (e) {
      setStatus('error', t('saveFailed', 'Could not save.'));
    } finally {
      savingBlock = false;
      render();
    }
  }

  function applyPresetSlug(preset, nextSlug, { manual = false } = {}) {
    const prev = preset.slug || '';
    const cleaned = slugify(nextSlug);
    const unique = cleaned === '' ? '' : uniqueSlug(cleaned, prev || null);
    if (prev) {
      slugManual.delete(prev);
    }
    if (manual) {
      if (unique) {
        slugManual.add(unique);
      }
    } else if (unique) {
      slugManual.delete(unique);
    }
    preset.slug = unique;
    if (prev !== unique) {
      retargetPresetSlug(prev, unique);
    }
    return unique;
  }

  function isSlugAuto(preset) {
    const slug = preset?.slug || '';
    return !slug || !slugManual.has(slug);
  }

  function discardEmptyDraft(preset) {
    if (!preset) {
      return;
    }
    const empty =
      !String(preset.label || '').trim() &&
      !String(preset.slug || '').trim() &&
      (!Array.isArray(preset.items) || preset.items.length === 0);
    if (empty) {
      presets = presets.filter((p) => p !== preset);
    }
  }

  function renderPresetEditor(preset) {
    const panel = el('div', { className: 'bl-bo-preset-editor' });
    const header = el('div', { className: 'bl-bo-editor-header' });
    header.appendChild(
      makeBackButton(t('backToPresets', 'All presets'), () => {
        discardEmptyDraft(preset);
        editingPreset = null;
        setStatus(null, null);
        render();
      })
    );
    panel.appendChild(header);

    const meta = el('div', { className: 'bl-bo-preset-meta' });
    const slugInput = el('input', {
      type: 'text',
      className: 'widefat',
      value: preset.slug || '',
      pattern: '[a-z0-9\\-]*',
      spellcheck: 'false',
      autocomplete: 'off',
      disabled: savingPreset ? true : undefined,
    });

    slugInput.addEventListener('input', () => {
      const next = applyPresetSlug(preset, slugInput.value, { manual: true });
      slugInput.value = next;
    });

    meta.appendChild(
      el('div', { className: 'bl-bo-field' }, [
        el('label', { text: t('presetLabel', 'Label') }),
        el('input', {
          type: 'text',
          className: 'widefat',
          value: preset.label || '',
          disabled: savingPreset ? true : undefined,
          onInput: (e) => {
            preset.label = e.target.value;
            if (isSlugAuto(preset)) {
              const next = applyPresetSlug(preset, preset.label, { manual: false });
              slugInput.value = next;
            }
          },
        }),
      ])
    );
    meta.appendChild(
      el('div', { className: 'bl-bo-field' }, [
        el('label', { text: t('presetSlug', 'Slug') }),
        slugInput,
      ])
    );
    panel.appendChild(meta);

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
        helpText: false,
        emptyText: t('presetItemsEmpty', 'No options yet. Add a control.'),
      }
    );
    panel.appendChild(optionsPanel);

    const toolbar = el('div', { className: 'bl-bo-toolbar bl-bo-toolbar--save' });
    toolbar.appendChild(
      el('button', {
        type: 'button',
        className: 'button button-primary',
        text: savingPreset ? t('saving', 'Saving…') : t('savePreset', 'Save preset'),
        disabled: savingPreset ? true : undefined,
        onClick: () => savePreset(preset),
      })
    );
    const status = renderStatus();
    if (status) {
      toolbar.appendChild(status);
    }
    panel.appendChild(toolbar);
    return panel;
  }

  function renderPresetsList() {
    const panel = el('div');
    const toolbar = el('div', { className: 'bl-bo-toolbar bl-bo-toolbar--presets' });
    toolbar.appendChild(statusHost());
    toolbar.appendChild(
      el('button', {
        type: 'button',
        className: 'button button-primary bl-button',
        text: t('addPreset', 'Add preset'),
        onClick: () => {
          const preset = { slug: '', label: '', items: [] };
          presets.push(preset);
          editingPreset = preset;
          setStatus(null, null);
          render();
        },
      })
    );
    panel.appendChild(toolbar);

    if (presets.length === 0) {
      panel.appendChild(el('p', { className: 'bl-bo-empty', text: t('emptyPresets', '') }));
      return panel;
    }

    const list = el('ul', { className: 'bl-bo-preset-list bl-bo-block-list' });
    presets.forEach((preset) => {
      const summary = summarizeItems(preset.items);
      list.appendChild(
        el('li', { className: 'bl-bo-block-row' }, [
          el('div', { className: 'bl-bo-block-row__lead' }, [
            el('button', {
              type: 'button',
              className: 'linkish bl-bo-block-open',
              text: preset.label || preset.slug || t('untitledPreset', 'Untitled'),
              onClick: () => {
                editingPreset = preset;
                setStatus(null, null);
                render();
              },
            }),
          ]),
          el('span', { className: 'bl-bo-block-row__meta', text: summary.counts }),
          el('code', {
            className: 'bl-bo-block-row__code',
            text: preset.slug || '—',
          }),
          makeRowDeleteButton({
            title: t('deletePreset', 'Delete'),
            onClick: () => confirmDeletePreset(preset),
          }),
        ])
      );
    });
    panel.appendChild(list);
    return panel;
  }

  async function addBlock(name) {
    if (addingBlock || !name) {
      return;
    }
    addingBlock = true;
    setStatus(null, null);
    render();
    try {
      const data = await postAjax('bl_block_options_add_block', { block: name });
      if (!data?.success) {
        setStatus('error', data?.data?.message || t('addBlockFailed', 'Could not add block.'));
        return;
      }
      if (Array.isArray(data.data?.blocks)) {
        blocks = data.data.blocks;
      }
      if (Array.isArray(data.data?.availableBlocks)) {
        availableBlocks = data.data.availableBlocks;
      }
      selectedAddBlock = '';
      editingBlockName = name;
      setStatus('success', t('saved', 'Saved.'));
    } catch (e) {
      setStatus('error', t('addBlockFailed', 'Could not add block.'));
    } finally {
      addingBlock = false;
      render();
    }
  }

  function renderBlockEditor(block) {
    const panel = el('div', { className: 'bl-bo-block-editor' });
    panel.appendChild(
      makeBackButton(t('backToList', 'All blocks'), () => {
        editingBlockName = null;
        setStatus(null, null);
        render();
      })
    );
    const heading = el('h2', { className: 'bl-bo-block-heading' });
    heading.appendChild(
      createBlockTypeIconEl(block.name, block.icon || null, 'bl-blocks-list-icon')
    );
    heading.appendChild(
      el('span', { className: 'bl-bo-block-heading__title', text: blockTitle(block) })
    );
    heading.appendChild(el('code', { className: 'bl-bo-block-heading__code', text: block.name }));
    panel.appendChild(heading);

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

    const toolbar = el('div', { className: 'bl-bo-toolbar bl-bo-toolbar--save' });
    toolbar.appendChild(
      el('button', {
        type: 'button',
        className: 'button button-primary',
        text: savingBlock ? t('saving', 'Saving…') : t('saveBlocks', 'Save block'),
        disabled: savingBlock ? true : undefined,
        onClick: () => saveBlock(block),
      })
    );
    const status = renderStatus();
    if (status) {
      toolbar.appendChild(status);
    }
    panel.appendChild(toolbar);
    return panel;
  }

  function blockOptionLabel(block) {
    return block.title && block.title !== block.name
      ? `${block.title} (${block.name})`
      : block.name;
  }

  function appendBlockSelectOptions(select, choices) {
    const groups = blockSources.filter((source) => source.prefix);
    const assigned = new Set();

    groups.forEach((group) => {
      const rows = choices.filter((block) =>
        String(block.name || '').startsWith(group.prefix)
      );
      if (!rows.length) {
        return;
      }
      const optgroup = el('optgroup', { label: group.label });
      rows.forEach((block) => {
        assigned.add(block.name);
        optgroup.appendChild(
          el('option', { value: block.name, text: blockOptionLabel(block) })
        );
      });
      select.appendChild(optgroup);
    });

    const other = choices.filter((block) => !assigned.has(block.name));
    if (!other.length) {
      return;
    }
    if (groups.length === 0) {
      other.forEach((block) => {
        select.appendChild(
          el('option', { value: block.name, text: blockOptionLabel(block) })
        );
      });
      return;
    }
    const optgroup = el('optgroup', { label: t('tabOther', 'Other') });
    other.forEach((block) => {
      optgroup.appendChild(
        el('option', { value: block.name, text: blockOptionLabel(block) })
      );
    });
    select.appendChild(optgroup);
  }

  function renderAddBlockBar(tab) {
    const choices = availableBlocksForTab(tab);
    const bar = el('div', { className: 'bl-bo-add-block bl-admin-form' });
    const row = el('div', { className: 'bl-bo-add-block__row' });
    const select = el('select', {
      className: 'bl-bo-add-block__select',
      disabled: addingBlock || choices.length === 0 ? true : undefined,
      onChange: (event) => {
        selectedAddBlock = event.target.value || '';
      },
    });
    select.appendChild(
      el('option', {
        value: '',
        text: t('chooseBlock', 'Select a block…'),
      })
    );
    appendBlockSelectOptions(select, choices);
    if (selectedAddBlock && choices.some((b) => b.name === selectedAddBlock)) {
      select.value = selectedAddBlock;
    } else {
      selectedAddBlock = '';
      select.value = '';
    }

    const fields = el('div', { className: 'bl-bo-add-block__fields' });
    fields.appendChild(select);
    fields.appendChild(
      el('button', {
        type: 'button',
        className: 'button button-primary bl-button',
        text: addingBlock ? t('addingBlock', 'Adding…') : t('addBlock', 'Add block'),
        disabled: addingBlock || choices.length === 0 ? true : undefined,
        onClick: () => {
          const name = select.value || selectedAddBlock;
          if (name) {
            void addBlock(name);
          }
        },
      })
    );
    row.appendChild(fields);
    bar.appendChild(row);
    if (choices.length === 0) {
      bar.appendChild(
        el('p', {
          className: 'description bl-bo-add-block__hint',
          text: t('noBlocksToAdd', 'No more blocks available in this filter.'),
        })
      );
    } else if (statusMessage?.text && statusMessage.type === 'error') {
      bar.appendChild(
        el('p', {
          className: 'description bl-bo-add-block__hint bl-bo-status bl-bo-status--error',
          text: statusMessage.text,
          role: 'status',
        })
      );
    }
    return bar;
  }

  function renderBlockSourceTabs() {
    if (blockSources.length <= 1) {
      return null;
    }
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
            selectedAddBlock = '';
            setStatus(null, null);
            render();
          },
        })
      );
    });
    return subNav;
  }

  function renderBlocksList(tab) {
    const panel = el('div');
    const rows = blocksForTab(tab);
    if (rows.length === 0) {
      panel.appendChild(el('p', { className: 'bl-bo-empty', text: tab.empty || '' }));
      return panel;
    }

    const list = el('ul', { className: 'bl-bo-preset-list bl-bo-block-list' });
    rows.forEach((block) => {
      const summary = summarizeItems(block.items);
      list.appendChild(
        el('li', { className: 'bl-bo-block-row' }, [
          el('div', { className: 'bl-bo-block-row__lead' }, [
            createBlockTypeIconEl(block.name, block.icon || null, 'bl-blocks-list-icon'),
            el('button', {
              type: 'button',
              className: 'linkish bl-bo-block-open',
              text: blockTitle(block),
              onClick: () => {
                editingBlockName = block.name;
                setStatus(null, null);
                render();
              },
            }),
          ]),
          el('span', { className: 'bl-bo-block-row__meta', text: summary.counts }),
          el('code', { className: 'bl-bo-block-row__code', text: block.name }),
          makeRowDeleteButton({
            title: t('delete', 'Delete'),
            onClick: () => confirmDeleteBlock(block),
          }),
        ])
      );
    });
    panel.appendChild(list);
    return panel;
  }

  function render() {
    root.replaceChildren();

    const shell = el('div', { className: 'bl-forms-builder bl-block-options-shell' });
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
            if (editingPreset) {
              discardEmptyDraft(editingPreset);
            }
            editingPreset = null;
            editingBlockName = null;
            setStatus(null, null);
            render();
          },
        })
      );
    });
    shell.appendChild(tabBar);

    const panels = el('div', { className: 'bl-forms-builder__panels' });
    const panel = el('div', { className: 'bl-forms-builder__panel bl-bo-panel', role: 'tabpanel' });
    if (activeMain === 'presets') {
      const preset =
        editingPreset && presets.includes(editingPreset) ? editingPreset : null;
      if (preset) {
        panel.appendChild(renderPresetEditor(preset));
      } else {
        editingPreset = null;
        panel.appendChild(renderPresetsList());
      }
    } else {
      const block = editingBlockName ? findBlock(editingBlockName) : null;
      if (block) {
        panel.appendChild(renderBlockEditor(block));
      } else {
        const source = currentBlockSource();
        panel.appendChild(renderAddBlockBar(source));
        const subNav = renderBlockSourceTabs();
        if (subNav) {
          panel.appendChild(subNav);
        }
        panel.appendChild(renderBlocksList(source));
      }
    }
    panels.appendChild(panel);
    shell.appendChild(panels);
    root.appendChild(shell);
  }

  render();
}

// Wait for registerCoreBlocks so core icons resolve (same as Theme → Blocks).
whenBlockTypesReady(boot);
