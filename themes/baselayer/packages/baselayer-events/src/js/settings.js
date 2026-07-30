/**
 * Events settings admin: Metadata + Statuses builders + menu icon field.
 * Depends on window.BlFieldBuilder (theme kit script) for Sortable/DOM helpers.
 */

import { bootMenuIconField } from './menu-icon-field';

function bootMetaBuilder() {
  const cfg = window.blEventsMetaBuilder || {};
  const root = document.querySelector('[data-bl-events-meta-builder]');
  const jsonInput = document.getElementById('bl-events-meta-config-json');
  const FB = window.BlFieldBuilder;

  if (!root || !jsonInput || !FB) {
    return;
  }

  FB.ensureTypes();

  const {
    el,
    empty,
    slugify,
    bindTitleSlugSync,
    createFieldRow,
    serializeFieldRow,
    createSortable,
    createListRow,
  } = FB;

  const i18n = cfg.i18n || {};
  const MODE = 'event-meta';
  const ROW_OPTS = {
    tabs: ['general'],
    labels: {
      title: i18n.fieldLabel || 'Label',
      slug: i18n.fieldId || 'Field ID',
    },
    showRequired: false,
    showHelp: true,
  };

  let initial = { title: '', groups: {} };
  try {
    initial = jsonInput.value ? JSON.parse(jsonInput.value) : initial;
  } catch (e) {
    initial = cfg.initial || initial;
  }
  if (!initial || typeof initial !== 'object') {
    initial = { title: '', groups: {} };
  }

  empty(root);
  root.classList.add('bl-events-meta-builder', 'bl-field-builder');

  const titleInputEl = el('input', {
    type: 'text',
    className: 'regular-text',
    dataset: { blEventsMetaTitle: '1' },
    value: initial.title || '',
  });

  const titleRow = el('div', { className: 'bl-events-meta-builder__title-row' }, [
    el('label', {
      className: 'bl-events-meta-builder__title-label',
      text: i18n.panelTitle || 'Panel title',
    }),
    titleInputEl,
  ]);

  const groupsList = el('div', {
    className: 'bl-events-meta-builder__groups bl-field-builder__list',
    dataset: { blEventsMetaGroups: '1' },
  });

  const emptyState = el('p', {
    className: 'bl-field-builder__empty description',
    text: i18n.emptyGroups || 'No metadata groups yet. Add a group to get started.',
  });

  const addGroupBtn = el('button', {
    type: 'button',
    className: 'button bl-button-small',
    text: i18n.addGroup || 'Add group',
  });

  root.appendChild(titleRow);
  root.appendChild(groupsList);
  root.appendChild(emptyState);
  root.appendChild(addGroupBtn);

  const syncEmpty = () => {
    const has = groupsList.querySelector('[data-bl-events-meta-group]') != null;
    emptyState.hidden = has;
  };

  const syncJson = () => {
    const titleInput = root.querySelector('[data-bl-events-meta-title]');
    const groups = {};
    groupsList.querySelectorAll(':scope > [data-bl-events-meta-group]').forEach((groupEl) => {
      const idInput = groupEl.querySelector('[data-bl-events-meta-group-id]');
      const titleG = groupEl.querySelector('[data-bl-events-meta-group-title]');
      let gid = idInput ? slugify(idInput.value) : '';
      if (gid === '') {
        gid = slugify(titleG ? titleG.value : '') || 'group';
      }
      let base = gid;
      let n = 2;
      while (groups[gid]) {
        gid = base + '_' + n;
        n += 1;
      }
      if (idInput) {
        idInput.value = gid;
      }
      const fields = {};
      const fieldsList = groupEl.querySelector('[data-bl-events-meta-fields]');
      if (fieldsList) {
        fieldsList.querySelectorAll(':scope > [data-bl-fb-field]').forEach((row) => {
          const serialized = serializeFieldRow(row);
          let fid = slugify(serialized.slug || serialized.title || '');
          if (fid === '') {
            fid = 'field';
          }
          let fbase = fid;
          let fn = 2;
          while (fields[fid]) {
            fid = fbase + '_' + fn;
            fn += 1;
          }
          const field = {
            type: serialized.type || 'text',
            label: serialized.title || fid,
          };
          if (serialized.help) {
            field.help = serialized.help;
          }
          if (serialized.placeholder) {
            field.placeholder = serialized.placeholder;
          }
          if (Array.isArray(serialized.options) && serialized.options.length) {
            field.options = serialized.options;
          }
          if (serialized.default_value != null && serialized.default_value !== '' && serialized.default_value !== false) {
            field.default_value = serialized.default_value;
          }
          fields[fid] = field;
        });
      }
      groups[gid] = {
        title: titleG ? titleG.value.trim() || gid : gid,
        fields,
      };
    });

    jsonInput.value = JSON.stringify({
      title: titleInput ? titleInput.value.trim() : '',
      groups,
    });
  };

  const createGroupCard = (groupId, groupData, open) => {
    const data = groupData && typeof groupData === 'object' ? groupData : { title: '', fields: {} };
    const listRow = createListRow({
      title: data.title || groupId || '',
      open,
      className: 'bl-events-meta-builder__group',
      dataset: { blEventsMetaGroup: '1' },
      untitled: '(untitled group)',
      dragTitle: i18n.dragGroup || 'Drag to reorder',
      deleteTitle: i18n.deleteGroup || 'Delete',
      onDelete: () => {
        listRow.root.remove();
        syncEmpty();
        syncJson();
      },
    });
    const { root: card, body, setTitle } = listRow;
    body.classList.add('bl-events-meta-builder__group-body');

    const idInput = el('input', {
      type: 'text',
      className: 'regular-text',
      dataset: { blEventsMetaGroupId: '1' },
      value: groupId || '',
    });
    const gTitleInput = el('input', {
      type: 'text',
      className: 'regular-text',
      dataset: { blEventsMetaGroupTitle: '1' },
      value: data.title || '',
    });

    body.appendChild(
      el('div', { className: 'bl-field-builder__form-row' }, [
        el('div', { className: 'bl-field-builder__form-label', text: i18n.groupId || 'Group ID' }),
        idInput,
      ])
    );
    body.appendChild(
      el('div', { className: 'bl-field-builder__form-row' }, [
        el('div', { className: 'bl-field-builder__form-label', text: i18n.groupTitle || 'Group title' }),
        gTitleInput,
      ])
    );

    const fieldsList = el('div', {
      className: 'bl-events-meta-builder__fields bl-field-builder__list',
      dataset: { blEventsMetaFields: '1' },
    });
    const fieldsEmpty = el('p', {
      className: 'description bl-events-meta-builder__fields-empty',
      text: i18n.emptyFields || 'No fields in this group.',
    });
    const addFieldBtn = el('button', {
      type: 'button',
      className: 'button bl-button-small',
      text: i18n.addField || 'Add field',
    });

    body.appendChild(
      el('h4', { className: 'bl-events-meta-builder__fields-heading', text: i18n.fields || 'Fields' })
    );
    body.appendChild(fieldsList);
    body.appendChild(fieldsEmpty);
    body.appendChild(addFieldBtn);

    const syncFieldsEmpty = () => {
      fieldsEmpty.hidden = fieldsList.querySelector('[data-bl-fb-field]') != null;
    };

    const addField = (fieldId, fieldCfg, fieldOpen) => {
      const f = fieldCfg && typeof fieldCfg === 'object' ? fieldCfg : {};
      const row = createFieldRow({
        mode: MODE,
        open: !!fieldOpen,
        ...ROW_OPTS,
        data: {
          type: f.type || 'text',
          title: f.label || '',
          slug: fieldId || '',
          help: f.help || '',
          placeholder: f.placeholder || '',
          options: f.options || [],
          default_value: f.default_value,
        },
      });
      fieldsList.appendChild(row);
      syncFieldsEmpty();
      return row;
    };

    Object.keys(data.fields || {}).forEach((fid) => {
      addField(fid, data.fields[fid], false);
    });
    syncFieldsEmpty();

    createSortable(fieldsList, {
      handle: '.bl-field-builder__item-handle',
      draggable: '[data-bl-fb-field]',
      group: { name: 'bl-events-meta-fields', pull: true, put: true },
      onSort: syncJson,
    });

    fieldsList.addEventListener('bl-fb-delete', (event) => {
      const row = event.target.closest('[data-bl-fb-field]');
      if (row && fieldsList.contains(row)) {
        row.remove();
        syncFieldsEmpty();
        syncJson();
      }
    });

    fieldsList.addEventListener('input', syncJson);
    fieldsList.addEventListener('change', syncJson);

    addFieldBtn.addEventListener('click', () => {
      addField('', { type: 'text', label: '' }, true);
      syncJson();
    });

    bindTitleSlugSync(gTitleInput, idInput, slugify);
    gTitleInput.addEventListener('input', () => {
      setTitle(gTitleInput.value);
      syncJson();
    });
    idInput.addEventListener('input', syncJson);

    return card;
  };

  Object.keys(initial.groups || {}).forEach((gid) => {
    groupsList.appendChild(createGroupCard(gid, initial.groups[gid], false));
  });
  syncEmpty();

  createSortable(groupsList, {
    handle: '.bl-field-builder__item-handle',
    draggable: '[data-bl-events-meta-group]',
    onSort: syncJson,
  });

  addGroupBtn.addEventListener('click', () => {
    groupsList.appendChild(createGroupCard('', { title: '', fields: {} }, true));
    syncEmpty();
    syncJson();
  });

  titleInputEl.addEventListener('input', syncJson);

  const form = root.closest('form');
  if (form) {
    form.addEventListener('submit', syncJson);
  }

  syncJson();
}

