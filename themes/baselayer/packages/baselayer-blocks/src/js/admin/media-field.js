/**
 * Media library picker for Blocks image/file field values.
 */
import { createSortable } from '../../../../../src/js/admin/canvas-builder/sortable.js';

function el(tag, props = {}, children = []) {
  const node = document.createElement(tag);
  Object.entries(props).forEach(([key, value]) => {
    if (value == null || value === false) return;
    if (key === 'className') node.className = value;
    else if (key === 'text') node.textContent = value;
    else if (key === 'html') node.innerHTML = value;
    else if (key === 'dataset') Object.assign(node.dataset, value);
    else if (key.startsWith('on') && typeof value === 'function') {
      node.addEventListener(key.slice(2).toLowerCase(), value);
    } else if (key === 'checked') node.checked = Boolean(value);
    else if (key === 'value') node.value = value === true ? '' : String(value);
    else node.setAttribute(key, value === true ? '' : String(value));
  });
  (Array.isArray(children) ? children : [children]).forEach((child) => {
    if (child == null || child === false) return;
    node.appendChild(typeof child === 'string' ? document.createTextNode(child) : child);
  });
  return node;
}

function i18n(key, fallback) {
  const dict =
    (window.blBlocksFieldUi && window.blBlocksFieldUi.i18n) ||
    (window.blBlocksEditor && window.blBlocksEditor.i18n) ||
    (window.blBlocksPage && window.blBlocksPage.i18n) ||
    (window.blBlocksAdmin && window.blBlocksAdmin.i18n) ||
    {};
  return dict[key] || fallback || key;
}

/**
 * @param {unknown} current
 * @param {boolean} multiple
 * @returns {number[]}
 */
export function normalizeAttachmentIds(current, multiple) {
  if (multiple) {
    const list = Array.isArray(current) ? current : current != null && current !== '' ? [current] : [];
    return list.map((id) => Number(id) || 0).filter((id) => id > 0);
  }
  const one = Number(Array.isArray(current) ? current[0] : current) || 0;
  return one > 0 ? [one] : [];
}

/**
 * @param {object} json
 * @returns {{ id: number, url: string, filename: string, mime: string, type: string, alt: string }}
 */
function attachmentFromJson(json) {
  const sizes = json.sizes || {};
  const url =
    (sizes.thumbnail && sizes.thumbnail.url) ||
    (sizes.medium && sizes.medium.url) ||
    json.url ||
    json.icon ||
    '';
  return {
    id: Number(json.id) || 0,
    url: String(url || ''),
    filename: String(json.filename || json.title || ('#' + (json.id || ''))),
    mime: String(json.mime || json.mime_type || ''),
    type: String(json.type || ''),
    alt: String(json.alt || json.alt_text || json.title || ''),
  };
}

/**
 * @param {number} id
 * @returns {Promise<{ id: number, url: string, filename: string, mime: string, type: string, alt: string }>}
 */
function fetchAttachment(id) {
  return new Promise((resolve) => {
    if (!id || typeof wp === 'undefined' || !wp.media || !wp.media.attachment) {
      resolve({ id, url: '', filename: '#' + id, mime: '', type: '', alt: '' });
      return;
    }
    const att = wp.media.attachment(id);
    const done = () => {
      try {
        resolve(attachmentFromJson(att.toJSON()));
      } catch (e) {
        resolve({ id, url: '', filename: '#' + id, mime: '', type: '', alt: '' });
      }
    };
    if (att.get('url')) {
      done();
      return;
    }
    att.fetch().done(done).fail(() => {
      resolve({ id, url: '', filename: '#' + id, mime: '', type: '', alt: '' });
    });
  });
}

function extensionBadge(filename) {
  const parts = String(filename || '').split('.');
  const ext = parts.length > 1 ? parts.pop().toUpperCase() : 'FILE';
  return ext.slice(0, 4);
}

/**
 * @param {{ id: number, url: string, filename: string, mime: string, type: string, alt: string }} item
 * @param {'image'|'file'} kind
 * @param {(id: number) => void} onRemove
 * @returns {HTMLElement}
 */
