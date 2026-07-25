import { el, t, readConfig } from './dom.js';

const FORMAT = 'baselayer-form';
const FORMAT_LEGACY = 'baselayer-form-fields';
const VERSION = 2;

/** Keys that are form-local UI/runtime only and should not travel with exports. */
const SETTINGS_EXPORT_SKIP = new Set([
  'honeypot_name',
  'redirect_page_title',
  'redirect_page_url',
  'min_fill_time_enabled',
  'min_fill_time',
  'rate_limit_enabled',
  'rate_limit_max',
  'rate_limit_window',
  'upload_max_size_mb',
]);

/**
 * Settings worth exporting: filled strings, form toggles, and non-zero ids.
 *
 * @param {object} settings
 * @returns {object}
 */
export function pickExportSettings(settings) {
  const out = {};
  Object.entries(settings || {}).forEach(([key, value]) => {
    if (SETTINGS_EXPORT_SKIP.has(key)) {
      return;
    }
    if (typeof value === 'string') {
      if (value.trim() !== '') {
        out[key] = value;
      }
      return;
    }
    if (typeof value === 'boolean') {
      out[key] = value;
      return;
    }
    if (typeof value === 'number' && value !== 0) {
      out[key] = value;
    }
  });
  return out;
}

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
 * @param {unknown} data
 * @returns {object}
 */
export function extractSettingsFromImport(data) {
  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    return {};
  }
  if (!data.settings || typeof data.settings !== 'object' || Array.isArray(data.settings)) {
    return {};
  }
  return pickExportSettings(data.settings);
}

/**
 * @param {array} fields
 * @param {object} [settings]
 */
function downloadFormExport(fields, settings = {}) {
  const exportedSettings = pickExportSettings(settings);
  const payload = {
    format: FORMAT,
    version: VERSION,
    exported_at: new Date().toISOString(),
    fields: fields || [],
  };
  if (Object.keys(exportedSettings).length > 0) {
    payload.settings = exportedSettings;
  }
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
  const slug =
    raw
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'form';
  a.href = url;
  a.download = `${slug}-form.json`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

/**
 * Confirm overwrite before applying imported fields (+ optional settings).
 *
 * @param {array} fields
 * @param {object} settings
 * @param {(fields: array, settings: object) => void} onConfirm
 */
function openImportConfirmModal(fields, settings, onConfirm) {
  document.querySelectorAll('.bl-forms-builder__modal').forEach((node) => node.remove());

  const hasSettings = Object.keys(settings || {}).length > 0;
  const title = hasSettings
    ? t('importOverwriteTitleWithSettings', 'Import form?')
    : t('importOverwriteTitle', 'Import fields?');
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
    onConfirm(fields, settings || {});
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
      text: hasSettings
        ? t(
            'importOverwriteMessageWithSettings',
            'Importing will overwrite all existing fields on this form and apply any messages, subjects, and other texts included in the file. This cannot be undone until you save or discard.'
          )
        : t(
            'importOverwriteMessage',
            'Importing will overwrite all existing fields on this form. Settings (emails, messages) are not changed because this file does not include them. This cannot be undone until you save or discard.'
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
      text: hasSettings
        ? t('importOverwriteConfirmWithSettings', 'Overwrite form')
        : t('importOverwriteConfirm', 'Overwrite fields'),
      onClick: apply,
    }),
  ]);

  dialog.append(header, body, footer);
  backdrop.appendChild(dialog);
  document.body.appendChild(backdrop);
}

/**
 * @param {unknown} data
 */
function isValidImportPayload(data) {
  if (Array.isArray(data)) {
    return true;
  }
  if (!data || typeof data !== 'object') {
    return false;
  }
  if (data.format && data.format !== FORMAT && data.format !== FORMAT_LEGACY) {
    return false;
  }
  return Array.isArray(data.fields);
}

/**
 * Wire Publish-box Import / Export buttons.
 *
 * @param {{ getFields: () => array, replaceFields: (fields: array) => void }} canvas
 * @param {{ getSettings?: () => object, applySettings?: (partial: object) => void }} [panels]
 */
export function bindImportExport(canvas, panels = null) {
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
    const settings =
      typeof panels?.getSettings === 'function' ? panels.getSettings() : readConfig().settings || {};
    downloadFormExport(fields, settings);
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
        window.alert(t('importInvalid', 'This file is not a valid form export.'));
        return;
      }
      if (!isValidImportPayload(parsed)) {
        window.alert(t('importInvalid', 'This file is not a valid form export.'));
        return;
      }
      const fields = extractFieldsFromImport(parsed);
      if (!fields) {
        window.alert(t('importInvalid', 'This file is not a valid form export.'));
        return;
      }
      const settings = extractSettingsFromImport(parsed);
      openImportConfirmModal(fields, settings, (nextFields, nextSettings) => {
        canvas.replaceFields(nextFields);
        if (
          nextSettings &&
          Object.keys(nextSettings).length > 0 &&
          typeof panels?.applySettings === 'function'
        ) {
          panels.applySettings(nextSettings);
        }
      });
    };
    reader.readAsText(file);
  });
}
