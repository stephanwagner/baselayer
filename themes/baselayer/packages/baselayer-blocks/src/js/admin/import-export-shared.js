/**
 * Shared confirm modal + definition import helpers (edit screen + Settings).
 * Uses plain DOM so Settings (no BlFormBuilder) can share the same UX.
 * Classes are Blocks-scoped so they do not override form-builder field modals.
 */

/**
 * @param {object} opts
 * @param {string} opts.title
 * @param {string} opts.message
 * @param {string} [opts.confirmLabel]
 * @param {string} [opts.cancelLabel]
 * @param {boolean} [opts.hideCancel] single-button alert (errors)
 * @param {() => void} [opts.onConfirm]
 */
export function openConfirmModal(opts) {
  document.querySelectorAll('.bl-blocks-confirm-modal').forEach((node) => node.remove());

  const title = opts.title || 'Confirm';
  const hideCancel = !!opts.hideCancel;
  const backdrop = document.createElement('div');
  backdrop.className = 'bl-blocks-confirm-modal';
  backdrop.setAttribute('role', 'dialog');
  backdrop.setAttribute('aria-modal', 'true');
  backdrop.setAttribute('aria-label', title);

  const close = () => {
    document.removeEventListener('keydown', onKey);
    backdrop.remove();
  };

  const onKey = (evt) => {
    if (evt.key === 'Escape') {
      close();
    }
  };
  document.addEventListener('keydown', onKey);

  backdrop.addEventListener('click', (evt) => {
    if (evt.target === backdrop) {
      close();
    }
  });

  const dialog = document.createElement('div');
  dialog.className = 'bl-blocks-confirm-modal__dialog';

  const header = document.createElement('div');
  header.className = 'bl-blocks-confirm-modal__header';
  const heading = document.createElement('h2');
  heading.className = 'bl-blocks-confirm-modal__title';
  heading.textContent = title;
  header.appendChild(heading);

  const body = document.createElement('div');
  body.className = 'bl-blocks-confirm-modal__body';
  const p = document.createElement('p');
  p.textContent = opts.message || '';
  body.appendChild(p);

  const footer = document.createElement('div');
  footer.className = 'bl-blocks-confirm-modal__footer';

  if (!hideCancel) {
    const cancelBtn = document.createElement('button');
    cancelBtn.type = 'button';
    cancelBtn.className = 'button';
    cancelBtn.textContent = opts.cancelLabel || 'Cancel';
    cancelBtn.addEventListener('click', close);
    footer.appendChild(cancelBtn);
  }

  const confirmBtn = document.createElement('button');
  confirmBtn.type = 'button';
  confirmBtn.className = 'button button-primary';
  confirmBtn.textContent = opts.confirmLabel || (hideCancel ? 'OK' : 'Confirm');
  confirmBtn.addEventListener('click', () => {
    opts.onConfirm?.();
    close();
  });

  footer.appendChild(confirmBtn);
  dialog.append(header, body, footer);
  backdrop.appendChild(dialog);
  document.body.appendChild(backdrop);
  confirmBtn.focus();
}

/**
 * Message-only modal (import errors, etc.).
 *
 * @param {object} opts
 * @param {string} opts.title
 * @param {string} opts.message
 * @param {string} [opts.confirmLabel]
 */
export function openAlertModal(opts) {
  openConfirmModal({
    title: opts.title,
    message: opts.message,
    confirmLabel: opts.confirmLabel || 'OK',
    hideCancel: true,
  });
}

/**
 * @param {unknown} data
 * @returns {object|null} single definition item
 */
export function normalizeDefinitionImport(data) {
  if (!data || typeof data !== 'object') {
    return null;
  }
  if (Array.isArray(data)) {
    if (data.length !== 1 || !data[0] || typeof data[0] !== 'object') {
      return null;
    }
    return data[0];
  }
  // Settings "All" envelope — not for single-edit import.
  if (Array.isArray(data.definitions)) {
    if (data.definitions.length === 1) {
      return data.definitions[0];
    }
    return null;
  }
  // Block options store only.
  if (data.presets != null || (data.blocks != null && !data.type && !data.fields)) {
    return null;
  }
  if (data.type || data.fields || data.settings) {
    return data;
  }
  return null;
}

/**
 * @param {object} item
 * @param {string} expectedType
 */
export function definitionTypeMatches(item, expectedType) {
  if (!item || typeof item !== 'object') {
    return false;
  }
  const type = String(item.type || '');
  return type === '' || type === expectedType;
}

/**
 * @param {string} filename
 * @param {object} payload
 */
export function downloadJson(filename, payload) {
  const blob = new Blob([JSON.stringify(payload, null, 2)], {
    type: 'application/json',
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

/**
 * @param {string} text
 */
export function slugifyFilename(text) {
  return (
    String(text || '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'definition'
  );
}