function buildMediaCard(item, kind, onRemove) {
  const isImage = item.type === 'image' || kind === 'image';
  const card = el('div', {
    className: 'bl-blocks-fields__media-card' + (isImage ? ' is-image' : ' is-file'),
    dataset: { mediaId: String(item.id) },
  });

  if (isImage && item.url) {
    card.appendChild(
      el('img', {
        className: 'bl-blocks-fields__media-thumb',
        src: item.url,
        alt: item.alt || '',
      })
    );
  } else if (isImage) {
    card.appendChild(
      el('span', {
        className: 'bl-blocks-fields__media-badge',
        text: 'IMG',
        'aria-hidden': 'true',
      })
    );
  } else {
    card.appendChild(
      el('span', {
        className: 'bl-blocks-fields__media-badge',
        text: extensionBadge(item.filename),
        'aria-hidden': 'true',
      })
    );
  }

  card.appendChild(
    el('span', {
      className: 'bl-blocks-fields__media-name',
      text: item.filename,
      title: item.filename,
    })
  );

  const removeBtn = el(
    'button',
    {
      type: 'button',
      className: 'button-link bl-blocks-fields__card-remove',
      title: i18n('removeMedia', 'Remove'),
      'aria-label': i18n('removeMedia', 'Remove'),
      dataset: { blMediaRemove: String(item.id) },
    },
    [el('span', { className: 'bl-icon -icon-close', 'aria-hidden': 'true' })]
  );
  removeBtn.addEventListener('click', (evt) => {
    evt.preventDefault();
    evt.stopPropagation();
    onRemove(item.id);
  });
  card.appendChild(removeBtn);

  return card;
}

/**
 * Enable drag-reorder for multi-select media lists.
 *
 * @param {HTMLElement} preview
 * @param {{ getSelected: () => Array<{id:number}>, setSelected: (next: Array) => void, onChange?: () => void }} api
 * @returns {import('sortablejs').default|null}
 */
function bindMediaSortable(preview, api) {
  if (!preview) return null;
  preview.classList.add('is-sortable');
  return createSortable(preview, {
    animation: 150,
    draggable: '.bl-blocks-fields__media-card',
    filter: '.bl-blocks-fields__card-remove',
    preventOnFilter: true,
    ghostClass: 'is-dragging-ghost',
    chosenClass: 'is-dragging-chosen',
    onEnd: () => {
      const ids = Array.from(preview.querySelectorAll('.bl-blocks-fields__media-card[data-media-id]'))
        .map((node) => Number(node.getAttribute('data-media-id')) || 0)
        .filter((id) => id > 0);
      const byId = new Map(api.getSelected().map((item) => [item.id, item]));
      const next = [];
      ids.forEach((id) => {
        const item = byId.get(id);
        if (item) next.push(item);
      });
      api.setSelected(next);
      if (typeof api.onChange === 'function') {
        api.onChange();
      }
    },
  });
}

/**
 * @param {object} field
 * @param {unknown} current
 * @returns {HTMLElement & { getMediaValue: () => number|number[] }}
 */
