import { el, t, readConfig } from './dom.js';

const FORMAT = 'baselayer-form-fields';
const VERSION = 1;

/**
 * @param {unknown} data
 * @returns {array|null}
 */
export function extractFieldsFromImport(data) {
  if (Array.isArray(data)) {
    return data;
  }
  if (!data || typeof data !== 'object') {
    return null;
  }
  if (Array.isArray(data.fields)) {
    return data.fields;
  }
  return null;
}

/**
 * @param {array} fields
 */
function downloadFieldsExport(fields) {
  const payload = {
    format: FORMAT,
    version: VERSION,
    exported_at: new Date().toISOString(),
    fields: fields || [],
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], {
    type: 'application/json',
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  const titleInput = document.getElementById('title');
  const raw =
    (titleInput && titleInput.value.trim()) ||
    document.querySelector('#title-prompt-text')?.textContent?.trim() ||
    'form';
  const slug = raw
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'form';
  a.href = url;
  a.download = `${slug}-fields.json`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

/**
 * Confirm overwrite before applying imported fields.
 *
 * @param {array} fields
 * @param {(fields: array) => void} onConfirm
 */
function openImportConfirmModal(fields, onConfirm) {
  document.querySelectorAll('.bl-forms-builder__modal').forEach((node) => node.remove());

  const title = t('importOverwriteTitle', 'Import fields?');
  const backdrop = el('div', {
    className: 'bl-forms-builder__modal',
    role: 'dialog',
    'aria-modal': 'true',
    'aria-label': title,
  });

  const close = () => {
    document.removeEventListener('keydown', onKey);
    backdrop.remove();
  };

  const apply = () => {
    onConfirm(fields);
    close();
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

  const dialog = el('div', { className: 'bl-forms-builder__modal-dialog' });
  const header = el('div', { className: 'bl-forms-builder__modal-header' }, [
    el('h2', {
      className: 'bl-forms-builder__modal-title',
      text: title,
    }),
  ]);

  const body = el('div', { className: 'bl-forms-builder__modal-body' }, [
    el('p', {
      text: t(
        'importOverwriteMessage',
        'Importing will overwrite all existing fields on this form. Settings (emails, messages, security) are not changed. This cannot be undone until you save or discard.'
      ),
    }),
  ]);

  const footer = el('div', { className: 'bl-forms-builder__modal-footer' }, [
    el('button', {
      type: 'button',
      className: 'button',
      text: t('cancel', 'Cancel'),
      onClick: close,
    }),
    el('button', {
      type: 'button',
      className: 'button button-primary',
      text: t('importOverwriteConfirm', 'Overwrite fields'),
      onClick: apply,
    }),
  ]);

  dialog.append(header, body, footer);
  backdrop.appendChild(dialog);
  document.body.appendChild(backdrop);
}

/**
 * Wire Publish-box Import / Export buttons.
 *
 * @param {{ getFields: () => array, replaceFields: (fields: array) => void }} canvas
 */
export function bindImportExport(canvas) {
  const exportBtn = document.querySelector('[data-bl-forms-export]');
  const importBtn = document.querySelector('[data-bl-forms-import]');
  if (!exportBtn && !importBtn) {
    return;
  }

  const fileInput = document.createElement('input');
  fileInput.type = 'file';
  fileInput.accept = 'application/json,.json';
  fileInput.hidden = true;
  document.body.appendChild(fileInput);

  exportBtn?.addEventListener('click', () => {
    const fields = typeof canvas.getFields === 'function' ? canvas.getFields() : readConfig().fields || [];
    downloadFieldsExport(fields);
  });

  importBtn?.addEventListener('click', () => {
    fileInput.value = '';
    fileInput.click();
  });

  fileInput.addEventListener('change', () => {
    const file = fileInput.files?.[0];
    if (!file) {
      return;
    }
    const reader = new FileReader();
    reader.onerror = () => {
      window.alert(t('importReadError', 'Could not read the selected file.'));
    };
    reader.onload = () => {
      let parsed;
      try {
        parsed = JSON.parse(String(reader.result || ''));
      } catch (e) {
        window.alert(t('importInvalid', 'This file is not a valid form fields export.'));
        return;
      }
      const fields = extractFieldsFromImport(parsed);
      if (!fields) {
        window.alert(t('importInvalid', 'This file is not a valid form fields export.'));
        return;
      }
      openImportConfirmModal(fields, (next) => {
        canvas.replaceFields(next);
      });
    };
    reader.readAsText(file);
  });
}
