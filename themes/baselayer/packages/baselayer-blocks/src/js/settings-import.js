/**
 * Blocks → Settings → Import / Export: file label + overwrite confirm.
 */
import { openConfirmModal } from './admin/import-export-shared.js';

function t(key, fallback) {
  const dict = (window.blBlocksSettings && window.blBlocksSettings.i18n) || {};
  return dict[key] || fallback;
}

document.addEventListener('DOMContentLoaded', () => {
  const input = document.getElementById('bl_blocks_import_file');
  const form = input?.closest('form');
  if (!input || !form) {
    return;
  }

  const nameEl = input.parentElement?.querySelector('.bl-blocks-settings__file-name');
  input.addEventListener('change', () => {
    if (!nameEl) {
      return;
    }
    const empty = nameEl.getAttribute('data-empty') || '';
    nameEl.textContent = (input.files && input.files[0] && input.files[0].name) || empty;
  });

  let confirmed = false;
  form.addEventListener('submit', (evt) => {
    if (confirmed) {
      confirmed = false;
      return;
    }
    if (!input.files || !input.files[0]) {
      return;
    }
    evt.preventDefault();
    openConfirmModal({
      title: t('importOverwriteTitle', 'Import definitions?'),
      message: t(
        'importOverwriteMessage',
        'Importing will create or update matching definitions by type and slug, and may merge block options into the live store. This cannot be undone.'
      ),
      confirmLabel: t('importOverwriteConfirm', 'Import and overwrite'),
      cancelLabel: t('cancel', 'Cancel'),
      onConfirm: () => {
        confirmed = true;
        const submitBtn = form.querySelector('[name="bl_blocks_import"]');
        if (submitBtn && typeof form.requestSubmit === 'function') {
          form.requestSubmit(submitBtn);
          return;
        }
        // form.submit() omits the submit button name PHP checks for.
        let hidden = form.querySelector('input[type="hidden"][name="bl_blocks_import"]');
        if (!hidden) {
          hidden = document.createElement('input');
          hidden.type = 'hidden';
          hidden.name = 'bl_blocks_import';
          hidden.value = '1';
          form.appendChild(hidden);
        }
        form.submit();
      },
    });
  });
});