export function createMediaPickerControl(field, current) {
  const kind = field.type === 'image' ? 'image' : 'file';
  const multiple = !!field.multiple;
  const maxFiles = Math.max(1, Math.min(50, parseInt(field.max_files, 10) || 10));
  /** @type {Array<{ id: number, url: string, filename: string, mime: string, type: string, alt: string }>} */
  let selected = normalizeAttachmentIds(current, multiple).map((id) => ({
    id,
    url: '',
    filename: '#' + id,
    mime: '',
    type: kind === 'image' ? 'image' : '',
    alt: '',
  }));

  const preview = el('div', {
    className: 'bl-blocks-fields__media-preview' + (multiple ? ' is-sortable' : ''),
    dataset: { blMediaPreview: '' },
  });
  const empty = el('span', {
    className: 'description bl-blocks-fields__media-empty',
    text:
      kind === 'image'
        ? multiple
          ? i18n('chooseImagesHelp', 'Select one or more images.')
          : i18n('chooseImageHelp', 'Select an image.')
        : multiple
          ? i18n('chooseFilesHelp', 'Select one or more files.')
          : i18n('chooseFileHelp', 'Select a file.'),
    dataset: { blMediaEmpty: '' },
  });

  const chooseBtn = el('button', {
    type: 'button',
    className: 'button bl-button',
    text: '',
    dataset: { blMediaChoose: '' },
  });
  const clearBtn = el('button', {
    type: 'button',
    className: 'button-link',
    text: i18n('clearMedia', 'Clear'),
    dataset: { blMediaClear: '' },
  });

  const actions = el('div', { className: 'bl-blocks-fields__media-actions' }, [
    chooseBtn,
    clearBtn,
  ]);

  const wrap = el(
    'div',
    {
      className: 'bl-blocks-fields__media-picker',
      dataset: {
        blBlocksMediaPicker: '',
        mediaKind: kind,
        multiple: multiple ? '1' : '0',
      },
    },
    [preview, empty, actions]
  );

  let frame = null;
  let sortable = null;

  const syncChrome = () => {
    const has = selected.length > 0;
    empty.hidden = has;
    clearBtn.hidden = !has;
    if (kind === 'image') {
      chooseBtn.textContent = has
        ? multiple
          ? i18n('changeImages', 'Change images')
          : i18n('changeImage', 'Change image')
        : multiple
          ? i18n('chooseImages', 'Choose images')
          : i18n('chooseImage', 'Choose image');
    } else {
      chooseBtn.textContent = has
        ? multiple
          ? i18n('changeFiles', 'Change files')
          : i18n('changeFile', 'Change file')
        : multiple
          ? i18n('chooseFiles', 'Choose files')
          : i18n('chooseFile', 'Choose file');
    }
  };

  const renderPreview = () => {
    preview.replaceChildren();
    selected.forEach((item) => {
      preview.appendChild(
        buildMediaCard(item, kind, (id) => {
          selected = selected.filter((s) => s.id !== id);
          renderPreview();
          wrap.dispatchEvent(new Event('change', { bubbles: true }));
        })
      );
    });
    syncChrome();
  };

  if (multiple) {
    sortable = bindMediaSortable(preview, {
      getSelected: () => selected,
      setSelected: (next) => {
        selected = next;
      },
      onChange: () => {
        wrap.dispatchEvent(new Event('change', { bubbles: true }));
      },
    });
  }

  const hydrate = () => {
    const ids = selected.map((s) => s.id);
    if (ids.length === 0) {
      renderPreview();
      return;
    }
    Promise.all(ids.map((id) => fetchAttachment(id))).then((items) => {
      selected = items.filter((item) => item.id > 0);
      renderPreview();
    });
  };

  const openFrame = () => {
    if (typeof wp === 'undefined' || !wp.media) {
      return;
    }
    if (frame) {
      frame.open();
      return;
    }
    const opts = {
      title:
        kind === 'image'
          ? multiple
            ? i18n('mediaPickerTitleImages', 'Select images')
            : i18n('mediaPickerTitleImage', 'Select image')
          : multiple
            ? i18n('mediaPickerTitleFiles', 'Select files')
            : i18n('mediaPickerTitleFile', 'Select file'),
      button: {
        text: i18n('selectMedia', 'Select'),
      },
      multiple: multiple,
    };
    if (kind === 'image') {
      opts.library = { type: 'image' };
    }
    frame = wp.media(opts);
    frame.on('select', () => {
      const selection = frame.state().get('selection');
      if (!selection) return;
      let items = selection.map((model) => attachmentFromJson(model.toJSON()));
      if (multiple) {
        items = items.slice(0, maxFiles);
      } else {
        items = items.slice(0, 1);
      }
      selected = items.filter((item) => item.id > 0);
      renderPreview();
      wrap.dispatchEvent(new Event('change', { bubbles: true }));
    });
    frame.on('open', () => {
      const selection = frame.state().get('selection');
      if (!selection) return;
      selection.reset();
      selected.forEach((item) => {
        const att = wp.media.attachment(item.id);
        selection.add(att);
        att.fetch();
      });
    });
    frame.open();
  };

  chooseBtn.addEventListener('click', (evt) => {
    evt.preventDefault();
    openFrame();
  });

  clearBtn.addEventListener('click', (evt) => {
    evt.preventDefault();
    selected = [];
    renderPreview();
    wrap.dispatchEvent(new Event('change', { bubbles: true }));
  });

  /** @type {HTMLElement & { getMediaValue: () => number|number[] }} */
  const control = /** @type {any} */ (wrap);
  control.getMediaValue = () => {
    const ids = selected.map((s) => s.id).filter((id) => id > 0);
    if (multiple) return ids;
    return ids[0] || 0;
  };

  hydrate();
  return control;
}

/**
 * Bind PHP-rendered media pickers (Website settings).
 *
 * @param {ParentNode} [root=document]
 */