/**
 * Statuses tab builder: sortable rows + color preset select / custom picker.
 */
function bootStatusesBuilder() {
  const cfg = window.blEventsStatusesBuilder || {};
  const root = document.querySelector('[data-bl-events-statuses-builder]');
  const jsonInput = document.getElementById('bl-events-statuses-config-json');
  const FB = window.BlFieldBuilder;

  if (!root || !jsonInput || !FB) {
    return;
  }

  const { el, empty, createSortable, createListRow } = FB;
  const i18n = cfg.i18n || {};
  const presets = Array.isArray(cfg.colorPresets) ? cfg.colorPresets : [];
  const defaultToken = cfg.defaultColor || 'info';
  const CUSTOM = '__custom__';
  const reservedIds = { active: 1, custom: 1, enabled: 1, items: 1 };

  const newStatusId = () => {
    let id = '';
    do {
      const bytes = new Uint8Array(4);
      if (typeof crypto !== 'undefined' && typeof crypto.getRandomValues === 'function') {
        crypto.getRandomValues(bytes);
      } else {
        for (let i = 0; i < bytes.length; i += 1) {
          bytes[i] = Math.floor(Math.random() * 256);
        }
      }
      id =
        'st_' +
        Array.from(bytes)
          .map((b) => b.toString(16).padStart(2, '0'))
          .join('');
    } while (reservedIds[id]);
    return id;
  };

  let initial = {};
  try {
    initial = jsonInput.value ? JSON.parse(jsonInput.value) : {};
  } catch (e) {
    initial = cfg.initial || {};
  }
  if (!initial || typeof initial !== 'object' || Array.isArray(initial)) {
    initial = {};
  }

  empty(root);
  root.classList.add('bl-events-statuses-builder', 'bl-field-builder');

  const list = el('div', {
    className: 'bl-events-statuses-builder__list bl-field-builder__list',
    dataset: { blEventsStatusesList: '1' },
  });
  const emptyState = el('p', {
    className: 'bl-field-builder__empty description',
    text: i18n.empty || 'No statuses yet. Add a status to get started.',
  });
  const addBtn = el('button', {
    type: 'button',
    className: 'button bl-button-small',
    text: i18n.addStatus || 'Add status',
  });

  root.appendChild(list);
  root.appendChild(emptyState);
  root.appendChild(addBtn);

  const isHex = (value) => /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(String(value || '').trim());

  const tokenHex = (typeof cfg.statusColorHex === 'object' && cfg.statusColorHex) || {
    neutral: '#6f7882',
    info: '#366cd9',
    error: '#d1343a',
    warning: '#e97800',
    success: '#28a15a',
    accent: '#8257e5',
  };

  const hexForToken = (token) => tokenHex[token] || tokenHex[defaultToken] || '#366cd9';

  const normalizeHex = (value) => {
    const v = String(value || '').trim();
    if (!isHex(v)) {
      return hexForToken(defaultToken);
    }
    if (v.length === 4) {
      return (
        '#' +
        v
          .slice(1)
          .split('')
          .map((c) => c + c)
          .join('')
          .toLowerCase()
      );
    }
    return v.toLowerCase();
  };

  const parseStoredColor = (raw) => {
    const color = String(raw || '').trim();
    if (isHex(color)) {
      return { mode: CUSTOM, token: defaultToken, hex: normalizeHex(color) };
    }
    const token = color || defaultToken;
    const known = presets.some((p) => p.key === token);
    const mode = known ? token : defaultToken;
    return {
      mode,
      token: mode,
      hex: hexForToken(mode),
    };
  };

  const syncEmpty = () => {
    emptyState.hidden = list.querySelector('[data-bl-events-status]') != null;
  };

  const syncJson = () => {
    const statuses = {};
    list.querySelectorAll(':scope > [data-bl-events-status]').forEach((row) => {
      const labelInput = row.querySelector('[data-bl-events-status-label]');
      const colorSelect = row.querySelector('[data-bl-events-status-color-mode]');
      const hexInput = row.querySelector('[data-bl-events-status-color-hex]');
      let id = row.dataset.statusId ? String(row.dataset.statusId) : '';
      if (id === '' || reservedIds[id] || statuses[id]) {
        id = newStatusId();
        while (statuses[id]) {
          id = newStatusId();
        }
        row.dataset.statusId = id;
      }
      const mode = colorSelect ? colorSelect.value : defaultToken;
      let color = defaultToken;
      if (mode === CUSTOM) {
        color = normalizeHex(hexInput ? hexInput.value : hexForToken(defaultToken));
      } else if (mode) {
        color = mode;
      }
      const label = labelInput ? labelInput.value.trim() : '';
      statuses[id] = {
        label: label !== '' ? label : id,
        color,
      };
    });
    jsonInput.value = JSON.stringify(statuses);
  };

  const createStatusRow = (statusId, data, open) => {
    const rowData = data && typeof data === 'object' ? data : { label: '', color: defaultToken };
    const parsed = parseStoredColor(rowData.color);
    const id = String(statusId || '').trim() || newStatusId();

    const colorPreview = el('span', {
      className: 'bl-events-statuses-builder__swatch',
      title: parsed.mode === CUSTOM ? parsed.hex : parsed.mode,
      'aria-hidden': 'true',
    });
    if (parsed.mode === CUSTOM) {
      colorPreview.style.backgroundColor = parsed.hex;
    } else {
      colorPreview.dataset.token = parsed.mode;
      colorPreview.classList.add('bl-events-statuses-builder__swatch--token');
      colorPreview.style.setProperty('--bl-status-swatch', 'var(--bl-color-' + parsed.mode + ', ' + hexForToken(parsed.mode) + ')');
      colorPreview.style.backgroundColor = 'var(--bl-status-swatch)';
    }

    const listRow = createListRow({
      title: rowData.label || '',
      open,
      meta: colorPreview,
      className: 'bl-events-statuses-builder__row',
      dataset: { blEventsStatus: '1', statusId: id },
      dragTitle: i18n.drag || 'Drag to reorder',
      deleteTitle: i18n.delete || 'Delete',
      onDelete: () => {
        listRow.root.remove();
        syncEmpty();
        syncJson();
      },
    });
    const { root: card, body, setTitle, setMeta } = listRow;
    body.classList.add('bl-events-statuses-builder__body');

    const labelInput = el('input', {
      type: 'text',
      className: 'regular-text',
      dataset: { blEventsStatusLabel: '1' },
      value: rowData.label || '',
    });

    const colorSelect = el('select', {
      className: 'bl-events-statuses-builder__color-select',
      dataset: { blEventsStatusColorMode: '1' },
    });
    presets.forEach((preset) => {
      colorSelect.appendChild(
        el('option', {
          value: preset.key,
          text: preset.label || preset.key,
          selected: parsed.mode === preset.key ? true : undefined,
        })
      );
    });
    colorSelect.appendChild(
      el('option', {
        value: CUSTOM,
        text: i18n.customColor || 'Custom…',
        selected: parsed.mode === CUSTOM ? true : undefined,
      })
    );

    const hexInput = el('input', {
      type: 'color',
      className: 'bl-events-statuses-builder__color-picker',
      dataset: { blEventsStatusColorHex: '1' },
      value: parsed.hex,
    });
    const hexText = el('input', {
      type: 'text',
      className: 'regular-text bl-events-statuses-builder__color-hex',
      value: parsed.hex,
      placeholder: hexForToken(defaultToken),
    });
    const customWrap = el(
      'div',
      {
        className: 'bl-events-statuses-builder__custom-color',
        hidden: parsed.mode === CUSTOM ? undefined : true,
      },
      [
        el('div', {
          className: 'bl-field-builder__form-label',
          text: i18n.customColorLabel || 'Custom color',
        }),
        el('div', { className: 'bl-events-statuses-builder__custom-color-row' }, [hexInput, hexText]),
      ]
    );

    body.appendChild(
      el('div', { className: 'bl-field-builder__form-row' }, [
        el('div', { className: 'bl-field-builder__form-label', text: i18n.statusLabel || 'Label' }),
        labelInput,
      ])
    );
    body.appendChild(
      el('div', { className: 'bl-field-builder__form-row' }, [
        el('div', { className: 'bl-field-builder__form-label', text: i18n.color || 'Color' }),
        colorSelect,
      ])
    );
    body.appendChild(customWrap);

    const updateSwatch = () => {
      const mode = colorSelect.value;
      if (mode === CUSTOM) {
        const hex = normalizeHex(hexInput.value);
        colorPreview.classList.remove('bl-events-statuses-builder__swatch--token');
        colorPreview.style.backgroundColor = hex;
        colorPreview.title = hex;
        delete colorPreview.dataset.token;
      } else {
        colorPreview.classList.add('bl-events-statuses-builder__swatch--token');
        colorPreview.style.setProperty('--bl-status-swatch', 'var(--bl-color-' + mode + ', ' + hexForToken(mode) + ')');
        colorPreview.style.backgroundColor = 'var(--bl-status-swatch)';
        colorPreview.title = mode;
        colorPreview.dataset.token = mode;
      }
      setMeta(colorPreview);
    };

    const syncCustomVisibility = () => {
      const isCustom = colorSelect.value === CUSTOM;
      customWrap.hidden = !isCustom;
      updateSwatch();
      syncJson();
    };

    labelInput.addEventListener('input', () => {
      setTitle(labelInput.value);
      syncJson();
    });

    colorSelect.addEventListener('change', syncCustomVisibility);

    hexInput.addEventListener('input', () => {
      hexText.value = hexInput.value;
      updateSwatch();
      syncJson();
    });
    hexText.addEventListener('input', () => {
      const v = hexText.value.trim();
      if (isHex(v)) {
        hexInput.value = normalizeHex(v);
        updateSwatch();
      }
      syncJson();
    });
    hexText.addEventListener('change', () => {
      if (isHex(hexText.value)) {
        hexText.value = normalizeHex(hexText.value);
        hexInput.value = hexText.value;
      } else {
        hexText.value = normalizeHex(hexInput.value);
      }
      updateSwatch();
      syncJson();
    });

    return card;
  };

  Object.keys(initial).forEach((id) => {
    list.appendChild(createStatusRow(id, initial[id], false));
  });
  syncEmpty();

  createSortable(list, {
    handle: '.bl-field-builder__item-handle',
    draggable: '[data-bl-events-status]',
    onSort: syncJson,
  });

  addBtn.addEventListener('click', () => {
    list.appendChild(createStatusRow(newStatusId(), { label: '', color: defaultToken }, true));
    syncEmpty();
    syncJson();
  });

  const form = root.closest('form');
  if (form) {
    form.addEventListener('submit', syncJson);
  }

  syncJson();
}

function boot() {
  bootMenuIconField();
  bootMetaBuilder();
  bootStatusesBuilder();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot);
} else {
  boot();
}
