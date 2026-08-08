/**
 * Definition edit screen — Export / Import (Settings-compatible JSON).
 */
import {
  openConfirmModal,
  openAlertModal,
  normalizeDefinitionImport,
  definitionTypeMatches,
  downloadJson,
  slugifyFilename,
} from './import-export-shared.js';

function t(key, fallback) {
  const dict = (window.blBlocksAdmin && window.blBlocksAdmin.i18n) || {};
  return dict[key] || fallback;
}

function showImportError(message) {
  openAlertModal({
    title: t('import', 'Import'),
    message,
    confirmLabel: t('ok', 'OK'),
  });
}

/**
 * @param {object} api
 * @param {string} definitionType
 * @param {() => array} api.getFields
 * @param {(fields: array) => void} api.setFields
 * @param {() => object} api.getSettings
 * @param {(settings: object) => void} api.applySettings
 * @param {() => { items?: array }|null} [api.getBlockOptions]
 * @param {(next: { items: array }) => void} [api.setBlockOptions]
 * @param {() => void} [api.sync]
 */
export function bindImportExport(api, definitionType) {
  const exportBtn = document.querySelector('[data-bl-blocks-export]');
  const importBtn = document.querySelector('[data-bl-blocks-import]');
  if (!exportBtn && !importBtn) {
    return;
  }

  const fileInput = document.createElement('input');
  fileInput.type = 'file';
  fileInput.accept = 'application/json,.json';
  fileInput.hidden = true;
  document.body.appendChild(fileInput);

  exportBtn?.addEventListener('click', () => {
    const titleInput = document.getElementById('title');
    const title =
      (titleInput && titleInput.value.trim()) ||
      document.querySelector('#title-prompt-text')?.textContent?.trim() ||
      '';
    const settings = { ...(api.getSettings?.() || {}) };
    if (!settings.slug) {
      settings.slug = slugifyFilename(title) || definitionType;
    }
    const payload = {
      type: definitionType,
      title: title || settings.slug || definitionType,
      fields: api.getFields?.() || [],
      settings,
    };
    if (definitionType === 'block' && typeof api.getBlockOptions === 'function') {
      payload.block_options = api.getBlockOptions() || { items: [] };
    }
    const typeSlug =
      definitionType === 'page_settings'
        ? 'content-fields'
        : definitionType === 'site_settings'
          ? 'website-fields'
          : 'block';
    downloadJson(`${slugifyFilename(payload.title)}-${typeSlug}.json`, payload);
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
      showImportError(t('importReadError', 'Could not read the selected file.'));
    };
    reader.onload = () => {
      let parsed;
      try {
        parsed = JSON.parse(String(reader.result || ''));
      } catch (e) {
        showImportError(t('importInvalid', 'This file is not a valid definition export.'));
        return;
      }
      const item = normalizeDefinitionImport(parsed);
      if (!item || !Array.isArray(item.fields)) {
        showImportError(t('importInvalid', 'This file is not a valid definition export.'));
        return;
      }
      if (!definitionTypeMatches(item, definitionType)) {
        showImportError(t('importTypeMismatch', 'This file is for a different definition type.'));
        return;
      }

      openConfirmModal({
        title: t('importOverwriteTitle', 'Import definition?'),
        message: t(
          'importOverwriteMessage',
          'Importing will overwrite your current fields and settings. Block options from the file are applied when present. This cannot be undone.'
        ),
        confirmLabel: t('importOverwriteConfirm', 'Overwrite'),
        cancelLabel: t('cancel', 'Cancel'),
        onConfirm: () => {
          api.setFields?.(item.fields || []);
          if (item.settings && typeof item.settings === 'object') {
            api.applySettings?.(item.settings);
          }
          if (
            definitionType === 'block' &&
            item.block_options &&
            typeof api.setBlockOptions === 'function'
          ) {
            api.setBlockOptions({
              items: Array.isArray(item.block_options.items) ? item.block_options.items : [],
            });
          }
          if (item.title) {
            const titleInput = document.getElementById('title');
            if (titleInput) {
              titleInput.value = String(item.title);
              titleInput.dispatchEvent(new Event('input', { bubbles: true }));
            }
          }
          api.sync?.();
        },
      });
    };
    reader.readAsText(file);
  });
}