export function bindMediaPickers(root = document) {
  const scope = root && root.querySelectorAll ? root : document;
  scope.querySelectorAll('[data-bl-blocks-media-picker]').forEach((wrap) => {
    if (!(wrap instanceof HTMLElement) || wrap.dataset.blMediaBound === '1') return;
    wrap.dataset.blMediaBound = '1';

    const kind = wrap.dataset.mediaKind === 'image' ? 'image' : 'file';
    const multiple = wrap.dataset.multiple === '1';
    const inputName = wrap.dataset.inputName || '';
    const maxFiles = Math.max(1, Math.min(50, parseInt(wrap.dataset.maxFiles || '10', 10) || 10));
    const preview = wrap.querySelector('[data-bl-media-preview]');
    const empty = wrap.querySelector('[data-bl-media-empty]');
    const chooseBtn = wrap.querySelector('[data-bl-media-choose]');
    const clearBtn = wrap.querySelector('[data-bl-media-clear]');
    const inputsHost = wrap.querySelector('[data-bl-media-inputs]');
    if (!preview || !chooseBtn || !inputsHost || !inputName) return;

    /** @type {Array<{ id: number, url: string, filename: string, mime: string, type: string, alt: string }>} */
    let selected = [];
    inputsHost.querySelectorAll('input[type="hidden"]').forEach((input) => {
      const id = Number(input.value) || 0;
      if (id <= 0) return;
      selected.push({
        id,
        url: input.getAttribute('data-url') || '',
        filename: input.getAttribute('data-filename') || ('#' + id),
        mime: input.getAttribute('data-mime') || '',
        type: input.getAttribute('data-type') || (kind === 'image' ? 'image' : ''),
        alt: input.getAttribute('data-alt') || '',
      });
    });

    let frame = null;

    const syncInputs = () => {
      inputsHost.replaceChildren();
      if (selected.length === 0) {
        if (multiple) {
          inputsHost.appendChild(el('input', { type: 'hidden', name: inputName + '[]', value: '' }));
        } else {
          inputsHost.appendChild(el('input', { type: 'hidden', name: inputName, value: '' }));
        }
        return;
      }
      selected.forEach((item) => {
        const name = multiple ? inputName + '[]' : inputName;
        const input = el('input', {
          type: 'hidden',
          name,
          value: String(item.id),
        });
        input.setAttribute('data-url', item.url || '');
        input.setAttribute('data-filename', item.filename || '');
        input.setAttribute('data-mime', item.mime || '');
        input.setAttribute('data-type', item.type || '');
        input.setAttribute('data-alt', item.alt || '');
        inputsHost.appendChild(input);
      });
    };

    const syncChrome = () => {
      const has = selected.length > 0;
      if (empty) empty.hidden = has;
      if (clearBtn) clearBtn.hidden = !has;
      if (kind === 'image') {
        chooseBtn.textContent = has
          ? multiple
            ? i18n('changeImages', 'Change images')
            : i18n('changeImage', 'Change image')
          : multiple
            ? i18n('chooseImages', 'Choose images')
            : i18n('chooseImage', 'Choose image');
      } else {
        chooseBtn.textContent = has
          ? multiple
            ? i18n('changeFiles', 'Change files')
            : i18n('changeFile', 'Change file')
          : multiple
            ? i18n('chooseFiles', 'Choose files')
            : i18n('chooseFile', 'Choose file');
      }
    };

    const renderPreview = () => {
      preview.replaceChildren();
      selected.forEach((item) => {
        preview.appendChild(
          buildMediaCard(item, kind, (id) => {
            selected = selected.filter((s) => s.id !== id);
            renderPreview();
          })
        );
      });
      syncChrome();
      syncInputs();
    };

    if (multiple) {
      preview.classList.add('is-sortable');
      bindMediaSortable(preview, {
        getSelected: () => selected,
        setSelected: (next) => {
          selected = next;
        },
        onChange: () => {
          syncInputs();
        },
      });
    }

    const openFrame = () => {
      if (typeof wp === 'undefined' || !wp.media) return;
      if (frame) {
        frame.open();
        return;
      }
      const opts = {
        title:
          kind === 'image'
            ? multiple
              ? i18n('mediaPickerTitleImages', 'Select images')
              : i18n('mediaPickerTitleImage', 'Select image')
            : multiple
              ? i18n('mediaPickerTitleFiles', 'Select files')
              : i18n('mediaPickerTitleFile', 'Select file'),
        button: { text: i18n('selectMedia', 'Select') },
        multiple,
      };
      if (kind === 'image') {
        opts.library = { type: 'image' };
      }
      frame = wp.media(opts);
      frame.on('select', () => {
        const selection = frame.state().get('selection');
        if (!selection) return;
        let items = selection.map((model) => attachmentFromJson(model.toJSON()));
        items = multiple ? items.slice(0, maxFiles) : items.slice(0, 1);
        selected = items.filter((item) => item.id > 0);
        renderPreview();
      });
      frame.on('open', () => {
        const selection = frame.state().get('selection');
        if (!selection) return;
        selection.reset();
        selected.forEach((item) => {
          const att = wp.media.attachment(item.id);
          selection.add(att);
          att.fetch();
        });
      });
      frame.open();
    };

    chooseBtn.addEventListener('click', (evt) => {
      evt.preventDefault();
      openFrame();
    });
    if (clearBtn) {
      clearBtn.addEventListener('click', (evt) => {
        evt.preventDefault();
        selected = [];
        renderPreview();
      });
    }

    const needsHydrate = selected.some((s) => !s.url);
    if (needsHydrate) {
      Promise.all(selected.map((s) => fetchAttachment(s.id))).then((items) => {
        selected = items.filter((item) => item.id > 0);
        renderPreview();
      });
    } else {
      renderPreview();
    }
  });
}
